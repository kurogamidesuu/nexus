import asyncio
from collections import defaultdict
from fastapi import WebSocket
from app.core.redis import redis_manager

class ConnectionManager:
  def __init__(self):
    self.active_connections: dict[str, WebSocket] = {}
    self.channel_subscriptions: dict[str, set[str]] = defaultdict(set)
    self.redis_listening = False
  
  async def start_redis_listener(self):
    if self.redis_listening:
      return
    self.redis_listening = True

    await redis_manager.connect()
    asyncio.create_task(self._listen_to_redis())
  
  async def _listen_to_redis(self):
    async for message_data in redis_manager.listen():
      channel_id = message_data.get("channel_id")
      if channel_id:
        await self.broadcast_to_channel(channel_id, message_data)

  async def connect(self, websocket: WebSocket, user_id: str):
    await websocket.accept()
    self.active_connections[user_id] = websocket

    await self.start_redis_listener()

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

    for user_id in list(subscribers):
      websocket = self.active_connections.get(user_id)
      if websocket:
        try:
          await websocket.send_json(message)
        except Exception:
          self.disconnect(user_id)

manager = ConnectionManager()