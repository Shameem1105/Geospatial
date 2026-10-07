import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers } from 'lucide-react';

interface Props {
  geojson: any;
  selectedFeatureId?: string | null;
  onSelectFeature?: (featureId: string) => void;
}

// Helper to auto-fit map bounds to loaded GeoJSON data
const FitBounds: React.FC<{ geojson: any }> = ({ geojson }) => {
  const map = useMap();

  useEffect(() => {
    if (geojson && geojson.features && geojson.features.length > 0) {
      try {
        const layer = L.geoJSON(geojson);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
        }
      } catch (e) {
        console.error("Error fitting bounds:", e);
      }
    }
  }, [geojson, map]);

  return null;
};

export const MapViewer: React.FC<Props> = ({ geojson, selectedFeatureId, onSelectFeature }) => {
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Filter features based on layer selection
  const filteredData = React.useMemo(() => {
    if (!geojson || !geojson.features) return geojson;
    if (filterType === 'ALL') return geojson;

    return {
      ...geojson,
      features: geojson.features.filter((f: any) => {
        const gt = (f.geometry?.type || '').toUpperCase();
        if (filterType === 'POLYGON') return gt.includes('POLYGON');
        if (filterType === 'LINE') return gt.includes('LINE');
        if (filterType === 'POINT') return gt.includes('POINT');
        return true;
      })
    };
  }, [geojson, filterType]);

  const styleFeature = (feature: any) => {
    const isSelected = feature.id === selectedFeatureId || feature.properties?.feature_id === selectedFeatureId;
    const geomType = feature.geometry?.type || '';

    if (geomType.includes('Polygon')) {
      return {
        fillColor: isSelected ? '#F5A524' : '#E08E0B',
        fillOpacity: isSelected ? 0.6 : 0.35,
        color: isSelected ? '#FFFFFF' : '#F5A524',
        weight: isSelected ? 3 : 2,
        dashArray: isSelected ? '' : '3',
      };
    } else if (geomType.includes('LineString')) {
      return {
        color: isSelected ? '#38BDF8' : '#0284C7',
        weight: isSelected ? 4 : 3,
        opacity: 0.9,
      };
    }
    return {
      color: '#35B77A',
      weight: 2,
    };
  };

  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    const isSelected = feature.id === selectedFeatureId || feature.properties?.feature_id === selectedFeatureId;
    return L.circleMarker(latlng, {
      radius: isSelected ? 8 : 6,
      fillColor: isSelected ? '#FFC45C' : '#35B77A',
      color: '#FFFFFF',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
    });
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties || {};
    const featId = feature.id || props.feature_id;
    const gType = props.geometry_type || feature.geometry?.type || 'Feature';
    const mVal = props.measurement_value;
    const mUnit = props.measurement_unit || '';
    const mType = props.measurement_type || 'NONE';
    const cCrs = props.calculation_crs || 'N/A';

    let measurementText = 'Not applicable';
    if (mType === 'AREA' && mVal != null) {
      measurementText = `${Number(mVal).toLocaleString()} ${mUnit}`;
    } else if (mType === 'LENGTH' && mVal != null) {
      measurementText = `${Number(mVal).toLocaleString()} ${mUnit}`;
    }

    const popupHtml = `
      <div class="p-2 space-y-2 font-sans text-xs">
        <div class="flex items-center justify-between border-b border-[#2E353D] pb-1.5 gap-4">
          <span class="font-bold text-amber-400 font-mono text-sm">Feature #${props.feature_index || '1'}</span>
          <span class="px-2 py-0.5 rounded bg-[#22272B] text-[10px] text-gray-300 font-mono">${gType}</span>
        </div>
        
        <div class="space-y-1">
          <div class="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Calculated Measurement</div>
          <div class="text-sm font-bold text-white font-mono bg-[#111315] p-1.5 rounded border border-[#2A3036]">
            ${measurementText}
          </div>
        </div>

        <div class="text-[11px] text-gray-400">
          <span class="text-gray-500">Projection:</span> <span class="font-mono text-gray-300">${cCrs}</span>
        </div>

        ${props.name ? `<div class="text-[11px] text-gray-300"><span class="text-gray-500">Name:</span> ${props.name}</div>` : ''}
      </div>
    `;

    layer.bindPopup(popupHtml);

    layer.on({
      click: () => {
        if (onSelectFeature && featId) {
          onSelectFeature(featId);
        }
      }
    });
  };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-xl overflow-hidden border border-graphite-700 bg-graphite-950">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 bg-graphite-900/90 backdrop-blur-md p-1.5 rounded-lg border border-graphite-700 shadow-xl">
        <div className="flex items-center gap-1 text-xs">
          <Layers className="w-3.5 h-3.5 text-amber-400 ml-1.5" />
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filterType === 'ALL' ? 'bg-amber-500 text-graphite-950 font-bold' : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('POLYGON')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filterType === 'POLYGON' ? 'bg-amber-500 text-graphite-950 font-bold' : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            Polygons
          </button>
          <button
            onClick={() => setFilterType('LINE')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filterType === 'LINE' ? 'bg-amber-500 text-graphite-950 font-bold' : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            Lines
          </button>
          <button
            onClick={() => setFilterType('POINT')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filterType === 'POINT' ? 'bg-amber-500 text-graphite-950 font-bold' : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            Points
          </button>
        </div>
      </div>

      <MapContainer
        center={[13.0827, 80.2707]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {filteredData && (
          <>
            <GeoJSON
              key={`${filterType}-${JSON.stringify(filteredData?.features?.length || 0)}`}
              data={filteredData}
              style={styleFeature}
              pointToLayer={pointToLayer}
              onEachFeature={onEachFeature}
              ref={geoJsonRef}
            />
            <FitBounds geojson={filteredData} />
          </>
        )}
      </MapContainer>
    </div>
  );
};
