from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.core.config import settings
from app.schemas.common import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse, summary="Check API & MySQL database health")
def health_check(db: Session = Depends(get_db)):
    """
    Returns the real-time operational status of the FastAPI backend and MySQL database server.
    """
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        database=db_status,
        version=settings.VERSION,
        project=settings.PROJECT_NAME,
        timestamp=datetime.utcnow().isoformat()
    )
