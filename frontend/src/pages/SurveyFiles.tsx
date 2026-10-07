import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';

export const SurveyFiles: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      <section className="hero-row">
        <div>
          <div className="eyebrow">TERRAFLOW WORKSPACE</div>
          <div className="page-title">Survey Files</div>
          <p>Browse, inspect, and export all imported survey packages.</p>
        </div>
        <Button icon="cloud" onClick={() => navigate('/upload')}>
          Import Survey File
        </Button>
      </section>

      <div className="empty-panel panel">
        <div className="empty-icon">
          <Icon name="file" size={32} />
        </div>
        <div className="panel-title">Survey files catalog</div>
        <p>No external archive selected. Upload your first KML or Shapefile.</p>
        <Button onClick={() => navigate('/upload')}>Import survey file</Button>
      </div>
    </div>
  );
};
export default SurveyFiles;
