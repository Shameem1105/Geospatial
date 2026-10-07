from datetime import datetime
from typing import Optional, Any, Dict, List
from pydantic import BaseModel, ConfigDict
from app.schemas.measurement import MeasurementResponse

class FeatureBase(BaseModel):
    feature_index: int
    geometry_type: str
    geometry_data: Optional[Dict[str, Any]] = None
    properties: Optional[Dict[str, Any]] = None
    source_crs: Optional[str] = None
    processing_status: str

class FeatureResponse(FeatureBase):
    id: str
    file_id: str
    created_at: datetime
    measurement: Optional[MeasurementResponse] = None

    model_config = ConfigDict(from_attributes=True)

class FeatureListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    features: List[FeatureResponse]

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: str
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    name: Optional[str] = None
    crs: Dict[str, Any] = {
        "type": "name",
        "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
    }
    features: List[GeoJSONFeature]
