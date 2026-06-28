from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.schemas.channels import DMChannelResponse
from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.models.channel import Channel, ChannelMember
from app.core.snowflake import snowflake_gen

channel_member_1 = aliased(ChannelMember)
channel_member_2 = aliased(ChannelMember)

router = APIRouter(prefix="/api/v1/dms", tags=["Direct Messages"])

@router.post("/{recipient_id}", response_model=DMChannelResponse)
async def get_or_create_dm(
  recipient_id: int,
  db: AsyncSession = Depends(get_db),
  current_user: User = Depends(get_current_user)
):
  if current_user.id == recipient_id:
    raise HTTPException(status_code=400, detail="You cannot message yourself.")
  
  recipient_query = select(User).where(User.id == recipient_id)
  recipient_result = await db.execute(recipient_query)
  recipient = recipient_result.scalars().first()

  if not recipient:
    raise HTTPException(status_code=404, detail="User not found.")
  
  dm_query = (
    select(channel_member_1.channel_id)
    .join(channel_member_2, channel_member_1.channel_id == channel_member_2.channel_id)
    .where(
      channel_member_1.user_id == current_user.id,
      channel_member_2.user_id == recipient_id,
    )
    .limit(1)
  )
  dm_result = await db.execute(dm_query)
  dm_id = dm_result.scalars().first()
  
  if not dm_id:
    new_dm_id = snowflake_gen.generate()
    new_dm = Channel(id=new_dm_id, guild_id=None, channel_type=1)
    new_channel_member_1 = ChannelMember(channel_id=new_dm_id, user_id=current_user.id)
    new_channel_member_2 = ChannelMember(channel_id=new_dm_id, user_id=recipient_id)
    db.add_all([new_dm, new_channel_member_1, new_channel_member_2])
    await db.commit()

    dm_id = new_dm_id

  return {
    "id": str(dm_id),
    "recipient_id": str(recipient.id),
    "recipient_username": recipient.username
  }

@router.get("/", response_model=list[DMChannelResponse])
async def get_my_dms(
  db: AsyncSession = Depends(get_db),
  current_user: User = Depends(get_current_user)
):
  dm_query = (
    select(Channel.id)
    .join(ChannelMember, ChannelMember.channel_id == Channel.id)
    .where(
      (ChannelMember.user_id == current_user.id) &
      (Channel.channel_type == 1)
    )
  )
  dm_result = await db.execute(dm_query)
  dm_ids = dm_result.scalars().all()

  dms_list = []
  if dm_ids:
    for dm_id in dm_ids:
      query = (
        select(User)
        .join(ChannelMember, ChannelMember.user_id == User.id)
        .where(
          (ChannelMember.channel_id == dm_id) &
          (User.id != current_user.id)
        )
      )
      result = await db.execute(query)
      recipient = result.scalars().first()

      if not recipient:
        continue

      dms_list.append({
        "id": str(dm_id),
        "recipient_id": str(recipient.id),
        "recipient_username": recipient.username
      })
  
  return dms_list
