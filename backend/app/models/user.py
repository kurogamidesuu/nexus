import datetime
from sqlalchemy import BigInteger, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class User(Base):
  __tablename__ = "users"

  id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
  username: Mapped[str] = mapped_column(String, unique=True, index=True)
  email: Mapped[str] = mapped_column(String, unique=True, index=True)
  hashed_password: Mapped[str] = mapped_column(String)
  created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())