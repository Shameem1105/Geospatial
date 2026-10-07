import logging
from typing import Tuple, Optional, Any, List, Dict
from app.geospatial.pure_geo import PureGeoMath

logger = logging.getLogger(__name__)

SUPPORTED_GEOMETRIES = {
    "Polygon",
    "MultiPolygon",
    "LineString",
    "MultiLineString",
    "Point"
}

class GeometryValidator:
    """
    Validates, normalizes, and classifies GeoJSON geometries for robust processing.
    """

    @staticmethod
    def normalize_geometry(geom_input: Any) -> Tuple[Optional[Dict[str, Any]], str, Optional[str]]:
        """
        Standardizes input geometry into a valid GeoJSON geometry dictionary.
        Returns: (geojson_geom_dict, geometry_type_str, error_message)
        """
        if geom_input is None:
            return None, "Empty", "Geometry is null or empty"

        try:
            if isinstance(geom_input, dict) and "type" in geom_input and "coordinates" in geom_input:
                geom_type = geom_input["type"]
                coords = geom_input["coordinates"]

                if not coords or len(coords) == 0:
                    return None, "Empty", "Coordinates array is empty"

                # Drop Z coordinate if present: ensure 2D (lon, lat)
                cleaned_coords = GeometryValidator._strip_z(coords)
                clean_geom = {"type": geom_type, "coordinates": cleaned_coords}

                if geom_type not in SUPPORTED_GEOMETRIES:
                    return clean_geom, geom_type, f"Geometry type '{geom_type}' is not a standard measurement type."

                return clean_geom, geom_type, None

            return None, "Unsupported", f"Unsupported geometry structure: {type(geom_input)}"

        except Exception as e:
            logger.error(f"Error normalizing geometry: {e}")
            return None, "Corrupted", f"Failed to parse geometry: {str(e)}"

    @staticmethod
    def _strip_z(coords: Any) -> Any:
        """Recursively trims coordinates to [x, y] tuples/lists."""
        if isinstance(coords, (list, tuple)):
            if len(coords) >= 2 and isinstance(coords[0], (int, float)) and isinstance(coords[1], (int, float)):
                return [float(coords[0]), float(coords[1])]
            return [GeometryValidator._strip_z(c) for c in coords]
        return coords

    @staticmethod
    def get_centroid_coordinates(geom_dict: Dict[str, Any]) -> Tuple[float, float]:
        """Calculates geographic centroid of GeoJSON geometry."""
        coords = GeometryValidator._flatten_coords(geom_dict.get("coordinates", []))
        if not coords:
            return 0.0, 0.0
        return PureGeoMath.centroid(coords)

    @staticmethod
    def _flatten_coords(coords: Any) -> List[Tuple[float, float]]:
        flat = []
        if isinstance(coords, (list, tuple)):
            if len(coords) >= 2 and isinstance(coords[0], (int, float)):
                flat.append((float(coords[0]), float(coords[1])))
            else:
                for sub in coords:
                    flat.extend(GeometryValidator._flatten_coords(sub))
        return flat
