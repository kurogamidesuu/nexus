from math import e

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import jwt
from jwt.exceptions import InvalidTokenError

from app.core.database import get_db
from app.models.user import User
from app.models.message import Message
from app.core.snowflake import snowflake_gen
from app.core.security import ALGORITHM, SECRET_KEY
from app.core.connection import manager

router = APIRouter(prefix="/api/v1", tags=["Gateway"])

async def get_ws_current_user(
    websocket: WebSocket,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
) -> User | None:
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    user_id_str = payload.get("sub")
    if user_id_str is None:
      return None
    
    query = select(User).where(User.id == int(user_id_str))
    result = await db.execute(query)
    user = result.scalars().first()
    return user
  except InvalidTokenError:
    return None

@router.websocket("/ws")
async def websocket_endpoint(
  websocket: WebSocket,
  user: User | None = Depends(get_ws_current_user),
  db: AsyncSession = Depends(get_db)
):
  if user is None:
    await websocket.close(code=1008)
    return
  
  await manager.connect(websocket, str(user.id))

  try:
    while True:
      try:
        data = await websocket.receive_json()
      except WebSocketDisconnect:
        raise
      except Exception:
        await websocket.send_json({"error": "Invalid JSON format"})
        continue

      action = data.get("action")
      channel_id = data.get("channel_id")

      if not action or not channel_id:
        continue

      if action == "subscribe":
        manager.subscribe_to_channel(str(user.id), channel_id)
      elif action == "message":
        content = data.get("content")
        if content:
          msg_id = snowflake_gen.generate()
          new_message = Message(
            id=msg_id,
            channel_id=channel_id,
            user_id=user.id,
            content=content,
          )

          db.add(new_message)
          await db.commit()
          await db.refresh(new_message)

          payload = {
            "id": str(new_message.id),
            "sender": user.username,
            "channel_id": new_message.channel_id,
            "content": new_message.content,
            "created_at": new_message.created_at.isoformat()
          }

          await manager.broadcast_to_channel(channel_id, payload)
  except WebSocketDisconnect:
    manager.disconnect(str(user.id))
    