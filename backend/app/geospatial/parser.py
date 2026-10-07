import os
import logging
from typing import List, Dict, Any, Tuple, Optional
from app.geospatial.kml_parser import KMLParser
from app.geospatial.shapefile_parser import ShapefileParser

logger = logging.getLogger(__name__)

class GeospatialParser:
    """
    Unified entry point for parsing KML and Shapefile ZIP datasets.
    """

    @classmethod
    def parse(cls, filepath: str, file_type: str) -> Tuple[List[Dict[str, Any]], Optional[str], Optional[str]]:
        """
        Parses the dataset and returns: (features_list, detected_crs, error_message)
        """
        if not os.path.exists(filepath):
            return [], None, f"File not found on server: {filepath}"

        file_type_lower = file_type.lower()

        if "kml" in file_type_lower:
            try:
                features = KMLParser.parse_kml_file(filepath)
                return features, "EPSG:4326", None
            except Exception as e:
                logger.exception(f"KML parsing error: {e}")
                return [], None, f"Failed to parse KML file: {str(e)}"

        elif "shapefile" in file_type_lower or "zip" in file_type_lower or "shp" in file_type_lower:
            return ShapefileParser.parse_shapefile_zip(filepath)

        else:
            return [], None, f"Unsupported file type: {file_type}. Supported types are KML (.kml) and Shapefile ZIP (.zip)."
