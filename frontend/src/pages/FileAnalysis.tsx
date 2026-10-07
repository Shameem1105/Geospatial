import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { MapVisual } from '../components/MapVisual';
import { apiClient } from '../api/client';

export const FileAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileId = searchParams.get('fileId');
  const [activeTab, setActiveTab] = useState<'map' | 'satellite'>('map');

  const { data: fileData } = useQuery({
    queryKey: ['file-analysis', fileId],
    queryFn: () => (fileId ? apiClient.getFile(fileId) : null),
    enabled: !!fileId,
  });

  const { data: stats } = useQuery({
    queryKey: ['file-stats', fileId],
    queryFn: () => (fileId ? apiClient.getFileStatistics(fileId) : null),
    enabled: !!fileId,
  });

  const filename = fileData?.original_filename || 'Chennai_Site_Survey.kml';
  const projectName = 'Chennai Metro Site';
  const totalFeatures = stats?.total_features || fileData?.feature_count || 1284;
  const sourceCrs = stats?.detected_crs || fileData?.detected_crs || 'EPSG:4326';
  const measureCrs = stats?.calculation_crs || 'EPSG:32644';
  const totalArea = stats?.total_area_sqm
    ? `${stats.total_area_sqm.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : '48,293.72';
  const totalLength = stats?.total_length_km
    ? `${stats.total_length_km.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : '128.43';

  return (
    <div className="page analysis-page">
      <div className="analysis-head">
        <div>
          <div className="back-link" onClick={() => navigate('/')}>
            ← Survey files / {projectName}
          </div>
          <div className="title-with-status">
            <div className="page-title">{projectName}</div>
            <StatusBadge value="Completed" />
          </div>
          <p>
            {filename} · Processed 07 Oct 2026 at 14:28
          </p>
        </div>
        <div className="button-row">
          <Button
            variant="secondary"
            icon="code"
            onClick={() => navigate('/explorer')}
          >
            Raw Data
          </Button>
          <Button
            variant="secondary"
            icon="report"
            onClick={() => navigate('/reports')}
          >
            Report
          </Button>
          <Button
            icon="download"
            onClick={() => {
              if (fileId) {
                window.open(apiClient.getCsvDownloadUrl(fileId), '_blank');
              } else {
                alert('Exporting dataset CSV/GeoJSON package...');
              }
            }}
          >
            Export Results
          </Button>
        </div>
      </div>

      <div className="analysis-layout">
        <div className="map-panel panel">
          <div className="map-header">
            <div>
              <Icon name="layers" />
              <div>
                <strong>Spatial overview</strong>
                <span>842 polygons · 427 lines · 15 points</span>
              </div>
            </div>
            <div className="map-tabs">
              <button
                className={activeTab === 'map' ? 'active' : ''}
                onClick={() => setActiveTab('map')}
              >
                Map
              </button>
              <button
                className={activeTab === 'satellite' ? 'active' : ''}
                onClick={() => setActiveTab('satellite')}
              >
                Satellite
              </button>
            </div>
          </div>
          <MapVisual />
        </div>

        <aside className="summary-column">
          <div className="panel dataset-summary">
            <div className="panel-header">
              <div className="panel-title">Dataset summary</div>
              <Icon name="more" />
            </div>
            <div className="feature-counts">
              <div>
                <span>FEATURES</span>
                <strong>{totalFeatures.toLocaleString()}</strong>
              </div>
              <div>
                <span>POLYGONS</span>
                <strong>{stats?.polygon_count || 842}</strong>
              </div>
              <div>
                <span>LINESTRINGS</span>
                <strong>{stats?.linestring_count || 427}</strong>
              </div>
              <div>
                <span>POINTS</span>
                <strong>{stats?.point_count || 15}</strong>
              </div>
            </div>
            <div className="crs-row">
              <div>
                <span>SOURCE CRS</span>
                <code>{sourceCrs}</code>
              </div>
              <Icon name="arrow" />
              <div>
                <span>MEASUREMENT CRS</span>
                <code>{measureCrs}</code>
              </div>
            </div>
          </div>

          <div className="measurement-card primary-measure">
            <span>TOTAL CALCULATED AREA</span>
            <strong>
              {totalArea} <i>m²</i>
            </strong>
            <div>
              <span>4.829 ha</span>
              <span>11.934 acres</span>
            </div>
          </div>

          <div className="measurement-card">
            <span>TOTAL LINE LENGTH</span>
            <strong>
              {totalLength} <i>km</i>
            </strong>
            <div>
              <span>128,430.8 meters</span>
              <span>79.80 miles</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="processing-summary panel">
        <div>
          <div className="panel-title">Processing summary</div>
          <p>Technical metadata and processing audit</p>
        </div>
        {[
          ['FILE', filename],
          ['SIZE', '18.4 MB'],
          ['FEATURES', totalFeatures.toLocaleString()],
          ['PROCESSING TIME', '12.8 sec'],
          ['SOURCE CRS', sourceCrs],
        ].map(([a, b]) => (
          <div key={a}>
            <span>{a}</span>
            <strong className={a.includes('CRS') ? 'mono' : ''}>{b}</strong>
          </div>
        ))}
        <StatusBadge value="Completed" />
      </div>
    </div>
  );
};
export default FileAnalysis;
