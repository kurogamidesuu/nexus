from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.guilds import GuildCreate, GuildResponse
from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.core.snowflake import snowflake_gen
from app.models.guild import Guild, GuildMember
from app.models.channel import Channel

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
