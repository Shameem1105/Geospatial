import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
from app.core.config import settings

logger = logging.getLogger(__name__)

# Base engine
if "sqlite" in settings.DATABASE_URL:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_size=10,
        max_overflow=20,
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def ensure_database_exists():
    """Ensure that the terraflow MySQL database exists on the server."""
    if "sqlite" in settings.DATABASE_URL:
        return
    try:
        server_engine = create_engine(settings.SERVER_URL, isolation_level="AUTOCOMMIT")
        with server_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{settings.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"))
        logger.info(f"Database '{settings.DB_NAME}' verified/created successfully.")
    except Exception as e:
        logger.warning(f"Could not auto-create database (might already exist or need manual creation): {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
