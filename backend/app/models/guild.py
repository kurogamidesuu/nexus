import datetime
from sqlalchemy import BigInteger, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class GuildMember(Base):
  __tablename__ = "guild_members"

  user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), primary_key=True)
  guild_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("guilds.id"), primary_key=True)
  joined_at: Mapped[datetime.datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now()
  )

class Guild(Base):
  __tablename__ = "guilds"

  id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
  name: Mapped[str] = mapped_column(String, index=True)
  owner_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"))
  created_at: Mapped[datetime.datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now()
  )

  members = relationship("GuildMember", cascade="all, delete-orphan")
  channels = relationship("Channel", back_populates="guild", cascade="all, delete-orphan")