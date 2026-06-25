import datetime
from sqlalchemy import BigInteger, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Channel(Base):
  __tablename__ = "channels"

  id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
  guild_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("guilds.id"), index=True)
  name: Mapped[str] = mapped_column(String)
  created_at: Mapped[datetime.datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now()
  )

  guild = relationship("Guild", back_populates="channels")