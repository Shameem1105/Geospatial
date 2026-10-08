import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { FeatureItem } from '../types';

interface MiniMapProps {
  feature?: FeatureItem | null;
  geometryData?: any;
  coordinates?: number[][];
  className?: string;
  zoom?: number;
}

const FitSingleFeature: React.FC<{ data: any }> = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (!data) return;
    try {
      const layer = L.geoJSON(data);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
      }
    } catch (e) {
      console.error("MiniMap error fitting bounds:", e);
    }
  }, [data, map]);

  return null;
};

export const FeatureMiniMap: React.FC<MiniMapProps> = ({ feature, geometryData, className = '' }) => {
  const geojson = React.useMemo(() => {
    if (geometryData) {
      return {
        type: 'Feature',
        geometry: geometryData,
        properties: feature?.properties || {},
      };
    }
    if (feature?.geometry_data) {
      return {
        type: 'Feature',
        geometry: feature.geometry_data,
        properties: feature.properties || {},
      };
    }
    return null;
  }, [feature, geometryData]);

  // Extract center coordinates or default
  const defaultCenter: [number, number] = React.useMemo(() => {
    if (geojson?.geometry?.type === 'Point' && geojson.geometry.coordinates) {
      return [geojson.geometry.coordinates[1], geojson.geometry.coordinates[0]];
    }
    if (geojson?.geometry?.coordinates) {
      const coords = geojson.geometry.coordinates;
      if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
        return [coords[0][1], coords[0][0]];
      }
      if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
        return [coords[0][0][1], coords[0][0][0]];
      }
    }
    return [12.8450, 77.6650]; // Default Bangalore Electronic City
  }, [geojson]);

  const styleFeature = () => ({
    fillColor: '#F5A524',
    fillOpacity: 0.6,
    color: '#F5A524',
    weight: 3,
  });

  const pointToLayer = (_: any, latlng: L.LatLng) => {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: '#FFC45C',
      color: '#FFFFFF',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
    });
  };

  return (
    <div className={`relative w-full h-44 rounded-lg overflow-hidden border border-[#2E353D] bg-[#111315] ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {geojson && (
          <>
            <GeoJSON
              key={JSON.stringify(geojson.geometry)}
              data={geojson as any}
              style={styleFeature}
              pointToLayer={pointToLayer}
            />
            <FitSingleFeature data={geojson} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default FeatureMiniMap;
