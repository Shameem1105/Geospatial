from typing import List, Dict, Any
from pydantic import BaseModel

class GeometryTypeBreakdown(BaseModel):
    name: str
    count: int
    percentage: float

class StatusBreakdown(BaseModel):
    status: str
    count: int
    percentage: float

class OverallAnalytics(BaseModel):
    total_projects: int
    total_files: int
    total_features: int
    total_area_sqm: float
    total_area_sqkm: float
    total_length_m: float
    total_length_km: float
    success_rate: float
    geometry_distribution: List[GeometryTypeBreakdown]
    status_distribution: List[StatusBreakdown]
    recent_activity: List[Dict[str, Any]]
