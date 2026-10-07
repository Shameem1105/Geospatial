import React, { useState } from 'react';
import { Icon, type IconName } from '../components/Icons';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';

export const Reports: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState('Bangalore Tech Park');
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'Executive summary',
    'Feature measurements',
    'CRS & processing metadata',
  ]);

  const projectReports: Record<string, {
    area: string;
    length: string;
    features: string;
    sourceCrs: string;
    measureCrs: string;
    date: string;
  }> = {
    'Bangalore Tech Park': {
      area: '72,436.34 m²',
      length: '2.45 km',
      features: '3',
      sourceCrs: 'EPSG:4326',
      measureCrs: 'EPSG:32643 (UTM 43N)',
      date: '08 Oct 2026',
    },
    'Chennai Metro Corridor': {
      area: '48,293.72 m²',
      length: '24.03 km',
      features: '5',
      sourceCrs: 'EPSG:4326',
      measureCrs: 'EPSG:32644 (UTM 44N)',
      date: '08 Oct 2026',
    },
    'Mumbai Coastal Road': {
      area: '34,120.00 m²',
      length: '29.20 km',
      features: '4',
      sourceCrs: 'EPSG:4326',
      measureCrs: 'EPSG:32643 (UTM 43N)',
      date: '08 Oct 2026',
    },
    'Hyderabad HITEC City': {
      area: '165,000.00 m²',
      length: '8.40 km',
      features: '4',
      sourceCrs: 'EPSG:4326',
      measureCrs: 'EPSG:32644 (UTM 44N)',
      date: '08 Oct 2026',
    },
    'Delhi Aerocity Infrastructure': {
      area: '170,000.00 m²',
      length: '7.20 km',
      features: '6',
      sourceCrs: 'EPSG:4326',
      measureCrs: 'EPSG:32643 (UTM 43N)',
      date: '08 Oct 2026',
    },
    'Dubai Marina Development': {
      area: '196,400.00 m²',
      length: '5.10 km',
      features: '4',
      sourceCrs: 'EPSG:4326',
      measureCrs: 'EPSG:32640 (UTM 40N)',
      date: '08 Oct 2026',
    },
  };

  const currentReport = projectReports[selectedProject] || projectReports['Bangalore Tech Park'];

  const reportActions: [string, string, IconName][] = [
    ['Generate Site Report', 'Full measurement summary', 'report'],
    ['Export CSV', 'Structured feature data', 'download'],
    ['Export JSON', 'API-ready geometry data', 'code'],
    ['Download PDF', 'Branded field report', 'file'],
  ];

  const sectionsList = [
    'Executive summary',
    'Feature measurements',
    'CRS & processing metadata',
    'Geometry exceptions',
  ];

  const toggleSection = (s: string) => {
    if (selectedSections.includes(s)) {
      setSelectedSections(selectedSections.filter((item) => item !== s));
    } else {
      setSelectedSections([...selectedSections, s]);
    }
  };

  return (
    <div className="page">
      <section className="hero-row compact">
        <div>
          <div className="eyebrow">DOCUMENTATION</div>
          <div className="page-title">Measurement Reports</div>
          <p>Generate audit-ready summaries for teams and stakeholders.</p>
        </div>
        <Button icon="plus" onClick={() => window.print()}>
          Generate report
        </Button>
      </section>

      <div className="report-layout">
        <div>
          <div className="report-actions">
            {reportActions.map(([title, desc, iconName]) => (
              <div
                className="report-action panel"
                key={title}
                onClick={() => {
                  if (title === 'Export CSV') {
                    window.open('/api/v1/reports/csv/latest', '_blank');
                  } else {
                    window.print();
                  }
                }}
              >
                <span>
                  <Icon name={iconName} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <small>{desc}</small>
                </div>
                <Icon name="arrow" />
              </div>
            ))}
          </div>

          <div className="panel report-options">
            <div className="panel-title">Report configuration</div>
            <label>
              Project
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                {Object.keys(projectReports).map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
            <label>Include sections</label>
            {sectionsList.map((x) => {
              const isChecked = selectedSections.includes(x);
              return (
                <div
                  className="checkbox-row"
                  key={x}
                  onClick={() => toggleSection(x)}
                  style={{ cursor: 'pointer' }}
                >
                  <span style={{ opacity: isChecked ? 1 : 0.2 }}>
                    <Icon name="check" size={12} />
                  </span>
                  {x}
                </div>
              );
            })}
          </div>
        </div>

        <div className="report-preview-wrap">
          <div className="preview-label">
            <span>REPORT PREVIEW</span>
            <span>Page 1 of 4</span>
          </div>
          <div className="report-paper">
            <div className="report-brand">
              <Logo compact />
              <div>
                <span>GENERATED BY</span>
                <strong>TERRAFLOW</strong>
              </div>
            </div>
            <div className="report-kicker">SITE MEASUREMENT REPORT</div>
            <div className="report-title">
              {selectedProject}
            </div>
            <div className="report-rule" />
            <div className="report-meta">
              <div>
                <span>PROJECT</span>
                <strong>{selectedProject}</strong>
              </div>
              <div>
                <span>PROCESSING DATE</span>
                <strong>{currentReport.date}</strong>
              </div>
            </div>
            <div className="report-total">
              <span>TOTAL MEASURED AREA</span>
              <strong>
                {currentReport.area}
              </strong>
            </div>
            <div className="report-data">
              <div>
                <span>TOTAL FEATURES</span>
                <strong>{currentReport.features}</strong>
              </div>
              <div>
                <span>TOTAL LINE LENGTH</span>
                <strong>{currentReport.length}</strong>
              </div>
              <div>
                <span>SOURCE CRS</span>
                <code>{currentReport.sourceCrs}</code>
              </div>
              <div>
                <span>MEASUREMENT CRS</span>
                <code>{currentReport.measureCrs}</code>
              </div>
            </div>
            <div className="report-footer">
              Verified geospatial processing record{' '}
              <span>TERRAFLOW / TF-2026-10284</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Reports;
