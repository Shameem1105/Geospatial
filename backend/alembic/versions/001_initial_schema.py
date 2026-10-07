"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-07

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_id'), 'projects', ['id'], unique=False)

    # Files table
    op.create_table(
        'files',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=True),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('stored_filename', sa.String(length=255), nullable=False),
        sa.Column('file_type', sa.String(length=50), nullable=False),
        sa.Column('file_size', sa.BigInteger(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('feature_count', sa.Integer(), nullable=False),
        sa.Column('detected_crs', sa.String(length=255), nullable=True),
        sa.Column('processing_error', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_files_id'), 'files', ['id'], unique=False)
    op.create_index(op.f('ix_files_project_id'), 'files', ['project_id'], unique=False)
    op.create_index(op.f('ix_files_status'), 'files', ['status'], unique=False)

    # Features table
    op.create_table(
        'features',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('file_id', sa.String(length=36), nullable=False),
        sa.Column('feature_index', sa.Integer(), nullable=False),
        sa.Column('geometry_type', sa.String(length=50), nullable=False),
        sa.Column('geometry_data', sa.JSON(), nullable=True),
        sa.Column('properties', sa.JSON(), nullable=True),
        sa.Column('source_crs', sa.String(length=255), nullable=True),
        sa.Column('processing_status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['file_id'], ['files.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_features_id'), 'features', ['id'], unique=False)
    op.create_index(op.f('ix_features_file_id'), 'features', ['file_id'], unique=False)
    op.create_index(op.f('ix_features_geometry_type'), 'features', ['geometry_type'], unique=False)
    op.create_index(op.f('ix_features_processing_status'), 'features', ['processing_status'], unique=False)

    # Measurements table
    op.create_table(
        'measurements',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('feature_id', sa.String(length=36), nullable=False),
        sa.Column('measurement_type', sa.String(length=50), nullable=False),
        sa.Column('measurement_value', sa.Float(), nullable=True),
        sa.Column('measurement_unit', sa.String(length=50), nullable=False),
        sa.Column('calculation_crs', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['feature_id'], ['features.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('feature_id')
    )
    op.create_index(op.f('ix_measurements_id'), 'measurements', ['id'], unique=False)
    op.create_index(op.f('ix_measurements_feature_id'), 'measurements', ['feature_id'], unique=True)

    # Processing Jobs table
    op.create_table(
        'processing_jobs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('file_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('progress', sa.Integer(), nullable=False),
        sa.Column('current_step', sa.String(length=255), nullable=False),
        sa.Column('total_features', sa.Integer(), nullable=False),
        sa.Column('processed_features', sa.Integer(), nullable=False),
        sa.Column('successful_features', sa.Integer(), nullable=False),
        sa.Column('failed_features', sa.Integer(), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['file_id'], ['files.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('file_id')
    )
    op.create_index(op.f('ix_processing_jobs_id'), 'processing_jobs', ['id'], unique=False)
    op.create_index(op.f('ix_processing_jobs_file_id'), 'processing_jobs', ['file_id'], unique=True)
    op.create_index(op.f('ix_processing_jobs_status'), 'processing_jobs', ['status'], unique=False)

def downgrade() -> None:
    op.drop_table('processing_jobs')
    op.drop_table('measurements')
    op.drop_table('features')
    op.drop_table('files')
    op.drop_table('projects')
