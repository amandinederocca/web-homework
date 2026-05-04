
from typing import Literal
import asyncio
from fastapi import WebSocket

Action = Literal["create", "update", "delete"]


class WebSocketBroadcaster:
    """
    Liste les connections aux websocket et diffuse les messages. Chaque connection est associée à une discussion donc on ne diffuse qu'aux membres de la discussion
    """

    def __init__(self):
        self.active_connections: list[tuple[WebSocket, int]] = []

    async def connect(self, websocket: WebSocket, room_id: int):
        await websocket.accept()
        self.active_connections.append((websocket, room_id))

    def disconnect(self, websocket: WebSocket):
        self.active_connections = [
            (ws, rid) for (ws, rid) in self.active_connections if ws is not websocket
        ]

    async def broadcast(self, action: Action, message):
        if hasattr(message, "model_dump"):
            payload_message = message.model_dump()
        else:
            payload_message = dict(message)

        room_id = payload_message.get("room_id")
        payload = {"action": action, "message": payload_message}

        targets = [ws for (ws, rid) in self.active_connections if rid == room_id]
        if not targets:
            return

        coros = [ws.send_json(payload) for ws in targets]
        results = await asyncio.gather(*coros, return_exceptions=True)

        for ws, result in zip(targets, results):
            if isinstance(result, Exception):
                self.disconnect(ws)

