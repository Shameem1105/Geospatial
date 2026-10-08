import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Globe, Map as MapIcon, ZoomIn, ZoomOut } from 'lucide-react';

interface Props {
  geojson: any;
  selectedFeatureId?: string | null;
  onSelectFeature?: (featureId: string) => void;
  className?: string;
  tileMode?: 'voyager' | 'satellite' | 'dark' | 'osm';
  showControls?: boolean;
  interactive?: boolean;
}

// Helper to auto-fit map bounds to loaded GeoJSON data or selected feature
const FitBounds: React.FC<{ geojson: any; selectedFeatureId?: string | null }> = ({ geojson, selectedFeatureId }) => {
  const map = useMap();

  useEffect(() => {
    if (!geojson || !geojson.features || geojson.features.length === 0) return;

    try {
      if (selectedFeatureId) {
        const selected = geojson.features.find(
          (f: any) => f.id === selectedFeatureId || f.properties?.feature_id === selectedFeatureId
        );
        if (selected) {
          const singleLayer = L.geoJSON(selected);
          const bounds = singleLayer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
            return;
          }
        }
      }

      const layer = L.geoJSON(geojson);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    } catch (e) {
      console.error("Error fitting bounds:", e);
    }
  }, [geojson, selectedFeatureId, map]);

  return null;
};

// Map Controls component (Zoom & Layer switch)
const MapControls: React.FC = () => {
  const map = useMap();
  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1.5 bg-graphite-900/90 backdrop-blur-md p-1 rounded-lg border border-graphite-700 shadow-xl">
      <button
        onClick={() => map.zoomIn()}
        className="p-1.5 rounded hover:bg-graphite-750 text-brand-muted hover:text-white transition-colors"
        title="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="p-1.5 rounded hover:bg-graphite-750 text-brand-muted hover:text-white transition-colors"
        title="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
    </div>
  );
};

