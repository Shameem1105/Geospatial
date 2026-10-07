import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  compact?: boolean;
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({ compact = false, to = '/' }) => {
  const content = (
    <div className="brand">
      <div className="logo-mark">
        <span />
        <span />
        <span />
      </div>
      {!compact && (
        <div>
          <div className="brand-name">TERRAFLOW</div>
          <div className="brand-sub">GEOSPATIAL SYSTEMS</div>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </Link>
    );
  }

  return content;
};
