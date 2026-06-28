from fastapi import APIRouter, Depends, HTTPException

from app.schemas.uploads import UploadRequest
from app.models.user import User
from app.api.deps import get_current_user
from app.core.snowflake import snowflake_gen
from app.core.storage import storage_manager

router = APIRouter(prefix="/api/v1/uploads", tags=["Uploads"])

@router.post("/presigned-url")
async def get_presigned_url(
  req: UploadRequest,
  user: User = Depends(get_current_user)
):
  if not user:
    raise HTTPException(status_code=401, detail="Unauthorized")
  
  unique_file_id = snowflake_gen.generate()
  safe_filename = f"{unique_file_id}_{req.file_name}"

  try:
    urls = await storage_manager.generate_presigned_upload_url(
      file_name=safe_filename,
      content_type=req.content_type
    )
    return urls
  except Exception as e:
    raise HTTPException(status_code=500, detail="Could not generate upload URL")