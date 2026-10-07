from typing import Generic, TypeVar, Optional, Any, List
from pydantic import BaseModel

T = TypeVar("T")

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    error: Optional[ErrorDetail] = None

class HealthResponse(BaseModel):
    status: str
    database: str
    version: str
    project: str
    timestamp: str
