import React, { type ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  detail?: ReactNode;
  accent?: boolean;
  glyph?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  detail,
  accent = false,
  glyph = '⌁',
  className = '',
}) => {
  return (
    <div className={`metric-card ${accent ? 'accent' : ''} ${className}`}>
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-glyph">{glyph}</span>
      </div>
      <div className="metric-value">{value}</div>
      {detail && (
        <div className="metric-detail">
          {typeof detail === 'string' && detail.includes('up') ? (
            <><span className="up">↑</span> {detail.replace('up', '').trim()}</>
          ) : (
            detail
          )}
        </div>
      )}
    </div>
  );
};
