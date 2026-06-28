import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator

class ChannelResponse(BaseModel):
  id: str
  guild_id: Optional[str] = None
  name: Optional[str] = None
  created_at: datetime.datetime

  model_config = ConfigDict(from_attributes=True)

  @field_validator("id", "guild_id", mode="before")
  @classmethod
  def cast_to_string(cls, value):
      return str(value)
  
class DMChannelResponse(BaseModel):
   id: str
   recipient_id: str
   recipient_username: str

   @field_validator("id", "recipient_id", mode="before")
   @classmethod
   def cast_to_string(cls, value):
      return str(value)