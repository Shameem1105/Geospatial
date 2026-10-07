import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { apiClient } from '../api/client';

export const Processing: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileId = searchParams.get('fileId');
  const filename = searchParams.get('filename') || 'Chennai_Site_Survey.kml';

  const [progress, setProgress] = useState(82);

  const getStepState = (stepIndex: number): 'done' | 'active' | 'pending' => {
    const currentIndex = Math.floor((progress / 100) * 8);
    if (stepIndex < currentIndex) return 'done';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const steps = [
    { label: 'File validated', state: getStepState(0) },
    { label: 'Dataset parsed', state: getStepState(1) },
    { label: '1,284 features detected', state: getStepState(2) },
    { label: 'CRS detected: EPSG:4326', state: getStepState(3) },
    { label: 'Geometry validation complete', state: getStepState(4) },
    {
      label: 'Transforming coordinates',
      state: getStepState(5),
      sub: 'Transforming to projected CRS EPSG:32644',
    },
    { label: 'Calculating measurements', state: getStepState(6) },
    { label: 'Storing results', state: getStepState(7) },
  ];

  // Poll real job if fileId is present
  useEffect(() => {
    if (!fileId) return;

    const interval = setInterval(async () => {
      try {
        const file = await apiClient.getFile(fileId);
        if (file.processing_job?.progress) {
          setProgress(file.processing_job.progress);
        }
        if (file.status === 'COMPLETED') {
          clearInterval(interval);
          navigate(`/analysis?fileId=${fileId}`);
        }
      } catch (e) {
        console.log('Status polling:', e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [fileId, navigate]);

  return (
    <div className="page processing-page">
      <div className="processing-heading">
        <div className="processing-file-icon">
          <Icon name="file" size={26} />
        </div>
        <div>
          <div className="eyebrow">PROCESSING DATASET</div>
          <div className="page-title">{filename}</div>
          <p>18.4 MB · KML dataset</p>
        </div>
        <StatusBadge value="Processing" />
      </div>

      <div className="progress-panel panel">
        <div className="progress-top">
          <div>
            <span>OVERALL PROGRESS</span>
            <strong>{progress}%</strong>
          </div>
          <span>Estimated time remaining: 4 seconds</span>
        </div>
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="processing-layout">
        <div className="panel steps-panel">
          <div className="panel-title">Processing pipeline</div>
          <div className="steps">
            {steps.map((s) => (
              <div className={`step ${s.state}`} key={s.label}>
                <span>
                  {s.state === 'done' ? (
                    <Icon name="check" size={14} />
                  ) : s.state === 'active' ? (
                    <span className="spinner" />
                  ) : (
                    ''
                  )}
                </span>
                <div>
                  <strong>{s.label}</strong>
                  {s.state === 'active' && s.sub && <small>{s.sub}</small>}
                </div>
                {s.state === 'done' && <small>Complete</small>}
              </div>
            ))}
          </div>
        </div>

        <div className="processing-side">
          <div className="panel">
            <div className="panel-title">Live statistics</div>
            <div className="live-feature">
              <span>FEATURES PROCESSED</span>
              <strong>
                1,053 <i>/ 1,284</i>
              </strong>
              <div className="mini-progress">
                <span style={{ width: '82%' }} />
              </div>
            </div>
            <div className="stat-list">
              <div>
                <span>Polygons</span>
                <strong>842</strong>
              </div>
              <div>
                <span>LineStrings</span>
                <strong>196</strong>
              </div>
              <div>
                <span>Points</span>
                <strong>15</strong>
              </div>
            </div>
          </div>

          <div className="operation-card">
            <div className="operation-icon">
              <Icon name="layers" />
            </div>
            <div>
              <span>CURRENT OPERATION</span>
              <strong>Transforming geometries to projected coordinate system…</strong>
              <code>EPSG:4326 → EPSG:32644</code>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => navigate(fileId ? `/analysis?fileId=${fileId}` : '/analysis')}
          >
            Preview completed analysis
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Processing;
