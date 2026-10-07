import math
import logging
from typing import Tuple, Optional, Any, Union, List
from app.geospatial.pure_geo import PureUTM

logger = logging.getLogger(__name__)

class CRSService:
    """
    Dedicated Geospatial Coordinate Reference System (CRS) Service.
    
    CRITICAL RULE:
    Never calculate geographic area or distance directly on EPSG:4326 (lon/lat).
    This service determines the source CRS, detects whether it is geographic
    or projected, selects an optimal local projected CRS (e.g. UTM zone based
    on geographic centroid), and performs high-precision coordinate transformations.
    """

    @classmethod
    def get_utm_epsg_for_coordinates(cls, lon: float, lat: float) -> Tuple[int, str]:
        """Calculates the optimal UTM Zone EPSG code for a given geographic coordinate."""
        _, _, epsg, name = PureUTM.get_utm_zone(lon, lat)
        return epsg, name

    @classmethod
    def determine_calculation_crs(
        cls,
        source_crs: Optional[str],
        centroid_lon: float,
        centroid_lat: float
    ) -> Tuple[int, str]:
        """
        Determines the calculation CRS.
        If source is geographic or missing, chooses optimal UTM zone.
        """
        epsg, name = cls.get_utm_epsg_for_coordinates(centroid_lon, centroid_lat)
        return epsg, name

    @classmethod
    def project_coordinates_to_utm(
        cls,
        coords: List[Tuple[float, float]],
        zone: Optional[int] = None
    ) -> List[Tuple[float, float]]:
        """
        Projects a list of (lon, lat) points into UTM (easting, northing) metric coordinates.
        """
        projected = []
        for lon, lat in coords:
            e, n = PureUTM.project_wgs84_to_utm(lon, lat, zone)
            projected.append((e, n))
        return projected
