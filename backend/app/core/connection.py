from collections import defaultdict
from fastapi import WebSocket

class ConnectionManager:
  def __init__(self):
    self.active_connections: dict[str, WebSocket] = {}
    self.channel_subscriptions: dict[str, set[str]] = defaultdict(set)

  async def connect(self, websocket: WebSocket, user_id: str):
    await websocket.accept()
    self.active_connections[user_id] = websocket

  def disconnect(self, user_id: str):
    self.active_connections.pop(user_id, None)

    for subscribers in self.channel_subscriptions.values():
      subscribers.discard(user_id)

  def subscribe_to_channel(self, user_id: str, channel_id: str):
    self.channel_subscriptions[channel_id].add(user_id)

  def unsubscribe_from_channel(self, user_id: str, channel_id: str):
    self.channel_subscriptions[channel_id].discard(user_id)

  async def send_personal_message(self, message: dict, user_id: str):
    websocket = self.active_connections.get(user_id)
    if websocket:
      await websocket.send_json(message)
  
  async def broadcast_to_channel(self, channel_id: str, message: dict):
    subscribers = self.channel_subscriptions.get(channel_id, set())

    for user_id in subscribers:
      websocket = self.active_connections.get(user_id)
      if websocket:
        await websocket.send_json(message)

manager = ConnectionManager()