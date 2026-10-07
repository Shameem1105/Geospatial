import os
import logging
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.file import FileRecord
from app.models.feature import Feature
from app.models.measurement import Measurement
from app.models.processing_job import ProcessingJob
from app.geospatial.parser import GeospatialParser
from app.geospatial.geometry_validation import GeometryValidator
from app.geospatial.measurement import MeasurementCalculator

logger = logging.getLogger(__name__)

class ProcessingService:
    """
    Manages end-to-end background processing of geospatial files with step tracking,
    CRS transformation, measurement calculation, and partial failure resilience.
    """

    @classmethod
    def process_file_job(cls, file_id: str, db: Optional[Session] = None):
        should_close = False
        if db is None:
            db = SessionLocal()
            should_close = True
        try:
            file_rec: Optional[FileRecord] = db.query(FileRecord).filter(FileRecord.id == file_id).first()
            if not file_rec:
                logger.error(f"FileRecord with ID {file_id} not found.")
                return

            job: Optional[ProcessingJob] = db.query(ProcessingJob).filter(ProcessingJob.file_id == file_id).first()
            if not job:
                job = ProcessingJob(file_id=file_id)
                db.add(job)
                db.commit()
                db.refresh(job)

            # Step 1: VALIDATING
            cls._update_job(db, job, status="VALIDATING", progress=10, step="Validating uploaded file integrity")
            file_rec.status = "VALIDATING"
            db.commit()

            file_path = file_rec.stored_filename
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Stored file '{file_path}' does not exist on disk.")

            # Step 2: PARSING
            cls._update_job(db, job, status="PARSING", progress=25, step="Parsing geographic dataset features & CRS")
            file_rec.status = "PARSING"
            db.commit()

            features_data, detected_crs, parse_error = GeospatialParser.parse(file_path, file_rec.file_type)

            if parse_error:
                file_rec.status = "FAILED"
                file_rec.processing_error = parse_error
                cls._update_job(db, job, status="FAILED", progress=100, step="Parsing failed", error_msg=parse_error, completed=True)
                db.commit()
                return

            total_features = len(features_data)
            job.total_features = total_features
            file_rec.feature_count = total_features
            file_rec.detected_crs = detected_crs
            db.commit()

            if total_features == 0:
                file_rec.status = "COMPLETED"
                cls._update_job(
                    db, job,
                    status="COMPLETED",
                    progress=100,
                    step="File contains no geographic features",
                    total=0, processed=0, success=0, failed=0, completed=True
                )
                db.commit()
                return

            # Step 3: PROCESSING FEATURES & MEASUREMENTS
            cls._update_job(db, job, status="PROCESSING", progress=35, step=f"Processing 0/{total_features} features")
            file_rec.status = "PROCESSING"
            db.commit()

            successful_count = 0
            failed_count = 0
            unsupported_count = 0

            # Delete any existing features/measurements for idempotency
            db.query(Feature).filter(Feature.file_id == file_id).delete()
            db.commit()

            for idx, item in enumerate(features_data):
                feat_idx = item["feature_index"]
                raw_geom = item["raw_geometry"]
                props = item.get("properties", {})
                source_crs = item.get("source_crs") or detected_crs or "EPSG:4326"

                try:
                    norm_geom, geom_type, norm_err = GeometryValidator.normalize_geometry(raw_geom)

                    if norm_err and norm_geom is None:
                        feat = Feature(
                            file_id=file_id,
                            feature_index=feat_idx,
                            geometry_type="Corrupted",
                            geometry_data=None,
                            properties=props,
                            source_crs=source_crs,
                            processing_status="FAILED"
                        )
                        db.add(feat)
                        db.flush()

                        meas = Measurement(
                            feature_id=feat.id,
                            measurement_type="NONE",
                            measurement_value=None,
                            measurement_unit="N/A",
                            calculation_crs="N/A"
                        )
                        db.add(meas)
                        failed_count += 1

                    elif norm_err and geom_type == "Unsupported":
                        feat = Feature(
                            file_id=file_id,
                            feature_index=feat_idx,
                            geometry_type=geom_type,
                            geometry_data=norm_geom,
                            properties=props,
                            source_crs=source_crs,
                            processing_status="UNSUPPORTED"
                        )
                        db.add(feat)
                        db.flush()

                        meas = Measurement(
                            feature_id=feat.id,
                            measurement_type="NONE",
                            measurement_value=None,
                            measurement_unit="N/A",
                            calculation_crs="N/A"
                        )
                        db.add(meas)
                        unsupported_count += 1

                    else:
                        meas_result = MeasurementCalculator.calculate_measurement(
                            geometry_dict=norm_geom,
                            geometry_type=geom_type,
                            source_crs_str=source_crs
                        )

                        feat_status = meas_result["status"]
                        if feat_status == "SUCCESS":
                            successful_count += 1
                        elif feat_status == "UNSUPPORTED":
                            unsupported_count += 1
                        else:
                            failed_count += 1

                        feat = Feature(
                            file_id=file_id,
                            feature_index=feat_idx,
                            geometry_type=geom_type,
                            geometry_data=norm_geom,
                            properties=props,
                            source_crs=source_crs,
                            processing_status=feat_status
                        )
                        db.add(feat)
                        db.flush()

                        meas = Measurement(
                            feature_id=feat.id,
                            measurement_type=meas_result["measurement_type"],
                            measurement_value=meas_result["measurement_value"],
                            measurement_unit=meas_result["measurement_unit"],
                            calculation_crs=meas_result["calculation_crs"]
                        )
                        db.add(meas)

                except Exception as ex:
                    logger.exception(f"Error processing feature {feat_idx}: {ex}")
                    failed_count += 1

                # Update progress periodically
                if (idx + 1) % 10 == 0 or (idx + 1) == total_features:
                    pct = 35 + int(((idx + 1) / total_features) * 60)
                    cls._update_job(
                        db, job,
                        status="PROCESSING",
                        progress=min(95, pct),
                        step=f"Processing {idx + 1}/{total_features} features",
                        processed=idx + 1,
                        success=successful_count,
                        failed=failed_count + unsupported_count
                    )
                    db.commit()

            # Finalize Status
            if failed_count == 0 and unsupported_count == 0:
                final_status = "COMPLETED"
                step_msg = f"Successfully processed all {total_features} features"
            elif successful_count > 0:
                final_status = "PARTIAL_SUCCESS"
                step_msg = f"Processed {successful_count} successful, {failed_count + unsupported_count} failed/unsupported features"
            else:
                final_status = "FAILED"
                step_msg = f"Failed to process {total_features} features"

            file_rec.status = final_status
            cls._update_job(
                db, job,
                status=final_status,
                progress=100,
                step=step_msg,
                total=total_features,
                processed=total_features,
                success=successful_count,
                failed=failed_count + unsupported_count,
                completed=True
            )
            db.commit()

        except Exception as e:
            logger.exception(f"Fatal error during file job processing: {e}")
            if 'file_rec' in locals() and file_rec:
                file_rec.status = "FAILED"
                file_rec.processing_error = str(e)
            if 'job' in locals() and job:
                cls._update_job(db, job, status="FAILED", progress=100, step="Processing failed", error_msg=str(e), completed=True)
            db.commit()
        finally:
            if should_close:
                db.close()

    @staticmethod
    def _update_job(
        db: Session,
        job: ProcessingJob,
        status: str,
        progress: int,
        step: str,
        total: Optional[int] = None,
        processed: Optional[int] = None,
        success: Optional[int] = None,
        failed: Optional[int] = None,
        error_msg: Optional[str] = None,
        completed: bool = False
    ):
        job.status = status
        job.progress = progress
        job.current_step = step
        if total is not None:
            job.total_features = total
        if processed is not None:
            job.processed_features = processed
        if success is not None:
            job.successful_features = success
        if failed is not None:
            job.failed_features = failed
        if error_msg:
            job.error_message = error_msg
        if completed:
            job.completed_at = datetime.utcnow()
        db.flush()
