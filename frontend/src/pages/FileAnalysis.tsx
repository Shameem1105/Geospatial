import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { MapViewer } from '../components/MapViewer';
import { apiClient } from '../api/client';
import type { FileRecord } from '../types';

export const FileAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFileId = searchParams.get('fileId');
  const [activeTab, setActiveTab] = useState<'map' | 'satellite'>('map');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  // Fetch all files for quick switching
  const { data: files = [] } = useQuery<FileRecord[]>({
    queryKey: ['files'],
    queryFn: () => apiClient.listFiles().catch(() => []),
  });

  const [currentFileId, setCurrentFileId] = useState<string>(initialFileId || '');

  // Default to first file if not specified
  useEffect(() => {
    if (!currentFileId && files.length > 0) {
      const bangalore = files.find(f => f.original_filename.toLowerCase().includes('bangalore'));
      const defaultId = bangalore ? bangalore.id : files[0].id;
      setCurrentFileId(defaultId);
      setSearchParams({ fileId: defaultId });
    } else if (initialFileId && initialFileId !== currentFileId) {
      setCurrentFileId(initialFileId);
    }
  }, [files, initialFileId, currentFileId, setSearchParams]);

  // Fetch file details
  const { data: fileData } = useQuery({
    queryKey: ['file-analysis', currentFileId],
    queryFn: () => (currentFileId ? apiClient.getFile(currentFileId) : null),
    enabled: !!currentFileId,
  });

  // Fetch file statistics
  const { data: stats } = useQuery({
    queryKey: ['file-stats', currentFileId],
    queryFn: () => (currentFileId ? apiClient.getFileStatistics(currentFileId) : null),
    enabled: !!currentFileId,
  });

  // Fetch real GeoJSON for this file
  const { data: geojson, isLoading: isLoadingMap } = useQuery({
    queryKey: ['file-geojson', currentFileId],
    queryFn: () => (currentFileId ? apiClient.getFileGeoJSON(currentFileId) : null),
    enabled: !!currentFileId,
  });



  const selectedFile = files.find(f => f.id === currentFileId) || fileData;
  const filename = selectedFile?.original_filename || 'Dataset';
  const projectName = filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

  const handleDatasetChange = (newId: string) => {
    setCurrentFileId(newId);
    setSelectedFeatureId(null);
    setSearchParams({ fileId: newId });
  };

  const totalFeatures = stats?.total_features || selectedFile?.feature_count || geojson?.features?.length || 0;
  const sourceCrs = stats?.detected_crs || selectedFile?.detected_crs || 'EPSG:4326';
  const measureCrs = stats?.calculation_crs || 'EPSG:32643 (UTM Zone Planar Metric)';

  const formattedArea = stats?.total_area_sqm != null
    ? `${stats.total_area_sqm.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : '0.00';

  const formattedLength = stats?.total_length_km != null
    ? `${stats.total_length_km.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : stats?.total_length_m != null
    ? `${(stats.total_length_m / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : '0.00';

  return (
    <div className="page analysis-page">
      <div className="analysis-head">
        <div>
          <div className="back-link" onClick={() => navigate('/files')}>
            ← Survey files / {projectName}
          </div>
          <div className="title-with-status">
            <div className="page-title">{projectName}</div>
            <StatusBadge value={selectedFile?.status === 'COMPLETED' ? 'Completed' : 'Processing'} />
          </div>
          <p>
            {filename} · Format: {selectedFile?.file_type?.toUpperCase() || 'KML/SHP'} · {totalFeatures} indexed spatial features
          </p>
        </div>

        <div className="button-row">
          {/* Dataset Switcher */}
          {files.length > 1 && (
            <div className="flex items-center gap-2 bg-[#1A1E23] px-3 py-1.5 rounded-lg border border-[#2E353D]">
              <span className="text-xs text-[#8A95A5] font-medium">Switch place:</span>
              <select
                value={currentFileId}
                onChange={(e) => handleDatasetChange(e.target.value)}
                className="bg-transparent text-xs text-[#F4F2ED] font-semibold outline-none cursor-pointer"
              >
                {files.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#1A1E23] text-[#F4F2ED]">
                    {f.original_filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="secondary"
            icon="code"
            onClick={() => navigate(`/explorer?fileId=${currentFileId}`)}
          >
            Inspect Features
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
              if (currentFileId) {
                window.open(apiClient.getCsvDownloadUrl(currentFileId), '_blank');
              }
            }}
          >
            Export Results
          </Button>
        </div>
      </div>

      <div className="analysis-layout">
        <div className="map-panel panel flex flex-col">
          <div className="map-header">
            <div>
              <Icon name="layers" />
              <div>
                <strong>Interactive Spatial Map</strong>
                <span>
                  {stats?.polygon_count || 0} polygons · {stats?.linestring_count || 0} lines · {stats?.point_count || 0} points
                </span>
              </div>
            </div>
            <div className="map-tabs">
              <button
                className={activeTab === 'map' ? 'active' : ''}
                onClick={() => setActiveTab('map')}
              >
                Street Map
              </button>
              <button
                className={activeTab === 'satellite' ? 'active' : ''}
                onClick={() => setActiveTab('satellite')}
              >
                Satellite View
              </button>
            </div>
          </div>

          {/* Real Leaflet Map with actual Place coordinates and geometry */}
          <div className="flex-1 min-h-[460px] relative">
            {isLoadingMap ? (
              <div className="w-full h-full flex items-center justify-center bg-[#111315] text-[#8A95A5] text-xs">
                Rendering vector layers and bounding boxes...
              </div>
            ) : (
              <MapViewer
                geojson={geojson}
                tileMode={activeTab === 'satellite' ? 'satellite' : 'voyager'}
                selectedFeatureId={selectedFeatureId}
                onSelectFeature={(featId) => setSelectedFeatureId(featId)}
              />
            )}
          </div>
        </div>

        <aside className="summary-column">
          <div className="panel dataset-summary">
            <div className="panel-header">
              <div className="panel-title">Dataset Summary</div>
              <Icon name="more" />
            </div>
            <div className="feature-counts">
              <div>
                <span>FEATURES</span>
                <strong>{totalFeatures.toLocaleString()}</strong>
              </div>
              <div>
                <span>POLYGONS</span>
                <strong>{stats?.polygon_count ?? 0}</strong>
              </div>
              <div>
                <span>LINESTRINGS</span>
                <strong>{stats?.linestring_count ?? 0}</strong>
              </div>
              <div>
                <span>POINTS</span>
                <strong>{stats?.point_count ?? 0}</strong>
              </div>
            </div>
            <div className="crs-row">
              <div>
                <span>SOURCE CRS</span>
                <code title={sourceCrs}>{sourceCrs.length > 15 ? sourceCrs.slice(0, 15) + '...' : sourceCrs}</code>
              </div>
              <Icon name="arrow" />
              <div>
                <span>MEASUREMENT CRS</span>
                <code title={measureCrs}>{measureCrs.split(' ')[0]}</code>
              </div>
            </div>
          </div>

          <div className="measurement-card primary-measure">
            <span>TOTAL CALCULATED AREA</span>
            <strong>
              {formattedArea} <i>m²</i>
            </strong>
            <div>
              <span>{stats?.total_area_sqkm ? `${stats.total_area_sqkm.toFixed(4)} km²` : `${((stats?.total_area_sqm || 0) / 10000).toFixed(3)} ha`}</span>
              <span>{stats?.total_area_acres ? `${stats.total_area_acres.toFixed(3)} acres` : `${((stats?.total_area_sqm || 0) * 0.000247105).toFixed(3)} acres`}</span>
            </div>
          </div>

          <div className="measurement-card">
            <span>TOTAL LINE LENGTH</span>
            <strong>
              {formattedLength} <i>km</i>
            </strong>
            <div>
              <span>{(stats?.total_length_m || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} meters</span>
              <span>{((stats?.total_length_m || 0) * 0.000621371).toFixed(2)} miles</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="processing-summary panel">
        <div>
          <div className="panel-title">Processing & Validation Audit</div>
          <p>Technical metadata, projection transformations, and feature indexing</p>
        </div>
        {[
          ['FILE NAME', filename],
          ['FILE TYPE', selectedFile?.file_type === 'shapefile_zip' ? 'ESRI Shapefile (ZIP Package)' : 'Keyhole Markup Language (KML)'],
          ['STATUS', selectedFile?.status === 'COMPLETED' ? 'Validated & Indexed' : 'Processing'],
          ['DETECTED CRS', sourceCrs.length > 20 ? sourceCrs.slice(0, 20) + '...' : sourceCrs],
          ['CALCULATION PROJECTION', measureCrs],
        ].map(([a, b]) => (
          <div key={a}>
            <span>{a}</span>
            <strong className={a.includes('CRS') || a.includes('PROJECTION') ? 'mono' : ''}>{b}</strong>
          </div>
        ))}
        <StatusBadge value="Completed" />
      </div>
    </div>
  );
};

export default FileAnalysis;
