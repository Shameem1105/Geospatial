from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectDetailResponse
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse], summary="List all projects with aggregated statistics")
def list_projects(db: Session = Depends(get_db)):
    return ProjectService.list_projects(db)

@router.post("", response_model=ProjectResponse, summary="Create a new project")
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    return ProjectService.create_project(data, db)

@router.get("/{id}", response_model=ProjectDetailResponse, summary="Get project details and contained files")
def get_project(id: str, db: Session = Depends(get_db)):
    return ProjectService.get_project(id, db)

@router.put("/{id}", response_model=ProjectResponse, summary="Update project metadata")
def update_project(id: str, data: ProjectUpdate, db: Session = Depends(get_db)):
    return ProjectService.update_project(id, data, db)

@router.delete("/{id}", summary="Delete project")
def delete_project(id: str, db: Session = Depends(get_db)):
    success = ProjectService.delete_project(id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True, "message": f"Project {id} deleted successfully."}
