from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.message import MessageResponse
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.message import Message

router = APIRouter(prefix="/api/v1/channels", tags=["Channels"])

@router.get("/{channel_id}/messages", response_model=list[MessageResponse])
async def get_channel_messages(
  channel_id: str,
  limit: int = 50,
  db: AsyncSession = Depends(get_db),
  current_user: User = Depends(get_current_user)
):
  query = select(Message).where(Message.channel_id == channel_id).order_by(Message.created_at.desc()).limit(limit)
  result = await db.execute(query)
  messages = result.scalars().all()

  return messages[::-1]