import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


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

  @field_validator('id', mode='before')
  @classmethod
  def convert_id_to_str(cls, value):
    return str(value)

