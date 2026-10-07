import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.project import Project
from app.models.file import FileRecord
from app.models.feature import Feature
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectDetailResponse

logger = logging.getLogger(__name__)

class ProjectService:
    @classmethod
    def list_projects(cls, db: Session) -> List[ProjectResponse]:
        projects = db.query(Project).order_by(Project.created_at.desc()).all()
        result = []
        for p in projects:
            file_count = len(p.files)
            # Calculate aggregate area and length
            total_area = 0.0
            total_length = 0.0
            for f in p.files:
                for feat in f.features:
                    if feat.measurement:
                        if feat.measurement.measurement_type == "AREA" and feat.measurement.measurement_value:
                            total_area += feat.measurement.measurement_value
                        elif feat.measurement.measurement_type == "LENGTH" and feat.measurement.measurement_value:
                            total_length += feat.measurement.measurement_value
            
            result.append(ProjectResponse(
                id=p.id,
                name=p.name,
                description=p.description,
                created_at=p.created_at,
                updated_at=p.updated_at,
                file_count=file_count,
                total_area_sqm=round(total_area, 2),
                total_length_m=round(total_length, 2)
            ))
        return result

    @classmethod
    def create_project(cls, data: ProjectCreate, db: Session) -> ProjectResponse:
        project = Project(name=data.name, description=data.description)
        db.add(project)
        db.commit()
        db.refresh(project)
        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            created_at=project.created_at,
            updated_at=project.updated_at,
            file_count=0,
            total_area_sqm=0.0,
            total_length_m=0.0
        )

    @classmethod
    def get_project(cls, project_id: str, db: Session) -> ProjectDetailResponse:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        file_count = len(project.files)
        total_area = 0.0
        total_length = 0.0
        for f in project.files:
            for feat in f.features:
                if feat.measurement:
                    if feat.measurement.measurement_type == "AREA" and feat.measurement.measurement_value:
                        total_area += feat.measurement.measurement_value
                    elif feat.measurement.measurement_type == "LENGTH" and feat.measurement.measurement_value:
                        total_length += feat.measurement.measurement_value

        return ProjectDetailResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            created_at=project.created_at,
            updated_at=project.updated_at,
            file_count=file_count,
            total_area_sqm=round(total_area, 2),
            total_length_m=round(total_length, 2),
            files=project.files
        )

    @classmethod
    def update_project(cls, project_id: str, data: ProjectUpdate, db: Session) -> ProjectResponse:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        if data.name is not None:
            project.name = data.name
        if data.description is not None:
            project.description = data.description
        db.commit()
        db.refresh(project)
        return cls.get_project(project_id, db)

    @classmethod
    def delete_project(cls, project_id: str, db: Session) -> bool:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return False
        db.delete(project)
        db.commit()
        return True
