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
              <p>Click any dataset to open the interactive map or view features</p>
            </div>
            <Button
              variant="secondary"
              icon="layers"
              onClick={() => navigate('/explorer')}
            >
              Open Map Explorer
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
                    <th>DATASET / PLACE</th>
                    <th>TYPE</th>
                    <th>FEATURES</th>
                    <th>DETECTED CRS</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f) => {
                    const displayName = f.original_filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
                    const isZip = f.original_filename.endsWith('.zip');

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
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#22272B] text-amber-400 border border-[#2E353D]">
                            {f.file_type === 'shapefile_zip' ? 'SHAPEFILE' : 'KML'}
                          </span>
                        </td>
                        <td className="mono text-amber-400 font-bold">{f.feature_count?.toLocaleString() || '0'}</td>
                        <td>
                          <code className="text-[11px]">{f.detected_crs || 'EPSG:4326'}</code>
                        </td>
                        <td>
                          <StatusBadge value={f.status === 'COMPLETED' ? 'Completed' : 'Processing'} />
                        </td>
                        <td>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/analysis?fileId=${f.id}`)}
                              className="px-2.5 py-1 rounded bg-[#2A3038] hover:bg-amber-500 hover:text-black text-xs text-[#F4F2ED] font-medium transition-all"
                            >
                              Map View
                            </button>
                            <button
                              onClick={() => navigate(`/explorer?fileId=${f.id}`)}
                              className="px-2.5 py-1 rounded bg-[#1F242A] hover:bg-[#2F3640] text-xs text-[#8A95A5] hover:text-[#F4F2ED] transition-all"
                            >
                              Features
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
