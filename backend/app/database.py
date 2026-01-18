from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

# Database URL from environment variable or construct from individual components
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Construct DATABASE_URL from individual components
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    
    if not all([db_user, db_password, db_host, db_port, db_name]):
        raise ValueError(
            "Either DATABASE_URL or all of (DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME) "
            "must be set in your .env file."
        )
    
    # URL-encode the password using quote_plus
    encoded_password = quote_plus(db_password)
    DATABASE_URL = f"mysql+pymysql://{db_user}:{encoded_password}@{db_host}:{db_port}/{db_name}"

SQLALCHEMY_DATABASE_URL = DATABASE_URL

engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
