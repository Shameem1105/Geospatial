import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { apiClient } from '../api/client';
import type { FileRecord } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: files = [], isLoading } = useQuery<FileRecord[]>({
    queryKey: ['files'],
    queryFn: () => apiClient.listFiles().catch(() => []),
    refetchInterval: 10000,
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiClient.getAnalytics().catch(() => null),
    refetchInterval: 15000,
  });

  const totalFeatures = analytics?.total_features || files.reduce((acc, f) => acc + (f.feature_count || 0), 0);

  const formatCrs = (rawCrs?: string | null) => {
    if (!rawCrs) return 'EPSG:4326 (WGS 84)';
    if (rawCrs.startsWith('EPSG:')) return rawCrs;
    if (rawCrs.includes('WGS_1984') || rawCrs.includes('WGS 84') || rawCrs.includes('4326')) {
      return 'EPSG:4326 (WGS 84)';
    }
    if (rawCrs.includes('UTM zone 43N') || rawCrs.includes('32643')) {
      return 'EPSG:32643 (UTM 43N)';
    }
    if (rawCrs.includes('UTM zone 44N') || rawCrs.includes('32644')) {
      return 'EPSG:32644 (UTM 44N)';
    }
    if (rawCrs.length > 25) {
      return rawCrs.slice(0, 20) + '...';
    }
    return rawCrs;
  };

  return (
    <div className="page">
      <section className="hero-row">
        <div>
          <div className="eyebrow">GEOSPATIAL PROCESSING ENGINE</div>
          <div className="page-title">Survey Datasets & Analysis</div>
          <p>Upload KML files and Shapefiles to calculate projected measurements, extract features, and view spatial geometry.</p>
        </div>
        <div className="button-row">
          <Button icon="cloud" onClick={() => navigate('/upload')}>
            Upload & Run File
          </Button>
        </div>
      </section>

      <div className="metrics-grid">
        <MetricCard
          label="DATASETS LOADED"
          value={files.length.toLocaleString()}
          detail="Active survey files"
        />
        <MetricCard
          label="TOTAL FEATURES"
          value={totalFeatures.toLocaleString()}
          detail="Polygons, Lines & Points"
          accent
        />
        <MetricCard
          label="PROCESSING STATUS"
          value="100% Ready"
          detail="UTM Projected Geometry"
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel recent-panel w-full">
          <div className="panel-header">
            <div>
              <div className="panel-title">Available Survey Files</div>
              <p>Click any dataset to open the interactive map and review spatial measurements</p>
            </div>
            <Button
              variant="secondary"
              icon="layers"
              onClick={() => navigate('/analysis')}
            >
              Open Spatial Map View
            </Button>
          </div>

          <div className="table-wrap">
            {isLoading ? (
              <div className="p-8 text-center text-[#8A95A5] text-xs">Loading survey files...</div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center text-[#8A95A5] text-xs">
                No files uploaded yet. Click "Upload & Run File" to get started.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>DATASET / LOCATION</th>
                    <th style={{ width: '12%' }}>FORMAT</th>
                    <th style={{ width: '12%' }}>FEATURES</th>
                    <th style={{ width: '18%' }}>DETECTED CRS</th>
                    <th style={{ width: '12%' }}>STATUS</th>
                    <th style={{ width: '16%' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f) => {
                    const displayName = f.original_filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
                    const isZip = f.original_filename.endsWith('.zip');
                    const cleanCrs = formatCrs(f.detected_crs);

                    return (
                      <tr
                        key={f.id}
                        className="hover:bg-[#1C2026] cursor-pointer"
                        onClick={() => navigate(`/analysis?fileId=${f.id}`)}
                      >
                        <td>
                          <div className="file-cell">
                            <span className="file-icon">
                              <Icon name={isZip ? 'folder' : 'file'} size={16} />
                            </span>
                            <div>
                              <strong className="text-[#F4F2ED] text-sm block">{displayName}</strong>
                              <span className="text-[11px] text-[#8A95A5] font-mono">{f.original_filename}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-[#22272B] text-amber-400 border border-[#2E353D]">
                            {f.file_type === 'shapefile_zip' ? 'SHAPEFILE' : 'KML'}
                          </span>
                        </td>
                        <td className="mono text-amber-400 font-bold text-xs">{f.feature_count?.toLocaleString() || '0'}</td>
                        <td>
                          <code className="text-[11px] bg-[#16181A] px-2 py-1 rounded border border-[#272B30] text-[#CBD5E1]" title={f.detected_crs || 'EPSG:4326'}>
                            {cleanCrs}
                          </code>
                        </td>
                        <td>
                          <StatusBadge value={f.status === 'COMPLETED' ? 'Completed' : 'Processing'} />
                        </td>
                        <td>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/analysis?fileId=${f.id}`)}
                              className="px-3.5 py-1.5 rounded-lg bg-[#2A3038] hover:bg-amber-500 hover:text-black text-xs text-[#F4F2ED] font-semibold transition-all shadow-sm"
                            >
                              View Map & Metrics
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
