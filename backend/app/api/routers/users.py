from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.user import UserCreate, UserResponse
from app.core.database import get_db
from app.models.user import User
from app.core.snowflake import snowflake_gen
from app.core.security import ALGORITHM, SECRET_KEY, create_access_token, create_refresh_token, get_password_hash, verify_password
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
  response: Response,
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
  
  token_payload = {
    "sub": str(user.id)
  }

  access_token = create_access_token(token_payload)
  refresh_token = create_refresh_token(token_payload)

  response.set_cookie(
    key="refresh_token",
    value=refresh_token,
    httponly=True,
    secure=False,
    samesite="lax",
    max_age=7 * 24 * 60 * 60,
    path="/"
  )

  return {
    "access_token": access_token,
    "token_type": "bearer"
  }

@router.post("/refresh")
async def refresh_access_token(
  refresh_token: str | None = Cookie(None),
  db: AsyncSession = Depends(get_db)
):
  credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Failed to validate credentials",
  )
  
  if not refresh_token:
    raise credentials_exception
  
  try:
    payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload.get("type") != "refresh":
      raise credentials_exception
    
    user_id_str = payload.get("sub")
    if user_id_str is None:
      raise credentials_exception
    
  except jwt.InvalidTokenError:
    raise credentials_exception
  
  query = select(User).where(User.id == int(user_id_str))
  result = await db.execute(query)
  user = result.scalars().first()

  if not user:
    raise credentials_exception
  
  new_access_token = create_access_token({"sub": str(user.id)})

  return {
    "access_token": new_access_token,
    "token_type": "bearer"
  }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
  return current_user

@router.post("/logout")
async def logout_user(response: Response):
  response.delete_cookie(
    key="refresh_token",
    path="/",
    httponly=True,
    secure=False,
    samesite="lax"
  )

  return {"detail": "Successfully logged out"}