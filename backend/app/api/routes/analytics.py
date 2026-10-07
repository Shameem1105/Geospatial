from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.project import Project
from app.models.file import FileRecord
from app.models.feature import Feature
from app.models.measurement import Measurement
from app.schemas.analytics import OverallAnalytics, GeometryTypeBreakdown, StatusBreakdown

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])

@router.get("", response_model=OverallAnalytics, summary="Get global aggregated geospatial intelligence metrics")
def get_analytics(db: Session = Depends(get_db)):
    """
    Computes real dataset-wide metrics directly from database records:
    total area, total length, geometry breakdown, processing success ratios.
    """
    total_projects = db.query(Project).count()
    total_files = db.query(FileRecord).count()
    total_features = db.query(Feature).count()

    # Sum of areas
    total_area_res = db.query(func.sum(Measurement.measurement_value))\
        .filter(Measurement.measurement_type == "AREA").scalar() or 0.0

    # Sum of lengths
    total_length_res = db.query(func.sum(Measurement.measurement_value))\
        .filter(Measurement.measurement_type == "LENGTH").scalar() or 0.0

    # Geometry type breakdown
    geom_counts = db.query(Feature.geometry_type, func.count(Feature.id))\
        .group_by(Feature.geometry_type).all()

    geometry_dist = []
    for gtype, cnt in geom_counts:
        pct = (cnt / total_features * 100.0) if total_features > 0 else 0.0
        geometry_dist.append(GeometryTypeBreakdown(name=gtype or "Unknown", count=cnt, percentage=round(pct, 1)))

    # Status distribution
    status_counts = db.query(Feature.processing_status, func.count(Feature.id))\
        .group_by(Feature.processing_status).all()

    status_dist = []
    successful_feats = 0
    for stat, cnt in status_counts:
        if stat == "SUCCESS":
            successful_feats += cnt
        pct = (cnt / total_features * 100.0) if total_features > 0 else 0.0
        status_dist.append(StatusBreakdown(status=stat or "UNKNOWN", count=cnt, percentage=round(pct, 1)))

    success_rate = (successful_feats / total_features * 100.0) if total_features > 0 else 100.0

    # Recent activity
    recent_files = db.query(FileRecord).order_by(FileRecord.created_at.desc()).limit(5).all()
    recent_activity = [
        {
            "id": f.id,
            "filename": f.original_filename,
            "file_type": f.file_type,
            "status": f.status,
            "feature_count": f.feature_count,
            "created_at": f.created_at.isoformat()
        }
        for f in recent_files
    ]

    return OverallAnalytics(
        total_projects=total_projects,
        total_files=total_files,
        total_features=total_features,
        total_area_sqm=round(float(total_area_res), 2),
        total_area_sqkm=round(float(total_area_res) / 1_000_000.0, 4),
        total_length_m=round(float(total_length_res), 2),
        total_length_km=round(float(total_length_res) / 1000.0, 3),
        success_rate=round(success_rate, 1),
        geometry_distribution=geometry_dist,
        status_distribution=status_dist,
        recent_activity=recent_activity
    )
