import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.database import engine, Base, ensure_database_exists
from app.api.routes import health, files, projects, analytics, reports
import app.models  # Ensure all models are registered

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("terraflow")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing TerraFlow backend engine...")
    # 1. Ensure MySQL database exists
    ensure_database_exists()
    # 2. Create tables automatically if not already present
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Could not connect to MySQL database during startup: {e}")
        logger.info("Ensure XAMPP MySQL is running on localhost:3306 with credentials in .env")
    yield
    logger.info("Shutting down TerraFlow backend engine...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"**{settings.PROJECT_TAGLINE}**\n\nHigh-precision geospatial file processing and measurement platform for KML and Shapefile datasets with automatic projected CRS transformation.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Defensive Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# CORS Middleware (Explicit origins, credentials supported)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global Exception Handlers for Structured Clean Errors
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0]["msg"] if errors else "Invalid request data"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": first_error,
                "details": str(errors)
            }
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error processing request {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred while processing the request."
            }
        }
    )

# Include Routers under both /api/v1 and /api for assignment compliance and client flexibility
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(files.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

# Direct /api prefix aliases
app.include_router(health.router, prefix="/api")
app.include_router(files.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(reports.router, prefix="/api")

@app.get("/", summary="TerraFlow Root Info")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.VERSION,
        "documentation": "/docs",
        "health": "/api/health"
    }
