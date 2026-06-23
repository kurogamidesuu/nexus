import os
import bcrypt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import jwt

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

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

  to_encode.update({"exp": expire})

  encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  return encoded_jwt