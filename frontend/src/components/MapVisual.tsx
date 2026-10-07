import React from 'react';
import { Icon } from './Icons';

interface MapVisualProps {
  selectedArea?: string;
  roadLength?: string;
  coords?: string;
  className?: string;
}

export const MapVisual: React.FC<MapVisualProps> = ({
  selectedArea = '12,482.52 m²',
  roadLength = '1.82 km',
  coords = '13.0827° N, 80.2707° E',
  className = '',
}) => {
  return (
    <div className={`map ${className}`}>
      <div className="map-grid" />
      <div className="road road-a" />
      <div className="road road-b" />
      <div className="road road-c" />
      <svg viewBox="0 0 800 570" className="map-shapes">
        <path
          className="boundary"
          d="M84 95 298 55 438 112 686 78 746 246 660 468 425 520 208 474 64 326Z"
        />
        <path
          className="plot selected"
          d="m182 132 170-34 87 89-60 145-188 16-76-104Z"
        />
        <path
          className="plot"
          d="m440 188 202-54 71 119-58 132-204-53-41-74Z"
        />
        <path
          className="plot small"
          d="m208 366 172-14 45 145-196-31Z"
        />
        <path
          className="line-feature"
          d="M76 408c120-64 190-19 269-74s172-10 286-93 112-43 112-43"
        />
        <circle cx="512" cy="164" r="6" />
        <circle cx="160" cy="282" r="6" />
        <circle cx="606" cy="402" r="6" />
      </svg>
      <div className="map-tools">
        <button title="Zoom in">
          <Icon name="plus" size={14} />
        </button>
        <button title="Zoom out">−</button>
        <button title="Layers">
          <Icon name="layers" size={14} />
        </button>
      </div>
      <div className="map-label label-area">
        <span>SELECTED AREA</span>
        <strong>{selectedArea}</strong>
      </div>
      <div className="map-label label-line">
        <span>ROAD CENTERLINE</span>
        <strong>{roadLength}</strong>
      </div>
      <div className="map-legend">
        <span>
          <i className="amber" /> Polygon
        </span>
        <span>
          <i className="line" /> LineString
        </span>
        <span>
          <i className="point" /> Point
        </span>
      </div>
      <div className="map-coords">{coords}</div>
    </div>
  );
};
