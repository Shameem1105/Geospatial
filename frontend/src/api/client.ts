import axios from 'axios';
import type { 
  FileRecord, 
  FeatureItem, 
  FileStatistics, 
  Project, 
  OverallAnalytics, 
  HealthStatus 
} from '../types';

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined') {
    // If running in local browser dev
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000/api/v1';
    }
    // When deployed on Vercel (e.g. geospatial-zeta.vercel.app), use same-origin relative path
    return '/api/v1';
  }
  return '/api/v1';
};

const API_BASE = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE,
});

export const apiClient = {
  // Health
  getHealth: async (): Promise<HealthStatus> => {
    const res = await api.get('/health');
    return res.data;
  },

  // Files
  listFiles: async (projectId?: string): Promise<FileRecord[]> => {
    const params = projectId ? { project_id: projectId } : {};
    const res = await api.get('/files', { params });
    return res.data;
  },

  getFile: async (id: string): Promise<FileRecord> => {
    const res = await api.get(`/files/${id}`);
    return res.data;
  },

  uploadFile: async (formData: FormData): Promise<{ file_id: string; job_id: string; original_filename: string; file_type: string; file_size: number; status: string; message: string }> => {
    const res = await api.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteFile: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/files/${id}`);
    return res.data;
  },

  getFileFeatures: async (
    id: string, 
    params?: { page?: number; page_size?: number; geometry_type?: string; status?: string; search?: string }
  ): Promise<{ total: number; page: number; page_size: number; features: FeatureItem[] }> => {
    const res = await api.get(`/files/${id}/features`, { params });
    return res.data;
  },

  getFileStatistics: async (id: string): Promise<FileStatistics> => {
    const res = await api.get(`/files/${id}/statistics`);
    return res.data;
  },

  getFileGeoJSON: async (id: string): Promise<any> => {
    const res = await api.get(`/files/${id}/geojson`);
    return res.data;
  },

  // Projects
  listProjects: async (): Promise<Project[]> => {
    const res = await api.get('/projects');
    return res.data;
  },

  createProject: async (data: { name: string; description?: string }): Promise<Project> => {
    const res = await api.post('/projects', data);
    return res.data;
  },

  getProject: async (id: string): Promise<Project & { files: FileRecord[] }> => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  deleteProject: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },

  // Analytics
  getAnalytics: async (): Promise<OverallAnalytics> => {
    const res = await api.get('/analytics');
    return res.data;
  },

  // Reports
  getCsvDownloadUrl: (fileId: string) => `${API_BASE}/reports/csv/${fileId}`,
  getJsonExport: async (fileId: string) => {
    const res = await api.get(`/reports/json/${fileId}`);
    return res.data;
  },
};
