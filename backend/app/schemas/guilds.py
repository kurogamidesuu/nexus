from pydantic import BaseModel, ConfigDict, field_validator

class GuildCreate(BaseModel):
  name: str

class GuildResponse(BaseModel):
  id: str
  name: str
  owner_id: str

  model_config = ConfigDict(from_attributes=True)

  @field_validator("id", "owner_id", mode="before")
  @classmethod
  def cast_to_string(cls, value):
      return str(value)