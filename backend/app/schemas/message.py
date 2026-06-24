import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class MessageSender(BaseModel):
  username: str

class MessageResponse(BaseModel):
  id: str
  channel_id: str
  user_id: str
  content: str
  created_at: datetime.datetime

  sender: MessageSender

  model_config = ConfigDict(from_attributes=True)

  @field_validator('id', 'user_id', mode="before")
  @classmethod
  def convert_ids_to_str(cls, value):
    return str(value)