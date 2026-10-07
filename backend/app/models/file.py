import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, BigInteger, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class FileRecord(Base):
    __tablename__ = "files"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # "kml" or "shapefile_zip"
    file_size = Column(BigInteger, nullable=False)
    status = Column(String(50), default="UPLOADED", nullable=False, index=True)
    feature_count = Column(Integer, default=0, nullable=False)
    detected_crs = Column(String(255), nullable=True)
    processing_error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="files")
    features = relationship("Feature", back_populates="file", cascade="all, delete-orphan")
    processing_job = relationship("ProcessingJob", back_populates="file", uselist=False, cascade="all, delete-orphan")
