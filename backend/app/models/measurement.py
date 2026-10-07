import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    feature_id = Column(String(36), ForeignKey("features.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    measurement_type = Column(String(50), nullable=False)  # AREA, LENGTH, NONE
    measurement_value = Column(Float, nullable=True)  # Numeric value in base units (m² or m)
    measurement_unit = Column(String(50), nullable=False)  # "m²", "m", or "N/A"
    calculation_crs = Column(String(255), nullable=True)  # The projected CRS used for calculation
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    feature = relationship("Feature", back_populates="measurement")
