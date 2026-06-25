from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.guilds import GuildCreate, GuildResponse
from app.core.database import get_db
from app.models.user import User
from app.models.guild import Guild, GuildMember
from app.models.channel import Channel
from app.models.invite import Invite
from app.api.deps import get_current_user
from app.core.snowflake import snowflake_gen
from app.schemas.channels import ChannelResponse

router = APIRouter(prefix="/api/v1/guilds", tags=["Guilds"])

@router.post("/", response_model=GuildResponse, status_code=status.HTTP_201_CREATED)
async def create_guild(
  guild_in: GuildCreate,
  db: AsyncSession = Depends(get_db),
  current_user: User = Depends(get_current_user)
):
  guild_id = snowflake_gen.generate()
  channel_id = snowflake_gen.generate()

  new_guild = Guild(
    id=guild_id,
    name=guild_in.name,
    owner_id=current_user.id,
  )

  default_channel = Channel(
    id=channel_id,
    guild_id=guild_id,
    name="general",
  )

  new_member = GuildMember(
    user_id=current_user.id,
    guild_id=guild_id,
  )

  db.add(new_guild)
  db.add(default_channel)
  db.add(new_member)
  await db.commit()
  await db.refresh(new_guild)

  return {
    "id": str(new_guild.id),
    "name": new_guild.name,
    "owner_id": str(new_guild.owner_id)
  }

@router.get("/me", response_model=list[GuildResponse])
async def get_my_guilds(
  db: AsyncSession = Depends(get_db),
  current_user: User = Depends(get_current_user)
):
  query = select(Guild).join(GuildMember).where(GuildMember.user_id == current_user.id)
  result = await db.execute(query)
  guilds_list = result.scalars().all()

  return guilds_list

@router.get("/{guild_id}/channels", response_model=list[ChannelResponse])
async def get_guild_channels(
  guild_id: int,
  db: AsyncSession = Depends(get_db),
  current_user: User = Depends(get_current_user),
):
  query = select(Channel).where(Channel.guild_id == guild_id)
  result = await db.execute(query)
  channels_list = result.scalars().all()

  return channels_list

@router.post("/{guild_id}/invites", response_model=dict)
async def create_invite(
  guild_id: int,
  db: AsyncSession = Depends(get_db),
  current_user: User = Depends(get_current_user)
):
  query = select(GuildMember).where(
    (GuildMember.guild_id == guild_id) &
    (GuildMember.user_id == current_user.id)
  )
  result = await db.execute(query)
  if not result.scalars().first():
    raise HTTPException(status_code=403, detail="You do not have permission to invite users to this server.")
  
  new_invite = Invite(guild_id=guild_id, inviter_id=current_user.id)
  db.add(new_invite)
  await db.commit()
  await db.refresh(new_invite)

  return {"code": new_invite.code}

@router.post("/join/{code}", response_model=GuildResponse)
async def join_guild(
  code: str,
  db: AsyncSession = Depends(get_db),
  current_user: User = Depends(get_current_user)
):
  query = select(Invite).where(Invite.code == code)
  result = await db.execute(query)
  invite = result.scalars().first()

  if not invite:
    raise HTTPException(status_code=404, detail="Invalid or expired invite code.")
  
  query = select(GuildMember).where(
    (GuildMember.user_id == current_user.id) &
    (GuildMember.guild_id == invite.guild_id)
  )
  result = await db.execute(query)
  existing_member = result.scalars().first()

  if existing_member:
    raise HTTPException(status_code=400, detail="You are already a member of this server.")
  
  new_member = GuildMember(user_id=current_user.id, guild_id=invite.guild_id)
  db.add(new_member)
  await db.commit()

  guild_query = select(Guild).where(Guild.id == invite.guild_id)
  guild_result = await db.execute(guild_query)
  joined_guild = guild_result.scalars().first()

  if not joined_guild:
    raise HTTPException(status_code=404, detail="Something went wrong! Could not find the joined guild.")

  return {
    "id": str(joined_guild.id),
    "name": joined_guild.name,
    "owner_id": str(joined_guild.owner_id)
  }