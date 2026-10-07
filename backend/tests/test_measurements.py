from app.geospatial.measurement import MeasurementCalculator

def test_polygon_area_calculation():
    # Polygon ~100m x 100m in Chennai (~10,000 m²)
    poly_geom = {
        "type": "Polygon",
        "coordinates": [[
            [80.220, 12.980],
            [80.221, 12.980],
            [80.221, 12.981],
            [80.220, 12.981],
            [80.220, 12.980]
        ]]
    }

    result = MeasurementCalculator.calculate_measurement(poly_geom, "Polygon", "EPSG:4326")
    assert result["status"] == "SUCCESS"
    assert result["measurement_type"] == "AREA"
    assert result["measurement_unit"] == "m²"
    assert result["measurement_value"] > 5000.0
    assert "UTM zone 44N" in result["calculation_crs"]
    assert "sq_km" in result["alternative_units"]

def test_linestring_length_calculation():
    line_geom = {
        "type": "LineString",
        "coordinates": [
            [80.220, 12.980],
            [80.230, 12.980]
        ]
    }

    result = MeasurementCalculator.calculate_measurement(line_geom, "LineString", "EPSG:4326")
    assert result["status"] == "SUCCESS"
    assert result["measurement_type"] == "LENGTH"
    assert result["measurement_unit"] == "m"
    assert result["measurement_value"] > 900.0  # ~1 km
    assert "km" in result["alternative_units"]

def test_point_handling():
    pt_geom = {
        "type": "Point",
        "coordinates": [80.220, 12.980]
    }
    result = MeasurementCalculator.calculate_measurement(pt_geom, "Point", "EPSG:4326")
    assert result["status"] == "SUCCESS"
    assert result["measurement_type"] == "NONE"
    assert result["formatted_value"] == "Not applicable"
