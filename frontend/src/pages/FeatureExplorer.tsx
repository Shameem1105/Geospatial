import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { FeatureMiniMap } from '../components/FeatureMiniMap';
import { apiClient } from '../api/client';
import type { FeatureItem, FileRecord } from '../types';

export const FeatureExplorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialFileId = searchParams.get('fileId');

  // Fetch all available files
  const { data: files = [] } = useQuery<FileRecord[]>({
    queryKey: ['files'],
    queryFn: () => apiClient.listFiles().catch(() => []),
  });

  const [selectedFileId, setSelectedFileId] = useState<string>(initialFileId || '');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Update selectedFileId when files load if not set
  useEffect(() => {
    if (!selectedFileId && files.length > 0) {
      // Default to Bangalore if available, else first file
      const bangalore = files.find(f => f.original_filename.toLowerCase().includes('bangalore'));
      const defaultId = bangalore ? bangalore.id : files[0].id;
      setSelectedFileId(defaultId);
      setSearchParams({ fileId: defaultId });
    } else if (initialFileId && initialFileId !== selectedFileId) {
      setSelectedFileId(initialFileId);
    }
  }, [files, initialFileId, selectedFileId, setSearchParams]);

  // Fetch features for currently selected file
  const { data: featuresResponse, isLoading: isLoadingFeatures } = useQuery({
    queryKey: ['features', selectedFileId],
    queryFn: () => (selectedFileId ? apiClient.getFileFeatures(selectedFileId, { page_size: 100 }) : null),
    enabled: !!selectedFileId,
  });

  const { data: fileStats } = useQuery({
    queryKey: ['file-stats', selectedFileId],
    queryFn: () => (selectedFileId ? apiClient.getFileStatistics(selectedFileId) : null),
    enabled: !!selectedFileId,
  });

  const rawFeatures: FeatureItem[] = featuresResponse?.features || [];

  // Filter features
  const filteredFeatures = rawFeatures.filter((item) => {
    const geomType = item.geometry_type;
    const isMeasured = item.measurement && item.measurement.measurement_value != null;
    const propString = JSON.stringify(item.properties || '').toLowerCase();
    const name = item.properties?.name || item.properties?.FACILITY || item.properties?.ZONE_ID || '';

    const matchesFilter =
      filter === 'All' ||
      (filter === 'Measured' && isMeasured) ||
      (filter === 'Unsupported' && item.processing_status === 'UNSUPPORTED') ||
      geomType.toLowerCase() === filter.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.feature_index).includes(searchTerm) ||
      propString.includes(searchTerm.toLowerCase()) ||
      geomType.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Set default selected feature when features load
  useEffect(() => {
    if (rawFeatures.length > 0 && !selectedFeatureId) {
      setSelectedFeatureId(rawFeatures[0].id);
    } else if (rawFeatures.length > 0 && !rawFeatures.some(f => f.id === selectedFeatureId)) {
      setSelectedFeatureId(rawFeatures[0].id);
    }
  }, [rawFeatures, selectedFeatureId]);

  const selectedFeature = rawFeatures.find((f) => f.id === selectedFeatureId) || (rawFeatures.length > 0 ? rawFeatures[0] : null);



  // Helper to extract clean vertices
  const extractCoordinates = (geometry: any): string[] => {
    if (!geometry || !geometry.coordinates) return ['No geometry coordinates available'];
    const coords = geometry.coordinates;
    const points: [number, number][] = [];

    const recurse = (arr: any) => {
      if (Array.isArray(arr) && arr.length >= 2 && typeof arr[0] === 'number') {
        points.push([arr[1], arr[0]]); // [lat, lon]
      } else if (Array.isArray(arr)) {
        arr.forEach(recurse);
      }
    };
    recurse(coords);

    return points.slice(0, 5).map(p => `${p[0].toFixed(6)}, ${p[1].toFixed(6)}`);
  };

  const handleFileChange = (newFileId: string) => {
    setSelectedFileId(newFileId);
    setSelectedFeatureId(null);
    setSearchParams({ fileId: newFileId });
  };

  const formatMeasurement = (feat: FeatureItem) => {
    if (!feat.measurement || feat.measurement.measurement_value == null) {
      return '—';
    }
    const val = feat.measurement.measurement_value;
    const unit = feat.measurement.measurement_unit;
    if (feat.measurement.measurement_type === 'AREA') {
      return `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
    }
    if (feat.measurement.measurement_type === 'LENGTH') {
      if (val >= 1000) {
        return `${(val / 1000).toFixed(2)} km`;
      }
      return `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
    }
    return '—';
  };

  return (
    <div className="page">
      <section className="hero-row compact">
        <div>
          <div className="eyebrow">DATA INSPECTION</div>
          <div className="page-title">Feature Explorer</div>
          <p>Inspect real geometry, coordinates, and calculated measurements across survey datasets.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Dataset Selector Dropdown */}
          <div className="flex items-center gap-2 bg-[#1A1E23] px-3 py-1.5 rounded-lg border border-[#2E353D]">
            <span className="text-xs text-[#8A95A5] font-medium">Dataset:</span>
            <select
              value={selectedFileId}
              onChange={(e) => handleFileChange(e.target.value)}
              className="bg-transparent text-xs text-[#F4F2ED] font-semibold outline-none cursor-pointer"
            >
              {files.map((file) => (
                <option key={file.id} value={file.id} className="bg-[#1A1E23] text-[#F4F2ED]">
                  {file.original_filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <Button
            icon="layers"
            variant="secondary"
            onClick={() => navigate(`/analysis?fileId=${selectedFileId}`)}
          >
            Spatial Map
          </Button>

          <Button
            icon="download"
            onClick={() => {
              if (selectedFileId) {
                window.open(apiClient.getCsvDownloadUrl(selectedFileId), '_blank');
              }
            }}
          >
            Export CSV
          </Button>
        </div>
      </section>

      <div className="feature-tools">
        <div className="search feature-search">
          <Icon name="search" />
          <input
            type="text"
            placeholder="Search feature ID, name, or property (e.g. Bangalore, Chennai, Metro, Zone...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 outline-none text-[#F4F2ED] text-xs w-full"
          />
        </div>
        <div className="filter-tabs">
          {['All', 'Polygon', 'LineString', 'Point', 'Measured', 'Unsupported'].map((x) => (
            <button
              className={filter === x ? 'active' : ''}
              onClick={() => setFilter(x)}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>
        <button className="filter-button">
          <Icon name="filter" /> Features <span>{filteredFeatures.length}</span>
        </button>
      </div>

      <div className="panel feature-table">
        {isLoadingFeatures ? (
          <div className="p-8 text-center text-[#8A95A5] text-xs">Loading spatial features from database...</div>
        ) : filteredFeatures.length === 0 ? (
          <div className="p-8 text-center text-[#8A95A5] text-xs">
            No features found matching "{searchTerm}". Try clearing your search filter.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME / PLACE</th>
                <th>GEOMETRY</th>
                <th>MEASUREMENT</th>
                <th>CRS</th>
                <th>PROPERTIES</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map((feat) => {
                const featName = feat.properties?.name || feat.properties?.FACILITY || feat.properties?.ZONE_ID || `Feature #${feat.feature_index}`;
                const isSelected = selectedFeature?.id === feat.id;

                return (
                  <tr
                    className={isSelected ? 'selected' : ''}
                    onClick={() => setSelectedFeatureId(feat.id)}
                    key={feat.id}
                  >
                    <td>
                      <code>#{String(feat.feature_index).padStart(3, '0')}</code>
                    </td>
                    <td>
                      <strong className="text-[#F4F2ED] font-medium">{featName}</strong>
                    </td>
                    <td>
                      <span className={`geometry-icon ${feat.geometry_type.toLowerCase()}`} />
                      {feat.geometry_type}
                    </td>
                    <td className="measure-cell">{formatMeasurement(feat)}</td>
                    <td>
                      <code>{feat.source_crs || 'EPSG:4326'}</code>
                    </td>
                    <td>
                      <span className="text-xs text-[#B2BCC9]">
                        {feat.properties?.LAND_USE || feat.properties?.STRUCTURE || feat.properties?.ZONE_ID || feat.properties?.description || 'Standard Feature'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge value={feat.processing_status === 'SUCCESS' ? 'Calculated' : feat.processing_status} />
                    </td>
                    <td>
                      <Icon name="arrow" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedFeature && (
        <div className="drawer">
          <div className="drawer-head">
            <div>
              <span>SELECTED FEATURE</span>
              <div className="truncate max-w-[240px]">
                {selectedFeature.properties?.name || selectedFeature.properties?.FACILITY || selectedFeature.properties?.ZONE_ID || `FEATURE #${String(selectedFeature.feature_index).padStart(3, '0')}`}
              </div>
            </div>
            <button onClick={() => setSelectedFeatureId(null)} aria-label="Close drawer">
              <Icon name="x" />
            </button>
          </div>

          {/* Real Leaflet Mini Map focused on the exact feature coordinates */}
          <div className="mini-map">
            <FeatureMiniMap feature={selectedFeature} />
          </div>

          {/* Calculated Measurement Details */}
          {selectedFeature.measurement?.measurement_type === 'AREA' && selectedFeature.measurement.measurement_value != null && (
            <div className="drawer-measure">
              <span>CALCULATED AREA</span>
              <strong>
                {selectedFeature.measurement.measurement_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                <i>m²</i>
              </strong>
              <small>
                {(selectedFeature.measurement.measurement_value / 10000).toFixed(3)} hectares · {(selectedFeature.measurement.measurement_value * 0.000247105).toFixed(3)} acres
              </small>
            </div>
          )}

          {selectedFeature.measurement?.measurement_type === 'LENGTH' && selectedFeature.measurement.measurement_value != null && (
            <div className="drawer-measure">
              <span>CALCULATED LENGTH</span>
              <strong>
                {(selectedFeature.measurement.measurement_value >= 1000 ? selectedFeature.measurement.measurement_value / 1000 : selectedFeature.measurement.measurement_value).toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                <i>{selectedFeature.measurement.measurement_value >= 1000 ? 'km' : 'm'}</i>
              </strong>
              <small>
                {selectedFeature.measurement.measurement_value.toLocaleString(undefined, { maximumFractionDigits: 1 })} meters · {(selectedFeature.measurement.measurement_value * 0.000621371).toFixed(2)} miles
              </small>
            </div>
          )}

          <div className="detail-section">
            <div className="detail-label">GEOMETRY DETAILS</div>
            <div className="detail-grid">
              <span>
                Geometry<strong>{selectedFeature.geometry_type}</strong>
              </span>
              <span>
                Status
                <strong className="success-text">{selectedFeature.processing_status}</strong>
              </span>
              <span>
                Source CRS<code>{selectedFeature.source_crs || 'EPSG:4326'}</code>
              </span>
              <span>
                Measurement CRS<code>{selectedFeature.measurement?.calculation_crs || fileStats?.calculation_crs || 'EPSG:32643'}</code>
              </span>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-label">REAL COORDINATES (LAT, LON)</div>
            <pre>
              {extractCoordinates(selectedFeature.geometry_data).join('\n')}
              {selectedFeature.geometry_data?.coordinates?.length > 1 ? '\n+ multiple vertices' : ''}
            </pre>
          </div>

          <div className="detail-section">
            <div className="detail-label">FEATURE PROPERTIES</div>
            <div className="property-row">
              <span>Feature Index</span>
              <strong>#{selectedFeature.feature_index}</strong>
            </div>
            {selectedFeature.properties && Object.entries(selectedFeature.properties).map(([key, value]) => {
              if (typeof value === 'object') return null;
              return (
                <div className="property-row" key={key}>
                  <span className="truncate max-w-[120px]">{key}</span>
                  <strong className="truncate max-w-[160px] text-right" title={String(value)}>{String(value)}</strong>
                </div>
              );
            })}
          </div>

          <Button 
            icon="layers" 
            onClick={() => navigate(`/analysis?fileId=${selectedFileId}`)}
          >
            View on Full Spatial Map
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeatureExplorer;
