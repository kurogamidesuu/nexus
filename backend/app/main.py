from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.snowflake import snowflake_gen
from app.api.routers import users, websockets, channel, guilds, uploads, dms

app = FastAPI(
  title="Nexus API",
  description="High-performance real-time chat infrastructure",
  version="0.1.0"
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(websockets.router)
app.include_router(channel.router)
app.include_router(guilds.router)
app.include_router(uploads.router)
app.include_router(dms.router)

@app.get("/api/v1/snowflake/generate")
def generate_id():
  new_id = snowflake_gen.generate()
  return { "id": str(new_id), "worker_id": 1 }