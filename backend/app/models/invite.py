import datetime
import secrets
from sqlalchemy import BigInteger, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

def generate_invite_code() -> str:
  return secrets.token_urlsafe(6)

class Invite(Base):
  __tablename__ = "invites"

  code: Mapped[str] = mapped_column(String, primary_key=True, default=generate_invite_code)
  guild_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("guilds.id", ondelete="CASCADE"), index=True)
  inviter_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"))
  created_at: Mapped[datetime.datetime] = mapped_column(
    DateTime(timezone=True), 
    server_default=func.now()
  )

  guild = relationship("Guild")