export const MapViewer: React.FC<Props> = ({
  geojson,
  selectedFeatureId,
  onSelectFeature,
  className = '',
  tileMode: initialTileMode = 'voyager',
  showControls = true,
  interactive = true,
}) => {
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [tileMode, setTileMode] = useState<'voyager' | 'satellite' | 'dark'>(
    initialTileMode === 'satellite' ? 'satellite' : initialTileMode === 'dark' ? 'dark' : 'voyager'
  );

  // Sync prop changes
  useEffect(() => {
    if (initialTileMode) {
      setTileMode(initialTileMode === 'satellite' ? 'satellite' : initialTileMode === 'dark' ? 'dark' : 'voyager');
    }
  }, [initialTileMode]);

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
      }),
    };
  }, [geojson, filterType]);

  const styleFeature = (feature: any) => {
    const isSelected = feature.id === selectedFeatureId || feature.properties?.feature_id === selectedFeatureId;
    const geomType = feature.geometry?.type || '';

    if (geomType.includes('Polygon')) {
      return {
        fillColor: isSelected ? '#F5A524' : '#E08E0B',
        fillOpacity: isSelected ? 0.65 : 0.35,
        color: isSelected ? '#FFFFFF' : '#F5A524',
        weight: isSelected ? 3.5 : 2,
        dashArray: isSelected ? '' : '3',
      };
    } else if (geomType.includes('LineString')) {
      return {
        color: isSelected ? '#38BDF8' : '#0284C7',
        weight: isSelected ? 5 : 3.5,
        opacity: 0.95,
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
      radius: isSelected ? 9 : 6,
      fillColor: isSelected ? '#FFC45C' : '#35B77A',
      color: '#FFFFFF',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
    });
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    if (!interactive) return;

    const props = feature.properties || {};
    const featId = feature.id || props.feature_id;
    const gType = props.geometry_type || feature.geometry?.type || 'Feature';
    const mVal = props.measurement_value;
    const mUnit = props.measurement_unit || '';
    const mType = props.measurement_type || 'NONE';
    const cCrs = props.calculation_crs || 'N/A';
    const featureName = props.name || props.FACILITY || props.ZONE_ID || `Feature #${props.feature_index || '1'}`;

    let measurementText = 'Not applicable';
    if (mType === 'AREA' && mVal != null) {
      measurementText = `${Number(mVal).toLocaleString()} ${mUnit}`;
    } else if (mType === 'LENGTH' && mVal != null) {
      measurementText = `${Number(mVal).toLocaleString()} ${mUnit}`;
    }

    const popupHtml = `
      <div class="p-2.5 space-y-2 font-sans text-xs min-w-[200px]">
        <div class="flex items-center justify-between border-b border-[#2E353D] pb-1.5 gap-4">
          <span class="font-bold text-amber-400 font-mono text-sm">${featureName}</span>
          <span class="px-2 py-0.5 rounded bg-[#22272B] text-[10px] text-gray-300 font-mono">${gType}</span>
        </div>
        
        <div class="space-y-1">
          <div class="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Measurement</div>
          <div class="text-sm font-bold text-white font-mono bg-[#111315] p-1.5 rounded border border-[#2A3036]">
            ${measurementText}
          </div>
        </div>

        <div class="text-[11px] text-gray-400">
          <span class="text-gray-500">CRS:</span> <span class="font-mono text-gray-300">${cCrs}</span>
        </div>

        ${props.description ? `<div class="text-[11px] text-gray-300 mt-1">${props.description}</div>` : ''}
      </div>
    `;

    layer.bindPopup(popupHtml);

    layer.on({
      click: () => {
        if (onSelectFeature && featId) {
          onSelectFeature(featId);
        }
      },
    });
  };

  const tileUrls = {
    voyager: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  const tileAttribution = {
    voyager: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  };

  return (
    <div className={`relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-graphite-700 bg-graphite-950 ${className}`}>
      {/* Map Control Bar Overlay */}
      {showControls && (
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 bg-graphite-900/90 backdrop-blur-md p-1.5 rounded-lg border border-graphite-700 shadow-xl">
          {/* Base Layer Switcher */}
          <div className="flex items-center gap-1 border-r border-graphite-700 pr-2 mr-1">
            <button
              onClick={() => setTileMode('voyager')}
              className={`p-1.5 rounded text-xs transition-colors ${
                tileMode === 'voyager' ? 'bg-amber-500 text-graphite-950 font-bold' : 'text-brand-muted hover:text-white'
              }`}
              title="Carto Street Map"
            >
              <MapIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTileMode('satellite')}
              className={`p-1.5 rounded text-xs transition-colors ${
                tileMode === 'satellite' ? 'bg-amber-500 text-graphite-950 font-bold' : 'text-brand-muted hover:text-white'
              }`}
              title="Satellite Imagery"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature Filter Tabs */}
          <div className="flex items-center gap-1 text-xs">
            <Layers className="w-3.5 h-3.5 text-amber-400 ml-0.5" />
            {(['ALL', 'POLYGON', 'LINE', 'POINT'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filterType === type ? 'bg-amber-500 text-graphite-950 font-bold' : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {type === 'ALL' ? 'All' : type === 'POLYGON' ? 'Polygons' : type === 'LINE' ? 'Lines' : 'Points'}
              </button>
            ))}
          </div>
        </div>
      )}

      <MapContainer
        center={[13.0827, 80.2707]}
        zoom={12}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          key={tileMode}
          attribution={tileAttribution[tileMode]}
          url={tileUrls[tileMode]}
          maxZoom={19}
        />

        {filteredData && (
          <>
            <GeoJSON
              key={`${filterType}-${tileMode}-${JSON.stringify(filteredData?.features?.length || 0)}`}
              data={filteredData}
              style={styleFeature}
              pointToLayer={pointToLayer}
              onEachFeature={onEachFeature}
              ref={geoJsonRef}
            />
            <FitBounds geojson={filteredData} selectedFeatureId={selectedFeatureId} />
          </>
        )}

        {showControls && <MapControls />}
      </MapContainer>
    </div>
  );
};

export default MapViewer;
