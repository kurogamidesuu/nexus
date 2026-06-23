from fastapi import WebSocket

class ConnectionManager:
  def __init__(self):
    self.active_connections = dict()

  async def connect(self, websocket: WebSocket, user_id: str):
    await websocket.accept()
    self.active_connections[user_id] = websocket

  def disconnect(self, user_id: str):
    self.active_connections.pop(user_id, None)

  async def send_personal_message(self, message: dict, user_id: str):
    websocket = self.active_connections.get(user_id)
    if websocket:
      await websocket.send_json(message)
  
  async def broadcast(self, message: dict):
    for websocket in self.active_connections.values():
      await websocket.send_json(message)

manager = ConnectionManager()