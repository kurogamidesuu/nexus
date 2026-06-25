import datetime
from pydantic import BaseModel, ConfigDict

class ChannelResponse(BaseModel):
  id: str
  guild_id: str
  name: str
  created_at: datetime.datetime

  model_config = ConfigDict(from_attributes=True)