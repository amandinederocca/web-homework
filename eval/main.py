VERSION = "00"

from fastapi import FastAPI
from contextlib import asynccontextmanager
from sqlmodel import SQLModel, create_engine
from sqlmodel import Session
from sqlmodel import Field
from typing import Annotated
from fastapi.staticfiles import StaticFiles
from fastapi import Depends
from sqlmodel import select
import requests
from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager
from typing import Annotated
from fastapi import WebSocket, WebSocketDisconnect




SQLITE_URL = f"sqlite:///messages.db"
engine = create_engine(SQLITE_URL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)

    yield

app = FastAPI(lifespan=lifespan)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

class UserCreate(SQLModel):
    name: str = Field(description="Username")

class User(UserCreate, table=True):
    id: int | None = Field(default=None, primary_key=True)

class RoomCreate(SQLModel):
    name: str = Field(description="Roomname")

class Room(RoomCreate, table=True):
    id: int | None = Field(default=None, primary_key=True)

class Subscription(SQLModel):
    user_id: int = Field(description="User")
    room_id: int = Field(description="Room")

class MessageCreate(SQLModel):
    author_id: int | None = Field(default=None, description="nom de celui à qui j'envoie le message")
    content: str | None = Field(default=None, description="Le texte du message")
    room_id: int | None = Field(default=None, description="Le texte du message") 

class MessageUpdate(MessageCreate):
    done: bool = Field(default=False, description="Le message est lu ?")

class Message(MessageUpdate, table=True):
    author_id: int | None = Field(default=None, primary_key=True)
    content: str
    room_id: int

@app.get("/")
async def root():
    return dict(message="Hello FastAPI World!",
                version=VERSION)
    return RedirectResponse(url="/front/messages")


@app.post("/api/messages")
async def create_message(message: MessageCreate, session: SessionDep) -> Message:
    db_message = Message.model_validate(message)
    session.add(db_message)
    session.commit()
    session.refresh(db_message)
    await websocket_broadcaster.broadcast(action="create", note=db_message)
    return db_message
    session.add(db_message)
    session.commit()
    session.refresh(db_message)
    await websocket_broadcaster.broadcast(action="update", message=db_message)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_broadcaster.connect(websocket)
    try:
        while True:
            # Optional: handle incoming messages if you want, or just keep alive
            await websocket.receive_text()


@app.get("/api/messages")#on affiche l'intégralité des messages
def get_messages(session: SessionDep) -> list[Message]:
    messages = session.exec(select(Message)).all()
    return messages

@app.get("/api/messages/{message_id}")
def get_messages(message_id: int, session: SessionDep) -> Message | None:
    message = session.get(Message, message_id)
    return message

app.mount("/static", StaticFiles(directory="static"), name="static")

#on veut générer une page html donc un affichage quand le message est créer
templates = Jinja2Templates(directory="templates")
#jinga insert the data from the fastAPI


@app.get("/front/messages", response_class=HTMLResponse)
def notes_page(request: Request, session: SessionDep):
    # get the messages through the API, not directly from the database
    url = request.url_for("get_messages")
    response = requests.get(url)
    if not (200 <= response.status_code < 300):
        raise Exception(f"Error {response.status_code} while getting messages")
    messages = response.json()
    return templates.TemplateResponse(
        request=request,
        name="messages.html",
        context={"version": VERSION, "messages": messages})


@app.delete("/api/messages/{message_id}")
def delete_message(message_id: int, session: SessionDep):
    db_message = session.get(Message, message_author_id)
    if not db_message:
        raise HTTPException(status_code=404, detail=f"Note {message_author_id} not found")
    # delete the message
    session.delete(db_message)
    session.commit()
    return db_message






