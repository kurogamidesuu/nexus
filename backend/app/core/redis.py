import redis.asyncio as redis
import json
import logging

logger = logging.getLogger(__name__)

redis_client = redis.Redis.from_url("redis://localhost:6379", decode_responses=True)

class RedisPubSubManager:
  def __init__(self):
    self.pubsub = redis_client.pubsub()
    self.CHANNEL_NAME = "nexus_global_chat"

  async def connect(self):
    await self.pubsub.subscribe(self.CHANNEL_NAME)
    logger.info("Connected to Redis Pub/Sub cluster.")

  async def publish_message(self, message: dict):
    await redis_client.publish(self.CHANNEL_NAME, json.dumps(message))

  async def listen(self):
    async for message in self.pubsub.listen():
      if message["type"] == "message":
        yield json.loads(message["data"])

  async def set_user_online(self, user_id: str):
    await redis_client.sadd("nexus_online_users", user_id)

  async def set_user_offline(self, user_id: str):
    await redis_client.srem("nexus_online_users", user_id)

  async def get_online_users(self) -> list[str]:
    users = await redis_client.smembers("nexus_online_users")
    return [str(user) for user in users]

redis_manager = RedisPubSubManager()