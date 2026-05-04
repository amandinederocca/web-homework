# Projet Whats'app Amandine de Rocca

Ma messagerie type WhatsApp est construite avec FastAPI, SQLModel/SQLite, des WebSockets et un frontend en Jinja2

## Fonctionnalites

- Creation d'utilisateurs et de rooms en ligne de commande
- Choix d'un nom d'utilisateur depuis la page d'accueil
- Souscription / desinscription a chaque groupe
- Page de discussion par groupe:
  - liste des messages, avec auteur
  - composition de nouveaux messages
  - suppression de ses propres messages
- Mise a jour en temps reel via WebSocket

## Lancement

Dans le terminal on demarre le serveur sur en ecrivant:
fastapi dev main.py


## Creation des utilisateurs et rooms

Depuis un autre terminal :

http POST http://localhost:8000/api/users name=alice
http POST http://localhost:8000/api/users name=jean
http POST http://localhost:8000/api/users name=carlotta

http POST http://localhost:8000/api/rooms name=social
http POST http://localhost:8000/api/rooms name=cours de danse
http POST http://localhost:8000/api/rooms name=bde

## Utilisation

Il faut ouvrir http://localhost:8000 dans un navigateur :

1. Choisir le nom d'utilisateur dans la liste (page de login).
2. Rejoindre des groupes
3. Cliquer sur enter pour voir les messages d'une discussion.
4. Envoyer des messages: les autres utilisateurs presents peuvent les voir en rafraichissant la page. (les messages peuvent aussi etre supprimer en cliquant sur la petite poubelle)


## Structure du projet

comment j'ai construit mes documents et ce qu'ils contiennent:
en me basant sur l'exemple donnee sur les notes to-do j'ai creer un dossier static(avec les js et css), un templates(avec le html) et les fichiers python a part pour les users, les discussions et les messages.

- main.py: FastAPI app et endpoints
- broadcaster.py: WebSocket broadcaster (par discussion)
- templates: login.html pour le choix de l'utilisateur, rooms.html pour la liste des discussions et pour les suivre, messages.html pour afficher les messages d'une discussion
- static: - pour donner l'aspect de whats'app: style.css
          - subscriptions.js: toggle abonnement pour suivre une discussion
          - forms-use-json.js: POST en JSON
          - update-backend.js: DELETE message
          - clientside-rendering.js: rendu DOM des evenements WS
          - ws-listener.js: connexion WebSocket


