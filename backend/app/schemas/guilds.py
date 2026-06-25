from pydantic import BaseModel, ConfigDict

class GuildCreate(BaseModel):
  name: str

class GuildResponse(BaseModel):
  id: str
  name: str
  owner_id: str

  model_config = ConfigDict(from_attributes=True)