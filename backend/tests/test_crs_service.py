from app.geospatial.crs_service import CRSService
from app.geospatial.pure_geo import PureUTM

def test_utm_zone_determination():
    # Chennai, India (~80.27 E, 13.08 N) -> UTM Zone 44N (EPSG:32644)
    epsg_chennai, name_chennai = CRSService.get_utm_epsg_for_coordinates(80.27, 13.08)
    assert epsg_chennai == 32644
    assert "44N" in name_chennai

    # Sydney, Australia (~151.20 E, -33.86 S) -> UTM Zone 56S (EPSG:32756)
    epsg_sydney, name_sydney = CRSService.get_utm_epsg_for_coordinates(151.20, -33.86)
    assert epsg_sydney == 32756
    assert "56S" in name_sydney

def test_utm_coordinate_projection():
    # Project point in Chennai
    e, n = PureUTM.project_wgs84_to_utm(80.220, 12.980, 44)
    # Standard UTM Easting is around 500,000m +- 300,000m
    assert 100000.0 < e < 900000.0
    # Northing in Chennai is around 1,400,000m
    assert 1000000.0 < n < 2000000.0
