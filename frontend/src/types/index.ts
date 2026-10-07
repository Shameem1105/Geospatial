export interface Project {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  file_count: number;
  total_area_sqm: number;
  total_length_m: number;
}

export interface ProcessingJob {
  id: string;
  file_id: string;
  status: "UPLOADED" | "VALIDATING" | "PARSING" | "PROCESSING" | "COMPLETED" | "PARTIAL_SUCCESS" | "FAILED";
  progress: number;
  current_step: string;
  total_features: number;
  processed_features: number;
  successful_features: number;
  failed_features: number;
  error_message?: string | null;
  started_at: string;
  completed_at?: string | null;
}

export interface FileRecord {
  id: string;
  project_id?: string | null;
  original_filename: string;
  stored_filename: string;
  file_type: "kml" | "shapefile_zip";
  file_size: number;
  status: "UPLOADED" | "VALIDATING" | "PARSING" | "PROCESSING" | "COMPLETED" | "PARTIAL_SUCCESS" | "FAILED";
  feature_count: number;
  detected_crs?: string | null;
  processing_error?: string | null;
  created_at: string;
  updated_at: string;
  processing_job?: ProcessingJob | null;
}

export interface Measurement {
  id: string;
  feature_id: string;
  measurement_type: "AREA" | "LENGTH" | "NONE";
  measurement_value?: number | null;
  measurement_unit: string;
  calculation_crs?: string | null;
  created_at: string;
  formatted_value?: string | null;
  alternative_units?: Record<string, string>;
}

export interface FeatureItem {
  id: string;
  file_id: string;
  feature_index: number;
  geometry_type: string;
  geometry_data?: any;
  properties?: Record<string, any>;
  source_crs?: string | null;
  processing_status: "SUCCESS" | "UNSUPPORTED" | "FAILED";
  created_at: string;
  measurement?: Measurement | null;
}

export interface FileStatistics {
  file_id: string;
  filename: string;
  file_type: string;
  detected_crs?: string | null;
  calculation_crs?: string | null;
  total_features: number;
  polygon_count: number;
  linestring_count: number;
  point_count: number;
  other_count: number;
  total_area_sqm: number;
  total_area_sqkm: number;
  total_area_acres: number;
  total_length_m: number;
  total_length_km: number;
  successful_features: number;
  failed_features: number;
  unsupported_features: number;
}

export interface OverallAnalytics {
  total_projects: number;
  total_files: number;
  total_features: number;
  total_area_sqm: number;
  total_area_sqkm: number;
  total_length_m: number;
  total_length_km: number;
  success_rate: number;
  geometry_distribution: { name: string; count: number; percentage: number }[];
  status_distribution: { status: string; count: number; percentage: number }[];
  recent_activity: any[];
}

export interface HealthStatus {
  status: string;
  database: string;
  version: string;
  project: string;
  timestamp: string;
}
