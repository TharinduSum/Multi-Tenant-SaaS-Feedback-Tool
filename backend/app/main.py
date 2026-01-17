from fastapi import FastAPI, Depends, HTTPException, status, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from dotenv import load_dotenv
from . import models, schemas, auth, database
from .database import engine

load_dotenv()

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Load CORS origins from environment
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Middleware / Dependency for Tenant ID
async def get_tenant_id(x_tenant_id: Optional[str] = Header(None)):
    if x_tenant_id is None:
        # For some public endpoints or super admin, maybe it's optional?
        # But for scoping queries, we usually need it.
        # Letting it be None for now, but endpoints usage will enforce it.
        return None
    return int(x_tenant_id)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except auth.JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

# --- Auth Endpoints ---

@app.post("/auth/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Ideally verify tenant exists
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        tenant_id=user.tenant_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Tenant Endpoint (Helper to create a tenant for testing) ---
@app.get("/tenants", response_model=List[schemas.Tenant])
def get_tenants(db: Session = Depends(get_db)):
    return db.query(models.Tenant).all()
@app.post("/tenants", response_model=schemas.Tenant)
def create_tenant(tenant: schemas.TenantCreate, db: Session = Depends(get_db)):
    db_tenant = models.Tenant(company_name=tenant.company_name, slug=tenant.slug)
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant

# --- Feedback/Post Endpoints ---

@app.get("/posts", response_model=List[schemas.Post])
def get_posts(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    tenant_id: int = Depends(get_tenant_id)
):
    if not tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-ID header required")
    posts = db.query(models.Post).filter(models.Post.tenant_id == tenant_id).offset(skip).limit(limit).all()
    return posts

@app.post("/posts", response_model=schemas.Post)
def create_post(
    post: schemas.PostCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    if not tenant_id:
         # Fallback to user's tenant if header not strictly required or matches
         tenant_id = current_user.tenant_id
    
    # Optional: Verify current_user belongs to tenant_id
    if current_user.tenant_id != tenant_id:
         raise HTTPException(status_code=403, detail="User does not belong to this tenant")

    new_post = models.Post(
        title=post.title,
        description=post.description,
        status=post.status,
        user_id=current_user.id,
        tenant_id=tenant_id
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@app.post("/posts/{post_id}/upvote", response_model=schemas.Upvote)
def upvote_post(
    post_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Ensure post exists and belongs to user's tenant
    post = db.query(models.Post).filter(models.Post.id == post_id, models.Post.tenant_id == current_user.tenant_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if already upvoted
    existing_upvote = db.query(models.Upvote).filter(
        models.Upvote.user_id == current_user.id, 
        models.Upvote.post_id == post_id
    ).first()
    if existing_upvote:
        return existing_upvote # Or raise error

    new_upvote = models.Upvote(
        user_id=current_user.id,
        post_id=post_id,
        tenant_id=current_user.tenant_id
    )
    db.add(new_upvote)
    db.commit()
    db.refresh(new_upvote)
    return new_upvote

# --- Admin Endpoints ---

@app.put("/posts/{post_id}/status", response_model=schemas.Post)
def update_post_status(
    post_id: int, 
    status: models.PostStatus, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can update status")
        
    post = db.query(models.Post).filter(models.Post.id == post_id, models.Post.tenant_id == current_user.tenant_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post.status = status
    db.commit()
    db.refresh(post)
    return post
