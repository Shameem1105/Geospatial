import csv
import io
import json
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from fastapi.responses import StreamingResponse

from app.models.file import FileRecord
from app.models.feature import Feature

FORMULA_PREFIXES = ('=', '+', '-', '@', '\t', '\r', '%', '|')

class ReportService:
    """
    Generates downloadable export reports (CSV, JSON) from processed database records
    with CSV Formula Injection mitigation and header sanitization.
    """

    @staticmethod
    def _sanitize_csv_cell(val: Any) -> Any:
        """
        Prevents CSV / Formula Injection (CWE-1236) by escaping formula trigger prefixes.
        """
        if val is None:
            return ""
        s = str(val)
        if s.startswith(FORMULA_PREFIXES):
            return f"'{s}"
        return s

    @classmethod
    def export_csv(cls, file_id: str, db: Session) -> StreamingResponse:
        file_rec = db.query(FileRecord).filter(FileRecord.id == file_id).first()
        if not file_rec:
            raise HTTPException(status_code=404, detail="File not found")

        features = db.query(Feature).filter(Feature.file_id == file_id).order_by(Feature.feature_index.asc()).all()

        output = io.StringIO()
        writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

        # Header
        writer.writerow([
            "Feature Index",
            "Feature ID",
            "Geometry Type",
            "Processing Status",
            "Measurement Type",
            "Measurement Value",
            "Measurement Unit",
            "Calculation CRS",
            "Source CRS",
            "Properties"
        ])

        for f in features:
            m_type = f.measurement.measurement_type if f.measurement else "NONE"
            m_val = f.measurement.measurement_value if f.measurement else ""
            m_unit = f.measurement.measurement_unit if f.measurement else ""
            c_crs = f.measurement.calculation_crs if f.measurement else ""
            props_json = json.dumps(f.properties or {})

            writer.writerow([
                cls._sanitize_csv_cell(f.feature_index),
                cls._sanitize_csv_cell(f.id),
                cls._sanitize_csv_cell(f.geometry_type),
                cls._sanitize_csv_cell(f.processing_status),
                cls._sanitize_csv_cell(m_type),
                cls._sanitize_csv_cell(m_val),
                cls._sanitize_csv_cell(m_unit),
                cls._sanitize_csv_cell(c_crs),
                cls._sanitize_csv_cell(f.source_crs or ""),
                cls._sanitize_csv_cell(props_json)
            ])

        output.seek(0)
        # Sanitize filename for Content-Disposition header
        safe_orig = re.sub(r'[^a-zA-Z0-9._-]', '_', file_rec.original_filename)
        safe_filename = f"{safe_orig}_report.csv"

        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{safe_filename}"'}
        )

    @classmethod
    def export_json(cls, file_id: str, db: Session) -> Dict[str, Any]:
        file_rec = db.query(FileRecord).filter(FileRecord.id == file_id).first()
        if not file_rec:
            raise HTTPException(status_code=404, detail="File not found")

        features = db.query(Feature).filter(Feature.file_id == file_id).order_by(Feature.feature_index.asc()).all()

        feature_list = []
        for f in features:
            feature_list.append({
                "feature_index": f.feature_index,
                "feature_id": f.id,
                "geometry_type": f.geometry_type,
                "processing_status": f.processing_status,
                "source_crs": f.source_crs,
                "measurement": {
                    "type": f.measurement.measurement_type if f.measurement else "NONE",
                    "value": f.measurement.measurement_value if f.measurement else None,
                    "unit": f.measurement.measurement_unit if f.measurement else "N/A",
                    "calculation_crs": f.measurement.calculation_crs if f.measurement else None
                } if f.measurement else None,
                "properties": f.properties
            })

        return {
            "file_id": file_rec.id,
            "filename": file_rec.original_filename,
            "file_type": file_rec.file_type,
            "status": file_rec.status,
            "feature_count": file_rec.feature_count,
            "detected_crs": file_rec.detected_crs,
            "features": feature_list
        }
