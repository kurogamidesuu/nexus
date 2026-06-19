from fastapi import FastAPI
from app.core.snowflake import SnowflakeGenerator

app = FastAPI(
  title="Nexus API",
  description="High-performance real-time chat infrastructure",
  version="0.1.0"
)

snowflake_gen = SnowflakeGenerator(worker_id=1)

@app.get("/api/v1/snowflake/generate")
def generate_id():
  new_id = snowflake_gen.generate()

  return { "id": str(new_id), "worker_id": 1 }