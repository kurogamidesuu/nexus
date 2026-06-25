from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.guilds import GuildCreate, GuildResponse
from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.core.snowflake import snowflake_gen
from app.models.guild import Guild, GuildMember
from app.models.channel import Channel
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