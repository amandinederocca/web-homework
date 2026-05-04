VERSION="01"

from contextlib import asynccontextmanager
from datetime import datetime
from typing import Annotated

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Request,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlmodel import Field, Session, SQLModel, create_engine, select

from broadcaster import WebSocketBroadcaster

# database setup
SQLITE_URL = "sqlite:///messages.db"
engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(lifespan=lifespan, title="Whats'app")
websocket_broadcaster = WebSocketBroadcaster()


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


# creation of the class
class UserCreate(SQLModel):
    name: str = Field(description="Username")


class User(UserCreate, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)


class RoomCreate(SQLModel):
    name: str = Field(description="Room name")


class Room(RoomCreate, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)


class Subscription(SQLModel, table=True):
    """A user subscribed to a room (composite primary key)."""
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    room_id: int = Field(foreign_key="room.id", primary_key=True)


class MessageCreate(SQLModel):
    author_id: int = Field(description="ID of the author")
    room_id: int = Field(description="ID of the room")
    content: str = Field(description="Text of the message")


class Message(MessageCreate, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# API — Users
@app.post("/api/users", response_model=User)
def create_user(user: UserCreate, session: SessionDep):
    existing = session.exec(select(User).where(User.name == user.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"User '{user.name}' already exists")
    db_user = User.model_validate(user)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@app.get("/api/users", response_model=list[User])
def get_users(session: SessionDep):
    return session.exec(select(User)).all()


@app.get("/api/users/{user_id}", response_model=User)
def get_user(user_id: int, session: SessionDep):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return user


# API — Rooms
@app.post("/api/rooms", response_model=Room)
def create_room(room: RoomCreate, session: SessionDep):
    existing = session.exec(select(Room).where(Room.name == room.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Room '{room.name}' already exists")
    db_room = Room.model_validate(room)
    session.add(db_room)
    session.commit()
    session.refresh(db_room)
    return db_room


@app.get("/api/rooms", response_model=list[Room])
def get_rooms(session: SessionDep):
    return session.exec(select(Room)).all()


# API — Subscriptions

@app.get("/api/users/{user_id}/subscriptions", response_model=list[Room])
def get_user_subscriptions(user_id: int, session: SessionDep):
    """Return the list of rooms a user is subscribed to."""
    statement = (
        select(Room)
        .join(Subscription, Subscription.room_id == Room.id)
        .where(Subscription.user_id == user_id)
    )
    return session.exec(statement).all()


@app.post("/api/subscriptions")
def subscribe(sub: Subscription, session: SessionDep):
    existing = session.get(Subscription, (sub.user_id, sub.room_id))
    if existing:
        return existing
    session.add(sub)
    session.commit()
    return sub


@app.delete("/api/subscriptions")
def unsubscribe(user_id: int, room_id: int, session: SessionDep):
    sub = session.get(Subscription, (user_id, room_id))
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    session.delete(sub)
    session.commit()
    return {"deleted": True}


# API — Messages

@app.post("/api/messages", response_model=Message)
async def create_message(message: MessageCreate, session: SessionDep):
    # validate that author + room exist
    if not session.get(User, message.author_id):
        raise HTTPException(status_code=404, detail="Author not found")
    if not session.get(Room, message.room_id):
        raise HTTPException(status_code=404, detail="Room not found")

    db_message = Message.model_validate(message)
    session.add(db_message)
    session.commit()
    session.refresh(db_message)

    # broadcast the new message to everyone watching the room
    await websocket_broadcaster.broadcast(action="create", message=db_message)
    return db_message


@app.get("/api/rooms/{room_id}/messages", response_model=list[Message])
def get_room_messages(room_id: int, session: SessionDep):
    statement = (
        select(Message)
        .where(Message.room_id == room_id)
        .order_by(Message.created_at)
    )
    return session.exec(statement).all()


@app.delete("/api/messages/{message_id}")
async def delete_message(message_id: int, session: SessionDep):
    db_message = session.get(Message, message_id)
    if not db_message:
        raise HTTPException(status_code=404, detail=f"Message {message_id} not found")
    snapshot = db_message.model_dump()
    session.delete(db_message)
    session.commit()
    await websocket_broadcaster.broadcast(action="delete", message=snapshot)
    return {"deleted": True}


# WebSocket — une connection par (utilisateur, discussion)

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: int):
    """
    The client opens a WebSocket and never sends anything — it only
    receives broadcasts. We just need to keep the connection alive
    until the client disconnects.
    """
    await websocket_broadcaster.connect(websocket, room_id)
    try:
        while True:
            await websocket.receive()
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        print(f"WebSocket error on room {room_id}: {exc}")
    finally:
        websocket_broadcaster.disconnect(websocket)


# Frontend (Jinja2)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def root():
    return RedirectResponse(url="/front/login")


@app.get("/front/login", response_class=HTMLResponse)
def login_page(request: Request, session: SessionDep):
    """Page where the user picks one of the existing names."""
    users = session.exec(select(User)).all()
    return templates.TemplateResponse(
        request=request,
        name="login.html",
        context={"version": VERSION, "users": users},
    )


@app.get("/front/rooms", response_class=HTMLResponse)
def rooms_page(request: Request, user_id: int, session: SessionDep):
    """Page listing all rooms with subscribe/unsubscribe + enter."""
    user = session.get(User, user_id)
    if not user:
        return RedirectResponse(url="/front/login")
    rooms = session.exec(select(Room)).all()
    subscribed_rooms = session.exec(
        select(Subscription.room_id).where(Subscription.user_id == user_id)
    ).all()
    subscribed_ids = set(subscribed_rooms)
    return templates.TemplateResponse(
        request=request,
        name="rooms.html",
        context={
            "version": VERSION,
            "user": user,
            "rooms": rooms,
            "subscribed_ids": subscribed_ids,
        },
    )


@app.get("/front/rooms/{room_id}", response_class=HTMLResponse)
def messages_page(request: Request, room_id: int, user_id: int, session: SessionDep):
    """Inside-the-room page : message list + composer."""
    user = session.get(User, user_id)
    room = session.get(Room, room_id)
    if not user or not room:
        return RedirectResponse(url="/front/login")

    
    statement = (
        select(Message, User.name)
        .join(User, User.id == Message.author_id)
        .where(Message.room_id == room_id)
        .order_by(Message.created_at)
    )
    rows = session.exec(statement).all()
    messages = [
        {
            "id": m.id,
            "author_id": m.author_id,
            "author_name": author_name,
            "room_id": m.room_id,
            "content": m.content,
            "created_at": m.created_at.isoformat(),
        }
        for (m, author_name) in rows
    ]

    users = {u.id: u.name for u in session.exec(select(User)).all()}

    return templates.TemplateResponse(
        request=request,
        name="messages.html",
        context={
            "version": VERSION,
            "user": user,
            "room": room,
            "messages": messages,
            "users": users,
        },
    )






