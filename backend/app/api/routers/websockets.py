from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import jwt
from jwt.exceptions import InvalidTokenError

from app.core.database import get_db
from app.models.user import User
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
  user: User | None = Depends(get_ws_current_user)
):
  if user is None:
    await websocket.close(code=1008)
    return
  
  await manager.connect(websocket, str(user.id))

  try:
    while True:
      data = await websocket.receive_text()
      payload = {
        "sender": user.username,
        "content": data
      }
      await manager.broadcast(payload)
  except WebSocketDisconnect:
    manager.disconnect(str(user.id))
    