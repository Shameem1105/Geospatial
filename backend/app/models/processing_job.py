import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    file_id = Column(String(36), ForeignKey("files.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    status = Column(String(50), default="UPLOADED", nullable=False, index=True)
    # UPLOADED, VALIDATING, PARSING, PROCESSING, COMPLETED, PARTIAL_SUCCESS, FAILED
    progress = Column(Integer, default=0, nullable=False)
    current_step = Column(String(255), default="File uploaded and queued", nullable=False)
    total_features = Column(Integer, default=0, nullable=False)
    processed_features = Column(Integer, default=0, nullable=False)
    successful_features = Column(Integer, default=0, nullable=False)
    failed_features = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    file = relationship("FileRecord", back_populates="processing_job")
