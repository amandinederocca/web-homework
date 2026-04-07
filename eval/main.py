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




SQLITE_URL = f"sqlite:///messages.db"
engine = create_engine(SQLITE_URL)

# this is how we control what is done at startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup logic comes here
    # Create the database and tables if they don't exist
    SQLModel.metadata.create_all(engine)

    yield
    # shutdown logic comes here
    # none so far

app = FastAPI(lifespan=lifespan)

# create a so-called "dependency" to get the database session
def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]
# for now we'll use a single type for all operations on messages
# BUT we'll see later on how to improve that
class Message(SQLModel, table=True):#on créer la classe des messages
    id: int | None = Field(default=None, primary_key=True)
    title: str
    description: str
    sent: bool = False


@app.get("/")
async def root():
    return dict(message="Hello FastAPI World!",
                version=VERSION)
    return RedirectResponse(url="/front/messages")


@app.post("/api/messages")
def create_note(message: Message, session: SessionDep) -> Message:
    session.add(message)
    session.commit()
    session.refresh(message)
    return message

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
        context={"version": VERSION, "notes": messages})

# // the callback attached to clicking the "done" checkbox
# // it is used verbatim in the HTML template
# async function note_done_changed(elt, nodeId) {
#     const done = elt.checked
#     const url = `/api/notes/${nodeId}`
#     const data = { done: done }
#     const response = await fetch(url, {
#       method: "PATCH",
#       headers: {
#         "Content-Type": "application/json",
#       },
#       body: JSON.stringify(data),
#     })
#     if (response.ok) {
#       const data = await response.json()
#       console.log(`${url} returned`, data)
#     } else {
#       console.error("Error updating note done status:", response.statusText)
#     }
#   }




