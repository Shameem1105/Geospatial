from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.file import FileRecord
from app.models.feature import Feature
from app.models.measurement import Measurement
from app.schemas.file import FileResponse, FileUploadResponse, FileStatistics
from app.schemas.feature import FeatureResponse, FeatureListResponse, GeoJSONFeatureCollection
from app.schemas.measurement import MeasurementResponse
from app.services.file_service import FileService
from app.services.processing_service import ProcessingService
from app.geospatial.geojson_service import GeoJSONService

router = APIRouter(prefix="/files", tags=["Files & Geospatial Processing"])

@router.post("", response_model=FileUploadResponse, summary="Upload and process a geographic file (KML or Shapefile ZIP)")
async def upload_file(
    file: UploadFile = File(..., description="KML (.kml) or Shapefile ZIP (.zip) archive"),
    project_id: Optional[str] = Form(None, description="Optional Project ID to associate"),
    db: Session = Depends(get_db)
):
    """
    Accepts KML (.kml) or Shapefile (.zip) files, creates a processing job,
    and runs geospatial parsing, CRS transformation, and planar measurements.
    """
    file_rec, job = await FileService.validate_and_save_upload(file, project_id, db)
    
    # Run processing directly so serverless functions (e.g. Vercel) complete the calculation before response
    try:
        ProcessingService.process_file_job(file_rec.id, db=db)
        db.refresh(file_rec)
        db.refresh(job)
    except Exception as e:
        import logging
        logging.getLogger("terraflow").error(f"Direct processing error: {e}")

    return FileUploadResponse(
        file_id=file_rec.id,
        job_id=job.id,
        original_filename=file_rec.original_filename,
        file_type=file_rec.file_type,
        file_size=file_rec.file_size,
        status=file_rec.status or "COMPLETED",
        message=f"File processed successfully. Status: {file_rec.status}"
    )

@router.get("", response_model=List[FileResponse], summary="List all uploaded geographic files")
def list_files(
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    db: Session = Depends(get_db)
):
    """Returns a list of all uploaded files with their current processing status."""
    query = db.query(FileRecord)
    if project_id:
        query = query.filter(FileRecord.project_id == project_id)
    return query.order_by(desc(FileRecord.created_at)).all()

@router.get("/{id}", response_model=FileResponse, summary="Get file details and processing job status")
def get_file(id: str, db: Session = Depends(get_db)):
    """Returns metadata and detailed background processing status for a given file."""
    file_rec = db.query(FileRecord).filter(FileRecord.id == id).first()
    if not file_rec:
        raise HTTPException(status_code=404, detail="File not found")
    return file_rec

@router.get("/{id}/features", response_model=FeatureListResponse, summary="Get extracted geographic features with pagination and filtering")
def get_features(
    id: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=500, description="Items per page"),
    geometry_type: Optional[str] = Query(None, description="Filter by geometry type (Polygon, LineString, Point)"),
    status: Optional[str] = Query(None, description="Filter by processing status (SUCCESS, FAILED, UNSUPPORTED)"),
    search: Optional[str] = Query(None, description="Search feature properties or index"),
    db: Session = Depends(get_db)
):
    """Returns paginated features and their associated measurements for a dataset."""
    file_rec = db.query(FileRecord).filter(FileRecord.id == id).first()
    if not file_rec:
        raise HTTPException(status_code=404, detail="File not found")

    query = db.query(Feature).filter(Feature.file_id == id)

    if geometry_type:
        query = query.filter(Feature.geometry_type.ilike(f"%{geometry_type}%"))
    if status:
        query = query.filter(Feature.processing_status == status)

    total = query.count()
    features = query.order_by(Feature.feature_index.asc()).offset((page - 1) * page_size).limit(page_size).all()

    # Format measurements for response
    feat_responses = []
    for f in features:
        meas_resp = None
        if f.measurement:
            meas_resp = MeasurementResponse(
                id=f.measurement.id,
                feature_id=f.id,
                measurement_type=f.measurement.measurement_type,
                measurement_value=f.measurement.measurement_value,
                measurement_unit=f.measurement.measurement_unit,
                calculation_crs=f.measurement.calculation_crs,
                created_at=f.measurement.created_at,
                formatted_value=(
                    f"{f.measurement.measurement_value:,.2f} {f.measurement.measurement_unit}"
                    if f.measurement.measurement_value is not None else "N/A"
                )
            )

        feat_responses.append(FeatureResponse(
            id=f.id,
            file_id=f.file_id,
            feature_index=f.feature_index,
            geometry_type=f.geometry_type,
            geometry_data=f.geometry_data,
            properties=f.properties,
            source_crs=f.source_crs,
            processing_status=f.processing_status,
            created_at=f.created_at,
            measurement=meas_resp
        ))

    return FeatureListResponse(
        total=total,
        page=page,
        page_size=page_size,
        features=feat_responses
    )

@router.get("/{id}/measurements", response_model=List[MeasurementResponse], summary="Get calculated measurements for a file")
def get_measurements(id: str, db: Session = Depends(get_db)):
    """Returns all measurements calculated for features in the given file."""
    features = db.query(Feature).filter(Feature.file_id == id).all()
    if not features:
        raise HTTPException(status_code=404, detail="No features found for this file")

    results = []
    for f in features:
        if f.measurement:
            results.append(MeasurementResponse(
                id=f.measurement.id,
                feature_id=f.id,
                measurement_type=f.measurement.measurement_type,
                measurement_value=f.measurement.measurement_value,
                measurement_unit=f.measurement.measurement_unit,
                calculation_crs=f.measurement.calculation_crs,
                created_at=f.measurement.created_at,
                formatted_value=(
                    f"{f.measurement.measurement_value:,.2f} {f.measurement.measurement_unit}"
                    if f.measurement.measurement_value is not None else "N/A"
                )
            ))
    return results

@router.get("/{id}/statistics", response_model=FileStatistics, summary="Get calculated statistical summary for a file")
def get_file_statistics(id: str, db: Session = Depends(get_db)):
    """Returns aggregated area, length, geometry count, and status statistics."""
    return FileService.get_file_statistics(id, db)

@router.get("/{id}/geojson", summary="Get processed features as RFC 7946 GeoJSON FeatureCollection")
def get_file_geojson(id: str, db: Session = Depends(get_db)):
    """Returns complete GeoJSON FeatureCollection with embedded measurements for map rendering."""
    file_rec = db.query(FileRecord).filter(FileRecord.id == id).first()
    if not file_rec:
        raise HTTPException(status_code=404, detail="File not found")

    features = db.query(Feature).filter(Feature.file_id == id).order_by(Feature.feature_index.asc()).all()
    return GeoJSONService.build_feature_collection(features, file_rec.original_filename)

@router.delete("/{id}", summary="Delete file and cascade delete all associated features, measurements, and jobs")
def delete_file(id: str, db: Session = Depends(get_db)):
    """Safely deletes the file record and physical file from disk."""
    success = FileService.delete_file(id, db)
    if not success:
        raise HTTPException(status_code=404, detail="File not found")
    return {"success": True, "message": f"File {id} and all associated data deleted successfully."}
