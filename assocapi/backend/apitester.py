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

@app.get("/api/association/{id}")
def details_asso(id: int):
    extract= associations_df[associations_df.id==id]
    if extract.empty:
        raise HTTPException(
            status_code=404,
            detail="Asociation not found")
    return extract.to_dict(orient='records')[0]#renvoie une liste de dictionnaires json

@app.get("/api/evenements")
def liste_evenements():
    return evenements_df.id.tolist()

@app.get("/api/evenement/{id}")
def details_ev(id:int):
    extract=evenements_df[evenements_df.id==id]
    if extract.empty:
        raise HTTPException(
            status_code=404,#renvoyer erreur 404 si ne marche pas
            detail="Evenement not found")
    return extract.to_dict(orient='records')[0]#on renvoie les infos pour l'id demandé

@app.get("/api/association/{id}/evenements")
def liste_ev_asso(id: int):
    # récupère les événements dont la colonne 'association_id' correspond à l'ID reçu
    extract = evenements_df[evenements_df.association_id == id]
    return extract.to_dict(orient='records')#on renvoie la liste des dico d'évènements de cette asso

@app.get("/api/associations/type/{type}")
def liste_asso_partype(type: str):
    #filtre les associations par la colonne 'type'
    extract = associations_df[associations_df.type == type]
    return extract.to_dict(orient='records')#renvoie la liste des dico des assos par type


    