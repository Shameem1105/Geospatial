import React, { useState } from 'react';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { MapVisual } from '../components/MapVisual';

const featuresData = [
  ['001', 'Polygon', '4,823.21 m²', 'EPSG:4326', 'Residential', 'Calculated'],
  ['002', 'Polygon', '8,124.52 m²', 'EPSG:4326', 'Commercial', 'Calculated'],
  ['003', 'LineString', '1.82 km', 'EPSG:4326', 'Road', 'Calculated'],
  ['004', 'Point', '—', 'EPSG:4326', 'Survey Marker', 'No measurement'],
  ['005', 'Polygon', '3,208.90 m²', 'EPSG:4326', 'Utility Zone', 'Calculated'],
  ['006', 'LineString', '842.18 m', 'EPSG:4326', 'Drainage', 'Calculated'],
];

export const FeatureExplorer: React.FC = () => {
  const [selected, setSelected] = useState<string | null>('002');
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFeatures = featuresData.filter((r) => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Measured' && r[5] === 'Calculated') ||
      r[1] === filter;

    const matchesSearch =
      !searchTerm ||
      r[0].toLowerCase().includes(searchTerm.toLowerCase()) ||
      r[4].toLowerCase().includes(searchTerm.toLowerCase()) ||
      r[1].toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const selectedFeature = featuresData.find((f) => f[0] === selected);

  return (
    <div className="page">
      <section className="hero-row compact">
        <div>
          <div className="eyebrow">DATA INSPECTION</div>
          <div className="page-title">Feature Explorer</div>
          <p>Inspect geometry, properties, and calculated measurements.</p>
        </div>
        <Button
          icon="download"
          onClick={() => alert('Exporting features CSV/GeoJSON...')}
        >
          Export features
        </Button>
      </section>

      <div className="feature-tools">
        <div className="search feature-search">
          <Icon name="search" />
          <input
            type="text"
            placeholder="Search feature ID or property"
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
          <Icon name="filter" /> Filters <span>2</span>
        </button>
      </div>

      <div className="panel feature-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>GEOMETRY</th>
              <th>MEASUREMENT</th>
              <th>CRS</th>
              <th>PROPERTIES</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredFeatures.map((r) => (
              <tr
                className={selected === r[0] ? 'selected' : ''}
                onClick={() => setSelected(r[0])}
                key={r[0]}
              >
                <td>
                  <code>#{r[0]}</code>
                </td>
                <td>
                  <span className={`geometry-icon ${r[1].toLowerCase()}`} />
                  {r[1]}
                </td>
                <td className="measure-cell">{r[2]}</td>
                <td>
                  <code>{r[3]}</code>
                </td>
                <td>{r[4]}</td>
                <td>
                  <StatusBadge value={r[5]} />
                </td>
                <td>
                  <Icon name="arrow" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && selectedFeature && (
        <div className="drawer">
          <div className="drawer-head">
            <div>
              <span>SELECTED FEATURE</span>
              <div>FEATURE #{selected}</div>
            </div>
            <button onClick={() => setSelected(null)} aria-label="Close drawer">
              <Icon name="x" />
            </button>
          </div>
          <div className="mini-map">
            <MapVisual />
          </div>
          <div className="drawer-measure">
            <span>CALCULATED AREA</span>
            <strong>
              {selected === '002' ? '8,124.52' : selected === '001' ? '4,823.21' : '3,208.90'}{' '}
              <i>m²</i>
            </strong>
            <small>0.812 hectares · 2.008 acres</small>
          </div>
          <div className="detail-section">
            <div className="detail-label">GEOMETRY DETAILS</div>
            <div className="detail-grid">
              <span>
                Geometry<strong>{selectedFeature[1]}</strong>
              </span>
              <span>
                Status
                <strong className="success-text">{selectedFeature[5]}</strong>
              </span>
              <span>
                Source CRS<code>EPSG:4326</code>
              </span>
              <span>
                Measurement CRS<code>EPSG:32644</code>
              </span>
            </div>
          </div>
          <div className="detail-section">
            <div className="detail-label">COORDINATES</div>
            <pre>
              13.082742, 80.270718{'\n'}
              13.082861, 80.271904{'\n'}
              13.081902, 80.272118{'\n'}+ 12 vertices
            </pre>
          </div>
          <div className="detail-section">
            <div className="detail-label">PROPERTIES</div>
            <div className="property-row">
              <span>Survey ID</span>
              <strong>{selected}</strong>
            </div>
            <div className="property-row">
              <span>Zone</span>
              <strong>{selectedFeature[4]}</strong>
            </div>
            <div className="property-row">
              <span>Land use</span>
              <strong>Mixed development</strong>
            </div>
          </div>
          <Button icon="layers" onClick={() => alert('Focusing on spatial viewer...')}>
            View on Map
          </Button>
        </div>
      )}
    </div>
  );
};
export default FeatureExplorer;
