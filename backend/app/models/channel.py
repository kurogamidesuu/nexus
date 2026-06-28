import datetime
from typing import Optional
from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Channel(Base):
  __tablename__ = "channels"

  id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
  name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
  guild_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("guilds.id", ondelete="CASCADE"), index=True, nullable=True)
  channel_type: Mapped[int] = mapped_column(Integer, default=0)
  created_at: Mapped[datetime.datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now()
  )

  guild = relationship("Guild", back_populates="channels")

class ChannelMember(Base):
  __tablename__ = "channel_members"

  channel_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("channels.id", ondelete="CASCADE"), primary_key=True)
  user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
  joined_at: Mapped[datetime.datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now()
  )