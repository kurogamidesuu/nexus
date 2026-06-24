from fastapi import FastAPI
from app.core.snowflake import snowflake_gen
from app.api.routers import users, websockets, channel

app = FastAPI(
  title="Nexus API",
  description="High-performance real-time chat infrastructure",
  version="0.1.0"
)

app.include_router(users.router)
app.include_router(websockets.router)
app.include_router(channel.router)

@app.get("/api/v1/snowflake/generate")
def generate_id():
  new_id = snowflake_gen.generate()
  return { "id": str(new_id), "worker_id": 1 }