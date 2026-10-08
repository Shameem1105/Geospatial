import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "TERRAFLOW"
    PROJECT_TAGLINE: str = "Geospatial intelligence for the built environment."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Optional direct DATABASE_URL override (e.g. sqlite:///./terraflow.db or mysql+pymysql://...)
    DATABASE_URL_ENV: str = Field(default="", alias="DATABASE_URL")
    
    # Database Settings (Direct MySQL connection)
    DB_HOST: str = Field(default="localhost", alias="DB_HOST")
    DB_PORT: int = Field(default=3306, alias="DB_PORT")
    DB_USER: str = Field(default="root", alias="DB_USER")
    DB_PASSWORD: str = Field(default="", alias="DB_PASSWORD")
    DB_NAME: str = Field(default="terraflow", alias="DB_NAME")
    
    # Storage settings
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    TEMP_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "temp")
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50 MB
    MAX_EXTRACTED_SIZE: int = 150 * 1024 * 1024  # 150 MB max uncompressed zip size (anti-zip bomb)
    MAX_ZIP_ENTRIES: int = 500  # Max number of entries in zip
    
    # CORS (Strict origins without insecure wildcard)
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ]

    @property
    def DATABASE_URL(self) -> str:
        if self.DATABASE_URL_ENV:
            return self.DATABASE_URL_ENV
        # Construct PyMySQL URL
        pw = f":{self.DB_PASSWORD}" if self.DB_PASSWORD else ""
        return f"mysql+pymysql://{self.DB_USER}{pw}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

    @property
    def SERVER_URL(self) -> str:
        if self.DATABASE_URL_ENV:
            return self.DATABASE_URL_ENV
        # Server URL for creating DB if it does not exist
        pw = f":{self.DB_PASSWORD}" if self.DB_PASSWORD else ""
        return f"mysql+pymysql://{self.DB_USER}{pw}@{self.DB_HOST}:{self.DB_PORT}/?charset=utf8mb4"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.TEMP_DIR, exist_ok=True)
