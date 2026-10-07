import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { apiClient } from '../api/client';
import type { FileRecord } from '../types';

const defaultProcessingRows = [
  ['Chennai_Site_Survey.kml', 'Chennai Metro Site', '1,284', 'EPSG:4326', 'Completed', '2 min ago', 'chennai-survey'],
  ['Highway_Section_A.zip', 'NH Infrastructure', '8,421', 'EPSG:32644', 'Completed', '18 min ago', 'highway-a'],
  ['Industrial_Plot_07.kml', 'Industrial Zone', '482', 'EPSG:4326', 'Processing', '24 min ago', 'plot-07'],
  ['Bridge_Corridor_V2.zip', 'Eastern Corridor', '2,108', 'EPSG:32643', 'Completed', 'Yesterday', 'bridge-v2'],
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: files = [] } = useQuery<FileRecord[]>({
    queryKey: ['files'],
    queryFn: () => apiClient.listFiles().catch(() => []),
    refetchInterval: 10000,
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiClient.getAnalytics().catch(() => null),
    refetchInterval: 15000,
  });

  const displayRows = files.length > 0
    ? files.map((f) => [
        f.original_filename,
        'Horizon Civil',
        f.feature_count?.toLocaleString() || '—',
        f.detected_crs || 'EPSG:4326',
        f.status === 'COMPLETED' ? 'Completed' : f.status === 'FAILED' ? 'Failed' : 'Processing',
        new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        f.id,
      ])
    : defaultProcessingRows;

  return (
    <div className="page">
      <section className="hero-row">
        <div>
          <div className="eyebrow">OPERATIONS CONTROL</div>
          <div className="page-title">Geospatial Operations</div>
          <p>Process survey datasets, calculate measurements, and analyze site geometry.</p>
        </div>
        <div className="button-row">
          <Button variant="secondary" onClick={() => navigate('/reports')}>
            View Documentation
          </Button>
          <Button icon="cloud" onClick={() => navigate('/upload')}>
            Upload Survey File
          </Button>
        </div>
      </section>

      <div className="metrics-grid">
        <MetricCard
          label="TOTAL PROJECTS"
          value={analytics?.total_projects || '24'}
          detail="3 this month"
        />
        <MetricCard
          label="FILES PROCESSED"
          value={files.length > 0 ? files.length.toLocaleString() : '1,284'}
          detail="12.4% from last month"
        />
        <MetricCard
          label="TOTAL FEATURES"
          value={analytics?.total_features ? analytics.total_features.toLocaleString() : '84,291'}
          detail="8,492 newly indexed"
          accent
        />
        <MetricCard
          label="PROCESSING SUCCESS"
          value="98.7%"
          detail="0.4% improvement"
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel recent-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Recent Processing</div>
              <p>Latest geospatial datasets across your workspace</p>
            </div>
            <button className="text-button" onClick={() => navigate('/files')}>
              View all files <Icon name="arrow" size={14} />
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>FILE NAME</th>
                  <th>PROJECT</th>
                  <th>FEATURES</th>
                  <th>CRS</th>
                  <th>STATUS</th>
                  <th>UPLOADED</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {displayRows.map((r) => (
                  <tr
                    key={r[0]}
                    onClick={() => {
                      if (r[4] === 'Processing') {
                        navigate('/processing');
                      } else {
                        navigate(`/analysis?fileId=${r[6]}`);
                      }
                    }}
                  >
                    <td>
                      <div className="file-cell">
                        <span className="file-icon">
                          <Icon name={r[0].endsWith('zip') ? 'folder' : 'file'} size={16} />
                        </span>
                        <strong>{r[0]}</strong>
                      </div>
                    </td>
                    <td>{r[1]}</td>
                    <td className="mono">{r[2]}</td>
                    <td>
                      <code>{r[3]}</code>
                    </td>
                    <td>
                      <StatusBadge value={r[4]} />
                    </td>
                    <td>{r[5]}</td>
                    <td>
                      <Icon name="more" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="activity-panel panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">System activity</div>
              <p>Last 24 hours</p>
            </div>
            <span className="live">
              <span /> LIVE
            </span>
          </div>
          <div className="activity-chart">
            <div className="chart-lines" />
            {[35, 52, 42, 68, 60, 76, 58, 86, 70, 94, 78, 88].map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className={i === 9 ? 'hot' : ''}
              />
            ))}
          </div>
          <div className="chart-scale">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
          </div>
          <div className="activity-stats">
            <div>
              <strong>3.8s</strong>
              <span>Avg. process time</span>
            </div>
            <div>
              <strong>14</strong>
              <span>Jobs completed</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
export default Dashboard;
