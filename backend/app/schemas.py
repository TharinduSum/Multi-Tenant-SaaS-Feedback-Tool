from pydantic import BaseModel, EmailStr
from typing import Optional, List
from .models import UserRole, PostStatus

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class TenantBase(BaseModel):
    company_name: str
    slug: str

class TenantCreate(TenantBase):
    pass

class Tenant(TenantBase):
    id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.USER

class UserCreate(UserBase):
    password: str
    tenant_id: int

class User(UserBase):
    id: int
    tenant_id: int

    class Config:
        orm_mode = True

class PostBase(BaseModel):
    title: str
    description: str
    status: PostStatus = PostStatus.PLANNED

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: int
    user_id: int
    tenant_id: int

    class Config:
        orm_mode = True

class UpvoteBase(BaseModel):
    post_id: int

class UpvoteCreate(UpvoteBase):
    pass

class Upvote(UpvoteBase):
    id: int
    user_id: int
    tenant_id: int

    class Config:
        orm_mode = True
