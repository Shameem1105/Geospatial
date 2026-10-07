from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel, ConfigDict

class MeasurementBase(BaseModel):
    measurement_type: str  # AREA, LENGTH, NONE
    measurement_value: Optional[float] = None
    measurement_unit: str  # "m²", "m", "N/A"
    calculation_crs: Optional[str] = None

class MeasurementResponse(MeasurementBase):
    id: str
    feature_id: str
    created_at: datetime
    formatted_value: Optional[str] = None
    alternative_units: Optional[Dict[str, str]] = None

    model_config = ConfigDict(from_attributes=True)
