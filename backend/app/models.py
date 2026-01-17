from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from .database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class PostStatus(str, enum.Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), unique=True, index=True)
    slug = Column(String(255), unique=True, index=True)

    users = relationship("User", back_populates="tenant")
    posts = relationship("Post", back_populates="tenant")
    upvotes = relationship("Upvote", back_populates="tenant")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password_hash = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.USER)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))

    tenant = relationship("Tenant", back_populates="users")
    posts = relationship("Post", back_populates="user")
    upvotes = relationship("Upvote", back_populates="user")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    description = Column(Text)
    status = Column(Enum(PostStatus), default=PostStatus.PLANNED)
    user_id = Column(Integer, ForeignKey("users.id"))
    tenant_id = Column(Integer, ForeignKey("tenants.id"))

    user = relationship("User", back_populates="posts")
    tenant = relationship("Tenant", back_populates="posts")
    upvotes = relationship("Upvote", back_populates="post")

class Upvote(Base):
    __tablename__ = "upvotes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))
    tenant_id = Column(Integer, ForeignKey("tenants.id"))

    user = relationship("User", back_populates="upvotes")
    post = relationship("Post", back_populates="upvotes")
    tenant = relationship("Tenant", back_populates="upvotes")
