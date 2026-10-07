import os
from app.geospatial.kml_parser import KMLParser
from app.geospatial.shapefile_parser import ShapefileParser

def test_kml_parser_with_sample():
    kml_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "sample_data", "construction_site.kml")
    assert os.path.exists(kml_path)

    features = KMLParser.parse_kml_file(kml_path)
    assert len(features) >= 5
    
    f1 = features[0]
    assert "raw_geometry" in f1
    assert "properties" in f1
    assert f1["raw_geometry"]["type"] in ["Polygon", "MultiPolygon", "LineString", "Point"]
    assert "Contractor" in f1["properties"]

def test_shapefile_parser_with_sample():
    zip_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "sample_data", "site_parcels.zip")
    assert os.path.exists(zip_path)

    features, detected_crs, error = ShapefileParser.parse_shapefile_zip(zip_path)
    assert error is None
    assert len(features) >= 2
    assert "OWNER" in features[0]["properties"] or "owner" in str(features[0]["properties"]).lower()
