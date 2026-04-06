from pathlib import Path

import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# -----------------
# CORS setup (it's black magic - keep as-is)
# -----------------
origins = [
    "*"  # allow all origins for simplicity (not recommended for production)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],  # allow all HTTP methods
    allow_headers=["*"],  # allow all headers
)

# -----------------
# CSV data
# -----------------
# spot the data folder
data = Path(__file__).parent.absolute() / 'data'

# load the CSV data into pandas dataframes
associations_df = pd.read_csv(data / 'associations_etudiantes.csv')
evenements_df = pd.read_csv(data / 'evenements_associations.csv')

# -----------------
## your code (route handlers) goes here
# -----------------
@app.get("/api/alive")
def read_root():
    return {"message": "Alive"}

@app.get("/api/associations")
def liste_asso():
    return associations_df.id.tolist()

@app.get("/api/association/<int:id>")
def details_asso(id: int):
    extract= associations_df[associations_df.id==id]
    if extract.empty:
        raise HTTPException(
            status_code=404,
            detail="Asociation not found")
    return extract.to_dict(orient='records')[0]

@app.get("/api/evenements")
def liste_evenements():
    return evenements_df.id.tolist()

@app.get("/api/evenement/<int:id>")
def details_ev(id:int):
    extract=evenements_df[evenements_df.id==id]
    if extract.empty:
        raise HTTPException(
            status_code=404,#renvoyer erreur 404 si ne marche pas
            detail="Evenement not found")
    return extract.to_dict(orient='records')[0]#on renvoie les infos pour l'id demandé

@app.get("/api/association/<int:id>/evenements")
def liste_ev_asso(id:int):
    extract=evenements_df[evenements_df.id==id]#renvoie les événements pour une asso

@app.get("/api/associations/type/<type>")
def liste_asso_partype():

    