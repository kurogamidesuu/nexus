from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.user import UserCreate, UserResponse
from app.core.database import get_db
from app.models.user import User
from app.core.snowflake import snowflake_gen
from app.core.security import create_access_token, get_password_hash, verify_password
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/v1/users", tags=["Users"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_input: UserCreate, db: AsyncSession = Depends(get_db)):
  query = select(User).where((User.email == user_input.email) | (User.username == user_input.username))
  result = await db.execute(query)
  existing_user = result.scalars().first()

  if existing_user:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Username or email already registered"
    )
  
  id = snowflake_gen.generate()
  hashed_password = get_password_hash(user_input.password)

  new_user = User(
    id=id,
    username=user_input.username,
    email=user_input.email,
    hashed_password=hashed_password
  )

  db.add(new_user)
  await db.commit()
  await db.refresh(new_user)

  return new_user

@router.post("/login")
async def login_user(
  form_data: OAuth2PasswordRequestForm = Depends(),
  db: AsyncSession = Depends(get_db)
):
  query = select(User).where((User.username == form_data.username))
  result = await db.execute(query)
  user = result.scalars().first()

  if not user or not verify_password(form_data.password, user.hashed_password):
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Incorrect username or password",
      headers={"WWW-Authenticate": "Bearer"},
    )
  
  access_token_payload = {
    "sub": str(user.id)
  }

  access_token = create_access_token(access_token_payload)

  return {
    "access_token": access_token,
    "token_type": "bearer"
  }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
  return current_user