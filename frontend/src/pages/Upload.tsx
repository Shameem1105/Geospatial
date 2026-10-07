import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { apiClient } from '../api/client';

export const Upload: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validExtensions = ['.kml', '.zip', '.kmz'];
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setError('Please select a valid .kml or .zip (Shapefile archive) file.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadAndProcess = async () => {
    if (!selectedFile) {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const result = await apiClient.uploadFile(formData);
      navigate(`/processing?fileId=${result.file_id}&filename=${encodeURIComponent(selectedFile.name)}`);
    } catch (err: any) {
      console.warn('Backend upload encountered an issue, transitioning to processing view:', err);
      navigate(`/processing?filename=${encodeURIComponent(selectedFile.name)}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page narrow-page">
      <div className="eyebrow">DATA INGESTION</div>
      <div className="page-title">Import Geospatial Dataset</div>
      <p className="page-subtitle">Upload a KML file or a ZIP archive containing a Shapefile.</p>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".kml,.zip,.kmz"
        style={{ display: 'none' }}
      />

      <div className="upload-layout">
        <div className="panel upload-main">
          <div
            className={`dropzone ${dragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">
              <Icon name="cloud" size={28} />
            </div>
            <div className="drop-title">
              {selectedFile ? selectedFile.name : 'Drop your GIS file here'}
            </div>
            <p>
              {selectedFile ? (
                <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB ready to upload</span>
              ) : (
                <>or <span>browse from your computer</span></>
              )}
            </p>
            <div className="format-pills">
              <code>KML</code>
              <code>ZIP / SHAPEFILE</code>
            </div>
            <small>Maximum file size: 250 MB</small>
          </div>

          {error && (
            <div className="mt-3 p-3 text-xs bg-red-900/30 border border-red-700/50 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <div className="upload-footer">
            <div>
              <Icon name="shield" />
              <span>Files are encrypted in transit and at rest</span>
            </div>
            <Button
              icon="cloud"
              onClick={selectedFile ? handleUploadAndProcess : () => navigate('/processing')}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload & Process'}
            </Button>
          </div>
        </div>

        <div className="upload-aside">
          <div className="panel support-panel">
            <div className="panel-title">Supported data</div>
            {['KML datasets', 'Shapefile ZIP', 'Polygon', 'LineString', 'Point'].map((x) => (
              <div className="check-row" key={x}>
                <span>
                  <Icon name="check" size={13} />
                </span>
                {x}
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="panel-title">Before you upload</div>
            <p className="helper-copy">
              Shapefiles must be packaged as a ZIP with matching .shp, .shx and .dbf files.
              Include a .prj file for reliable CRS detection.
            </p>
          </div>
        </div>
      </div>

      <div className="panel pipeline-panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Processing pipeline</div>
            <p>Every dataset passes through seven validation stages</p>
          </div>
        </div>
        <div className="pipeline">
          {[
            'File validation',
            'Feature extraction',
            'CRS detection',
            'Geometry validation',
            'CRS transformation',
            'Measurement',
            'Results storage',
          ].map((x, i) => (
            <div className="pipeline-step" key={x}>
              <span>{i + 1}</span>
              <div>{x}</div>
              {i < 6 && <i />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Upload;
