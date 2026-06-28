from fileinput import filename
import logging
import os
import aioboto3

logger = logging.getLogger(__name__)

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

session = aioboto3.Session(
  aws_access_key_id=AWS_ACCESS_KEY_ID,
  aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
  region_name=AWS_REGION
)

class StorageManager:
  async def generate_presigned_upload_url(self, file_name: str, content_type: str) -> dict:
    async with session.client("s3", endpoint_url=S3_ENDPOINT_URL, region_name=AWS_REGION) as s3_client:
      try:
        presigned_url = await s3_client.generate_presigned_url(
          ClientMethod='put_object',
          Params={
            'Bucket': S3_BUCKET_NAME,
            'Key': file_name,
            'ContentType': content_type
          },
          ExpiresIn=60
        )

        public_url = f"{S3_ENDPOINT_URL}/{S3_BUCKET_NAME}/{file_name}"

        return {
          "upload_url": presigned_url,
          "public_url": public_url,
        }
      except Exception as e:
        logger.error(f"Failed to generate presigned URL: {e}")
        raise

storage_manager = StorageManager()