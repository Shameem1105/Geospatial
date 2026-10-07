from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ProcessingJobBase(BaseModel):
    status: str
    progress: int
    current_step: str
    total_features: int
    processed_features: int
    successful_features: int
    failed_features: int
    error_message: Optional[str] = None

class ProcessingJobResponse(ProcessingJobBase):
    id: str
    file_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
