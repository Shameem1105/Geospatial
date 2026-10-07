from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports & Data Export"])

@router.get("/csv/{file_id}", summary="Download dataset measurements and properties as CSV")
def export_csv(file_id: str, db: Session = Depends(get_db)):
    """Exports all feature attributes, calculated measurements, and calculation CRS to CSV."""
    return ReportService.export_csv(file_id, db)

@router.get("/json/{file_id}", summary="Export dataset measurements and properties as JSON")
def export_json(file_id: str, db: Session = Depends(get_db)):
    """Exports all feature attributes and calculated measurements to structured JSON."""
    return ReportService.export_json(file_id, db)
