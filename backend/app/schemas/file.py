from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.processing import ProcessingJobResponse

class FileBase(BaseModel):
    original_filename: str
    file_type: str
    file_size: int

class FileResponse(FileBase):
    id: str
    project_id: Optional[str] = None
    status: str
    feature_count: int
    detected_crs: Optional[str] = None
    processing_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    processing_job: Optional[ProcessingJobResponse] = None

    model_config = ConfigDict(from_attributes=True)

class FileUploadResponse(BaseModel):
    file_id: str
    job_id: str
    original_filename: str
    file_type: str
    file_size: int
    status: str
    message: str

class FileStatistics(BaseModel):
    file_id: str
    filename: str
    file_type: str
    detected_crs: Optional[str] = None
    calculation_crs: Optional[str] = None
    total_features: int
    polygon_count: int
    linestring_count: int
    point_count: int
    other_count: int
    total_area_sqm: float
    total_area_sqkm: float
    total_area_acres: float
    total_length_m: float
    total_length_km: float
    successful_features: int
    failed_features: int
    unsupported_features: int
