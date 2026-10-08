import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { apiClient } from '../api/client';
import type { FileRecord } from '../types';

export const SurveyFiles: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: files = [], isLoading } = useQuery<FileRecord[]>({
    queryKey: ['files'],
    queryFn: () => apiClient.listFiles().catch(() => []),
  });

  const filteredFiles = files.filter((f) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.original_filename.toLowerCase().includes(term) ||
      f.file_type.toLowerCase().includes(term) ||
      (f.detected_crs || '').toLowerCase().includes(term)
    );
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="page">
      <section className="hero-row">
        <div>
          <div className="eyebrow">TERRAFLOW WORKSPACE</div>
          <div className="page-title">Survey Files Catalog</div>
          <p>Browse, inspect, and analyze all imported geospatial packages across Bangalore, Chennai, Mumbai, Hyderabad, and Delhi.</p>
        </div>
        <Button icon="cloud" onClick={() => navigate('/upload')}>
          Import Survey File
        </Button>
      </section>

      <div className="feature-tools">
        <div className="search feature-search">
          <Icon name="search" />
          <input
            type="text"
            placeholder="Search datasets (e.g. Bangalore, Chennai, Metro, Shapefile...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 outline-none text-[#F4F2ED] text-xs w-full"
          />
        </div>
      </div>

      <div className="panel feature-table">
        {isLoading ? (
          <div className="p-8 text-center text-[#8A95A5] text-xs">Loading survey dataset catalog...</div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-[#8A95A5] text-xs">
            No survey files found. Upload a KML or Shapefile to begin.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>DATASET / PLACE</th>
                <th>FORMAT</th>
                <th>FEATURES</th>
                <th>DETECTED CRS</th>
                <th>SIZE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => {
                const displayName = file.original_filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
                const isZip = file.original_filename.endsWith('.zip');

                return (
                  <tr key={file.id} className="hover:bg-[#1C2026] cursor-pointer">
                    <td>
                      <div className="file-cell">
                        <span className="file-icon">
                          <Icon name={isZip ? 'folder' : 'file'} size={16} />
                        </span>
                        <div>
                          <strong className="text-[#F4F2ED] block text-sm">{displayName}</strong>
                          <span className="text-[11px] text-[#8A95A5] font-mono">{file.original_filename}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#22272B] text-amber-400 border border-[#2E353D]">
                        {file.file_type === 'shapefile_zip' ? 'SHAPEFILE' : 'KML'}
                      </span>
                    </td>
                    <td className="mono text-amber-400 font-bold">
                      {file.feature_count.toLocaleString()}
                    </td>
                    <td>
                      <code className="text-[11px]" title={file.detected_crs || 'EPSG:4326'}>
                        {(file.detected_crs || 'EPSG:4326').slice(0, 15)}
                      </code>
                    </td>
                    <td className="text-xs text-[#8A95A5]">{formatFileSize(file.file_size)}</td>
                    <td>
                      <StatusBadge value={file.status === 'COMPLETED' ? 'Completed' : 'Processing'} />
                    </td>
                    <td>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/analysis?fileId=${file.id}`)}
                          className="px-2.5 py-1 rounded bg-[#2A3038] hover:bg-amber-500 hover:text-black text-xs text-[#F4F2ED] font-medium transition-all"
                          title="Open Interactive Map"
                        >
                          Map View
                        </button>
                        <button
                          onClick={() => navigate(`/explorer?fileId=${file.id}`)}
                          className="px-2.5 py-1 rounded bg-[#1F242A] hover:bg-[#2F3640] text-xs text-[#8A95A5] hover:text-[#F4F2ED] transition-all"
                          title="Inspect Features & Measurements"
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
    </div>
  );
};

export default SurveyFiles;
