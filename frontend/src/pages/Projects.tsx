import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';

export const Projects: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      <section className="hero-row">
        <div>
          <div className="eyebrow">TERRAFLOW WORKSPACE</div>
          <div className="page-title">Projects</div>
          <p>Manage geospatial work across your engineering portfolio.</p>
        </div>
        <Button icon="plus" onClick={() => navigate('/upload')}>
          New dataset
        </Button>
      </section>

      <div className="empty-panel panel">
        <div className="empty-icon">
          <Icon name="folder" size={32} />
        </div>
        <div className="panel-title">Projects workspace is ready</div>
        <p>Upload a survey dataset to begin processing and measurement.</p>
        <Button onClick={() => navigate('/upload')}>Import survey file</Button>
      </div>
    </div>
  );
};
export default Projects;
