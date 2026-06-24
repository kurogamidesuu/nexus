import datetime
from sqlalchemy import BigInteger, DateTime, ForeignKey, String, func
from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Message(Base):
  __tablename__ = "messages"

  id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
  channel_id: Mapped[str] = mapped_column(String, index=True)
  user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"))
  content: Mapped[str] = mapped_column(String)
  created_at: Mapped[datetime.datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now()
  )

  sender = relationship("User", lazy="joined")