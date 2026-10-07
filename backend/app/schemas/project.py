from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.file import FileResponse

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(None, max_length=2000, description="Project description")

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)

class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
    file_count: int = 0
    total_area_sqm: float = 0.0
    total_length_m: float = 0.0

    model_config = ConfigDict(from_attributes=True)

class ProjectDetailResponse(ProjectResponse):
    files: List[FileResponse] = []
