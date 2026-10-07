from typing import List, Dict, Any
from app.models.feature import Feature

class GeoJSONService:
    """
    Constructs compliant GeoJSON FeatureCollections for frontend map rendering.
    """

    @classmethod
    def build_feature_collection(cls, features: List[Feature], file_name: str = "") -> Dict[str, Any]:
        """
        Builds a full GeoJSON FeatureCollection from database Feature models.
        """
        geojson_features = []

        for f in features:
            if not f.geometry_data:
                continue

            # Merge feature properties with measurement details
            props = dict(f.properties or {})
            props["feature_id"] = f.id
            props["feature_index"] = f.feature_index
            props["geometry_type"] = f.geometry_type
            props["processing_status"] = f.processing_status

            if f.measurement:
                props["measurement_type"] = f.measurement.measurement_type
                props["measurement_value"] = f.measurement.measurement_value
                props["measurement_unit"] = f.measurement.measurement_unit
                props["calculation_crs"] = f.measurement.calculation_crs

            geojson_features.append({
                "type": "Feature",
                "id": f.id,
                "geometry": f.geometry_data,
                "properties": props
            })

        return {
            "type": "FeatureCollection",
            "name": file_name,
            "crs": {
                "type": "name",
                "properties": {
                    "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                }
            },
            "features": geojson_features
        }
