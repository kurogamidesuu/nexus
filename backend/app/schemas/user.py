import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
  username: str
  email: EmailStr
  password: str

class UserResponse(BaseModel):
  id: str
  username: str
  email: str
  created_at: datetime.datetime

  model_config = ConfigDict(from_attributes=True)

