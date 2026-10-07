import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Feature(Base):
    __tablename__ = "features"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    file_id = Column(String(36), ForeignKey("files.id", ondelete="CASCADE"), nullable=False, index=True)
    feature_index = Column(Integer, nullable=False)
    geometry_type = Column(String(50), nullable=False, index=True)  # Polygon, MultiPolygon, LineString, MultiLineString, Point, Unsupported
    geometry_data = Column(JSON, nullable=True)  # GeoJSON geometry in EPSG:4326 (lon, lat) for display
    properties = Column(JSON, nullable=True)  # Feature properties / metadata
    source_crs = Column(String(255), nullable=True)
    processing_status = Column(String(50), default="SUCCESS", nullable=False, index=True)  # SUCCESS, UNSUPPORTED, FAILED
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    file = relationship("FileRecord", back_populates="features")
    measurement = relationship("Measurement", back_populates="feature", uselist=False, cascade="all, delete-orphan")
