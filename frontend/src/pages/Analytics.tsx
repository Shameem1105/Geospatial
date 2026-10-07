import React from 'react';
import { Icon } from '../components/Icons';

export const Analytics: React.FC = () => {
  const period = 'Last 30 days';

  const stats = [
    ['Total Area', '482.9', 'ha'],
    ['Total Length', '1,284', 'km'],
    ['Feature Count', '84,291', ''],
    ['Polygon Count', '58,420', ''],
    ['LineStrings', '24,003', ''],
    ['Points', '1,868', ''],
  ];

  const distribution = [
    ['Residential', 78],
    ['Commercial', 54],
    ['Infrastructure', 88],
    ['Industrial', 63],
    ['Utilities', 32],
    ['Other', 21],
  ];

  const scatterPoints = [
    [8, 75],
    [17, 62],
    [29, 72],
    [38, 44],
    [49, 58],
    [58, 28],
    [72, 42],
    [84, 18],
  ];

  return (
    <div className="page">
      <section className="hero-row compact">
        <div>
          <div className="eyebrow">WORKSPACE INTELLIGENCE</div>
          <div className="page-title">Engineering Analytics</div>
          <p>Measurement and processing performance across all datasets.</p>
        </div>
        <div className="period-select">
          {period} <Icon name="arrow" />
        </div>
      </section>

      <div className="analytics-metrics">
        {stats.map(([a, b, c]) => (
          <div className="analytics-stat" key={a}>
            <span>{a}</span>
            <strong>
              {b} <i>{c}</i>
            </strong>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <div className="panel chart-panel wide">
          <div className="panel-header">
            <div>
              <div className="panel-title">Area distribution by feature</div>
              <p>Top measured land-use categories</p>
            </div>
            <span className="legend-dot">Calculated area</span>
          </div>
          <div className="bar-chart">
            {distribution.map(([x, n]) => (
              <div key={x}>
                <span>{x}</span>
                <div>
                  <i style={{ width: `${n}%` }} />
                </div>
                <strong>{n}k m²</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel donut-panel">
          <div className="panel-title">Feature type distribution</div>
          <div className="donut">
            <div>
              <strong>84,291</strong>
              <span>FEATURES</span>
            </div>
          </div>
          <div className="donut-legend">
            <span>
              <i />
              Polygon <strong>69.3%</strong>
            </span>
            <span>
              <i />
              LineString <strong>28.5%</strong>
            </span>
            <span>
              <i />
              Point <strong>2.2%</strong>
            </span>
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-title">Processing history</div>
          <p>Completed jobs per day</p>
          <div className="line-chart">
            <svg viewBox="0 0 500 170">
              <path d="M0 140 C60 134 72 88 120 99 S186 130 230 82 290 26 330 62 395 118 430 71 500 29" />
              <path
                className="area"
                d="M0 140 C60 134 72 88 120 99 S186 130 230 82 290 26 330 62 395 118 430 71 500 29 V170 H0Z"
              />
            </svg>
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-title">Dataset size vs. processing time</div>
          <p>Performance benchmark</p>
          <div className="scatter">
            {scatterPoints.map(([x, y], i) => (
              <i key={i} style={{ left: `${x}%`, top: `${y}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
