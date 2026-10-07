import logging
from typing import Dict, Any, Optional, List, Tuple
from app.geospatial.pure_geo import PureUTM, PureGeoMath
from app.geospatial.crs_service import CRSService
from app.geospatial.geometry_validation import GeometryValidator

logger = logging.getLogger(__name__)

class MeasurementCalculator:
    """
    High-precision geographic measurement engine.
    Transforms geometry into an appropriate projected CRS before calculating planar area or length.
    """

    @classmethod
    def calculate_measurement(
        cls,
        geometry_dict: Dict[str, Any],
        geometry_type: str,
        source_crs_str: Optional[str] = "EPSG:4326"
    ) -> Dict[str, Any]:
        """
        Calculates area or length using a proper projected CRS.
        """
        try:
            if not geometry_dict or "coordinates" not in geometry_dict:
                return {
                    "measurement_type": "NONE",
                    "measurement_value": None,
                    "measurement_unit": "N/A",
                    "calculation_crs": None,
                    "formatted_value": "No geometry",
                    "alternative_units": {},
                    "status": "FAILED",
                    "error_message": "Empty geometry"
                }

            if geometry_type == "Point":
                return {
                    "measurement_type": "NONE",
                    "measurement_value": None,
                    "measurement_unit": "N/A",
                    "calculation_crs": "N/A",
                    "formatted_value": "Not applicable",
                    "alternative_units": {},
                    "status": "SUCCESS",
                    "error_message": None
                }

            if geometry_type not in ["Polygon", "MultiPolygon", "LineString", "MultiLineString"]:
                return {
                    "measurement_type": "NONE",
                    "measurement_value": None,
                    "measurement_unit": "N/A",
                    "calculation_crs": None,
                    "formatted_value": "Unsupported Geometry",
                    "alternative_units": {},
                    "status": "UNSUPPORTED",
                    "error_message": f"Geometry type '{geometry_type}' cannot be measured directly."
                }

            # 1. Extract centroid for optimal UTM zone selection
            centroid_lon, centroid_lat = GeometryValidator.get_centroid_coordinates(geometry_dict)

            # 2. Determine calculation CRS (Local UTM Zone)
            zone, is_north, epsg, calc_crs_name = PureUTM.get_utm_zone(centroid_lon, centroid_lat)

            # 3. Project coordinates and compute planar measurement
            coords = geometry_dict["coordinates"]

            if geometry_type == "Polygon":
                # Outer ring area minus holes
                total_area_sqm = 0.0
                if len(coords) > 0:
                    outer_pts = [(c[0], c[1]) for c in coords[0]]
                    outer_utm = [PureUTM.project_wgs84_to_utm(lon, lat, zone) for lon, lat in outer_pts]
                    total_area_sqm = PureGeoMath.polygon_area(outer_utm)

                    # Subtract interior rings (holes)
                    for hole in coords[1:]:
                        hole_pts = [(c[0], c[1]) for c in hole]
                        hole_utm = [PureUTM.project_wgs84_to_utm(lon, lat, zone) for lon, lat in hole_pts]
                        total_area_sqm -= PureGeoMath.polygon_area(hole_utm)

                total_area_sqm = max(0.0, total_area_sqm)
                area_sqkm = total_area_sqm / 1_000_000.0
                area_acres = total_area_sqm / 4046.8564224
                area_sqft = total_area_sqm * 10.7639104

                return {
                    "measurement_type": "AREA",
                    "measurement_value": round(total_area_sqm, 2),
                    "measurement_unit": "m²",
                    "calculation_crs": calc_crs_name,
                    "formatted_value": f"{total_area_sqm:,.2f} m²",
                    "alternative_units": {
                        "sq_km": f"{area_sqkm:,.4f} km²",
                        "acres": f"{area_acres:,.3f} acres",
                        "sq_ft": f"{area_sqft:,.2f} sq ft",
                        "hectares": f"{(total_area_sqm / 10000.0):,.3f} ha"
                    },
                    "status": "SUCCESS",
                    "error_message": None
                }

            elif geometry_type == "MultiPolygon":
                total_area_sqm = 0.0
                for poly_coords in coords:
                    if len(poly_coords) > 0:
                        outer_pts = [(c[0], c[1]) for c in poly_coords[0]]
                        outer_utm = [PureUTM.project_wgs84_to_utm(lon, lat, zone) for lon, lat in outer_pts]
                        poly_area = PureGeoMath.polygon_area(outer_utm)
                        for hole in poly_coords[1:]:
                            hole_pts = [(c[0], c[1]) for c in hole]
                            hole_utm = [PureUTM.project_wgs84_to_utm(lon, lat, zone) for lon, lat in hole_pts]
                            poly_area -= PureGeoMath.polygon_area(hole_utm)
                        total_area_sqm += max(0.0, poly_area)

                area_sqkm = total_area_sqm / 1_000_000.0
                area_acres = total_area_sqm / 4046.8564224
                area_sqft = total_area_sqm * 10.7639104

                return {
                    "measurement_type": "AREA",
                    "measurement_value": round(total_area_sqm, 2),
                    "measurement_unit": "m²",
                    "calculation_crs": calc_crs_name,
                    "formatted_value": f"{total_area_sqm:,.2f} m²",
                    "alternative_units": {
                        "sq_km": f"{area_sqkm:,.4f} km²",
                        "acres": f"{area_acres:,.3f} acres",
                        "sq_ft": f"{area_sqft:,.2f} sq ft",
                        "hectares": f"{(total_area_sqm / 10000.0):,.3f} ha"
                    },
                    "status": "SUCCESS",
                    "error_message": None
                }

            elif geometry_type == "LineString":
                line_pts = [(c[0], c[1]) for c in coords]
                line_utm = [PureUTM.project_wgs84_to_utm(lon, lat, zone) for lon, lat in line_pts]
                length_m = PureGeoMath.linestring_length(line_utm)
                length_km = length_m / 1000.0
                length_miles = length_m / 1609.344
                length_feet = length_m * 3.28084

                return {
                    "measurement_type": "LENGTH",
                    "measurement_value": round(length_m, 2),
                    "measurement_unit": "m",
                    "calculation_crs": calc_crs_name,
                    "formatted_value": f"{length_m:,.2f} m",
                    "alternative_units": {
                        "km": f"{length_km:,.3f} km",
                        "miles": f"{length_miles:,.3f} mi",
                        "feet": f"{length_feet:,.2f} ft"
                    },
                    "status": "SUCCESS",
                    "error_message": None
                }

            elif geometry_type == "MultiLineString":
                total_length_m = 0.0
                for line_coords in coords:
                    line_pts = [(c[0], c[1]) for c in line_coords]
                    line_utm = [PureUTM.project_wgs84_to_utm(lon, lat, zone) for lon, lat in line_pts]
                    total_length_m += PureGeoMath.linestring_length(line_utm)

                length_km = total_length_m / 1000.0
                length_miles = total_length_m / 1609.344
                length_feet = total_length_m * 3.28084

                return {
                    "measurement_type": "LENGTH",
                    "measurement_value": round(total_length_m, 2),
                    "measurement_unit": "m",
                    "calculation_crs": calc_crs_name,
                    "formatted_value": f"{total_length_m:,.2f} m",
                    "alternative_units": {
                        "km": f"{length_km:,.3f} km",
                        "miles": f"{length_miles:,.3f} mi",
                        "feet": f"{length_feet:,.2f} ft"
                    },
                    "status": "SUCCESS",
                    "error_message": None
                }

        except Exception as e:
            logger.exception(f"Error calculating measurement: {e}")
            return {
                "measurement_type": "NONE",
                "measurement_value": None,
                "measurement_unit": "N/A",
                "calculation_crs": None,
                "formatted_value": "Calculation error",
                "alternative_units": {},
                "status": "FAILED",
                "error_message": str(e)
            }
