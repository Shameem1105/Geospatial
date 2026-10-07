import React from 'react';
import { X, Globe, Ruler, MapPin, Tag, Layers } from 'lucide-react';
import type { FeatureItem } from '../types';
import { StatusBadge } from './StatusBadge';

interface Props {
  feature: FeatureItem | null;
  onClose: () => void;
  onViewOnMap?: (featureId: string) => void;
}

export const FeatureDetailModal: React.FC<Props> = ({ feature, onClose, onViewOnMap }) => {
  if (!feature) return null;

  const m = feature.measurement;
  const props = feature.properties || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-950/80 backdrop-blur-sm p-4">
      <div className="bg-graphite-800 border border-graphite-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-graphite-700 flex items-center justify-between bg-graphite-850">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-sm">
              #{feature.feature_index}
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-text">
                {props.name || `Feature #${feature.feature_index}`}
              </h3>
              <p className="text-xs text-brand-muted font-mono">{feature.geometry_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={feature.processing_status} size="sm" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-graphite-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Measurement Highlight Box */}
          <div className="p-4 rounded-xl bg-graphite-900 border border-amber-500/30">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              <Ruler className="w-4 h-4" />
              <span>Calculated Planar Measurement</span>
            </div>
            <div className="text-3xl font-bold font-mono text-brand-text">
              {m?.formatted_value || 'Not applicable'}
            </div>

            {m?.alternative_units && Object.keys(m.alternative_units).length > 0 && (
              <div className="mt-3 pt-3 border-t border-graphite-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(m.alternative_units).map(([unitKey, val]) => (
                  <div key={unitKey} className="bg-graphite-850 p-2 rounded-lg border border-graphite-700/60">
                    <span className="text-[10px] uppercase font-mono text-brand-muted block">{unitKey.replace('_', ' ')}</span>
                    <span className="text-xs font-mono font-bold text-brand-text">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coordinate Reference System Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-graphite-900 border border-graphite-700/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Source Coordinate System</span>
              </div>
              <div className="font-mono text-xs font-semibold text-brand-text">
                {feature.source_crs || 'EPSG:4326 (WGS 84)'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-graphite-900 border border-graphite-700/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Calculation Projected CRS</span>
              </div>
              <div className="font-mono text-xs font-semibold text-brand-text truncate" title={m?.calculation_crs || 'N/A'}>
                {m?.calculation_crs || 'N/A'}
              </div>
            </div>
          </div>

          {/* Feature Properties Table */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-muted mb-3">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>Dataset Attributes &amp; ExtendedData</span>
            </div>

            {Object.keys(props).length === 0 ? (
              <div className="p-4 rounded-xl bg-graphite-900 border border-graphite-700 text-xs text-brand-muted text-center">
                No custom attribute properties in this feature.
              </div>
            ) : (
              <div className="rounded-xl border border-graphite-700 overflow-hidden bg-graphite-900">
                <table className="w-full text-xs text-left">
                  <thead className="bg-graphite-850 text-brand-muted uppercase font-mono text-[10px] border-b border-graphite-700">
                    <tr>
                      <th className="px-4 py-2.5">Attribute Key</th>
                      <th className="px-4 py-2.5">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite-800 font-mono">
                    {Object.entries(props).map(([k, v]) => (
                      <tr key={k} className="hover:bg-graphite-800/50">
                        <td className="px-4 py-2 text-amber-300 font-semibold">{k}</td>
                        <td className="px-4 py-2 text-brand-text">{String(v ?? '—')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-graphite-850 border-t border-graphite-700 flex justify-between items-center">
          <span className="text-xs font-mono text-brand-muted">
            ID: <span className="text-brand-text">{feature.id}</span>
          </span>
          <div className="flex items-center gap-3">
            {onViewOnMap && (
              <button
                onClick={() => {
                  onViewOnMap(feature.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-graphite-950 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View on Map</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-graphite-700 hover:bg-graphite-600 text-brand-text text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
