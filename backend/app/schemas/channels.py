import datetime
from pydantic import BaseModel, ConfigDict, field_validator

class ChannelResponse(BaseModel):
  id: str
  guild_id: str
  name: str
  created_at: datetime.datetime

  model_config = ConfigDict(from_attributes=True)

  @field_validator("id", "guild_id", mode="before")
  @classmethod
  def cast_to_string(cls, value):
      return str(value)