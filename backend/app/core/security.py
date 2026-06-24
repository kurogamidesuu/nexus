import os
import bcrypt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import jwt

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

def get_password_hash(password: str) -> str:
  pwd_bytes = password.encode('utf-8')
  salt = bcrypt.gensalt()
  hashed_password = bcrypt.hashpw(pwd_bytes, salt)

  return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
  plain_password_bytes = plain_password.encode('utf-8')
  hashed_password_bytes = hashed_password.encode('utf-8')

  return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)

def create_access_token(data: dict) -> str:
  to_encode = data.copy()
  expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  to_encode.update({"exp": expire, "type": "access"})

  return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
  to_encode = data.copy()
  expire = datetime.now(timezone.utc) + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
  to_encode.update({"exp": expire, "type": "refresh"})

  return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)