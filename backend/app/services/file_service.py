import os
import re
import uuid
import shutil
import logging
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import UploadFile, HTTPException

from app.core.config import settings
from app.models.file import FileRecord
from app.models.feature import Feature
from app.models.measurement import Measurement
from app.models.processing_job import ProcessingJob
from app.schemas.file import FileStatistics

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".kml", ".zip"}

class FileService:
    """
    Manages geospatial file validation, persistence, deletion, and statistical aggregation
    with strict path traversal and safe storage controls.
    """

    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        """Sanitizes filename against directory traversal and dangerous characters."""
        # Strip path separators
        base = os.path.basename(filename).replace("\\", "/").split("/")[-1]
        # Replace non-safe chars
        clean = re.sub(r'[^a-zA-Z0-9._-]', '_', base)
        return clean or "unnamed_dataset"

    @classmethod
    async def validate_and_save_upload(
        cls,
        upload_file: UploadFile,
        project_id: Optional[str],
        db: Session
    ) -> Tuple[FileRecord, ProcessingJob]:
        """
        Validates the incoming file and saves it securely to the uploads directory.
        """
        raw_filename = upload_file.filename or "unknown"
        ext = os.path.splitext(raw_filename)[1].lower()

        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{ext}'. Only .kml and .zip (containing Shapefile) files are allowed."
            )

        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        os.makedirs(settings.TEMP_DIR, exist_ok=True)
        clean_filename = cls.sanitize_filename(raw_filename)
        file_type = "kml" if ext == ".kml" else "shapefile_zip"
        unique_prefix = str(uuid.uuid4())
        safe_stored_filename = f"{unique_prefix}_{clean_filename}"
        destination_path = os.path.realpath(os.path.join(settings.UPLOAD_DIR, safe_stored_filename))

        # Verify destination path is strictly within UPLOAD_DIR
        upload_dir_real = os.path.realpath(settings.UPLOAD_DIR)
        if not destination_path.startswith(upload_dir_real):
            raise HTTPException(status_code=400, detail="Security violation: Invalid upload path destination.")

        # Stream save and track size
        file_size = 0
        try:
            with open(destination_path, "wb") as buffer:
                while content := await upload_file.read(1024 * 1024):  # 1MB chunks
                    file_size += len(content)
                    if file_size > settings.MAX_FILE_SIZE:
                        buffer.close()
                        if os.path.exists(destination_path):
                            os.remove(destination_path)
                        raise HTTPException(
                            status_code=413,
                            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE // (1024*1024)}MB."
                        )
                    buffer.write(content)
        except HTTPException:
            raise
        except Exception as e:
            if os.path.exists(destination_path):
                os.remove(destination_path)
            raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

        if file_size == 0:
            if os.path.exists(destination_path):
                os.remove(destination_path)
            raise HTTPException(status_code=400, detail="The uploaded file is empty (0 bytes).")

        # Create Database Records
        file_rec = FileRecord(
            id=str(uuid.uuid4()),
            project_id=project_id,
            original_filename=clean_filename,
            stored_filename=destination_path,
            file_type=file_type,
            file_size=file_size,
            status="UPLOADED",
            feature_count=0
        )
        db.add(file_rec)
        db.flush()

        job = ProcessingJob(
            id=str(uuid.uuid4()),
            file_id=file_rec.id,
            status="UPLOADED",
            progress=0,
            current_step="File uploaded and queued for processing"
        )
        db.add(job)
        db.commit()
        db.refresh(file_rec)
        db.refresh(job)

        return file_rec, job

    @classmethod
    def get_file_statistics(cls, file_id: str, db: Session) -> FileStatistics:
        """
        Calculates real aggregated statistics from database records.
        """
        file_rec = db.query(FileRecord).filter(FileRecord.id == file_id).first()
        if not file_rec:
            raise HTTPException(status_code=404, detail="File not found")

        features = db.query(Feature).filter(Feature.file_id == file_id).all()

        total_features = len(features)
        polygon_count = 0
        linestring_count = 0
        point_count = 0
        other_count = 0
        successful_features = 0
        failed_features = 0
        unsupported_features = 0

        total_area_sqm = 0.0
        total_length_m = 0.0
        calculation_crs = None

        for f in features:
            if f.processing_status == "SUCCESS":
                successful_features += 1
            elif f.processing_status == "UNSUPPORTED":
                unsupported_features += 1
            else:
                failed_features += 1

            gtype = (f.geometry_type or "").lower()
            if "polygon" in gtype:
                polygon_count += 1
            elif "linestring" in gtype or "line" in gtype:
                linestring_count += 1
            elif "point" in gtype:
                point_count += 1
            else:
                other_count += 1

            if f.measurement:
                if f.measurement.measurement_type == "AREA" and f.measurement.measurement_value:
                    total_area_sqm += f.measurement.measurement_value
                elif f.measurement.measurement_type == "LENGTH" and f.measurement.measurement_value:
                    total_length_m += f.measurement.measurement_value

                if f.measurement.calculation_crs and not calculation_crs:
                    calculation_crs = f.measurement.calculation_crs

        return FileStatistics(
            file_id=file_rec.id,
            filename=file_rec.original_filename,
            file_type=file_rec.file_type,
            detected_crs=file_rec.detected_crs,
            calculation_crs=calculation_crs,
            total_features=total_features,
            polygon_count=polygon_count,
            linestring_count=linestring_count,
            point_count=point_count,
            other_count=other_count,
            total_area_sqm=round(total_area_sqm, 2),
            total_area_sqkm=round(total_area_sqm / 1_000_000.0, 4),
            total_area_acres=round(total_area_sqm / 4046.8564224, 3),
            total_length_m=round(total_length_m, 2),
            total_length_km=round(total_length_m / 1000.0, 3),
            successful_features=successful_features,
            failed_features=failed_features,
            unsupported_features=unsupported_features
        )

    @classmethod
    def delete_file(cls, file_id: str, db: Session) -> bool:
        """
        Safely deletes file record, associated database entities, and physical file.
        """
        file_rec = db.query(FileRecord).filter(FileRecord.id == file_id).first()
        if not file_rec:
            return False

        # Remove physical file securely
        if file_rec.stored_filename:
            real_path = os.path.realpath(file_rec.stored_filename)
            upload_dir_real = os.path.realpath(settings.UPLOAD_DIR)
            if real_path.startswith(upload_dir_real) and os.path.exists(real_path):
                try:
                    os.remove(real_path)
                except Exception as e:
                    logger.warning(f"Could not delete physical file {real_path}: {e}")

        db.delete(file_rec)
        db.commit()
        return True
