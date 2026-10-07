import math
import struct
import os
from typing import List, Tuple, Dict, Any, Optional

class PureUTM:
    """
    High-precision WGS84 Transverse Mercator / Universal Transverse Mercator (UTM)
    pure Python projection implementation.
    Converts geographic (longitude, latitude) coordinates into metric (easting, northing) planar coordinates.
    """
    # WGS84 Ellipsoid constants
    A = 6378137.0  # semi-major axis (meters)
    F = 1.0 / 298.257223563  # flattening
    B = A * (1.0 - F)  # semi-minor axis
    E = math.sqrt(1.0 - (B * B) / (A * A))  # eccentricity
    E_PRIME_SQ = (E * E) / (1.0 - E * E)
    K0 = 0.9996  # UTM scale factor

    @classmethod
    def get_utm_zone(cls, lon: float, lat: float) -> Tuple[int, bool, int, str]:
        """
        Returns: (zone_number, is_northern, epsg_code, crs_name)
        """
        lon_norm = ((lon + 180.0) % 360.0) - 180.0
        zone = int((lon_norm + 180.0) / 6.0) + 1
        zone = max(1, min(60, zone))
        is_north = (lat >= 0)
        epsg = (32600 + zone) if is_north else (32700 + zone)
        hemisphere = "N" if is_north else "S"
        name = f"EPSG:{epsg} (WGS 84 / UTM zone {zone}{hemisphere} - Planar Metric)"
        return zone, is_north, epsg, name

    @classmethod
    def project_wgs84_to_utm(cls, lon: float, lat: float, zone: Optional[int] = None) -> Tuple[float, float]:
        """
        Projects (lon, lat) in degrees into (easting, northing) in meters using UTM.
        """
        if zone is None:
            zone, _, _, _ = cls.get_utm_zone(lon, lat)

        # Clamp latitude to UTM valid limits
        lat = max(-80.0, min(84.0, lat))

        lat_rad = math.radians(lat)
        lon_rad = math.radians(lon)
        central_lon = math.radians((zone - 1) * 6 - 180 + 3)

        sin_lat = math.sin(lat_rad)
        cos_lat = math.cos(lat_rad)
        tan_lat = math.tan(lat_rad)

        denom = math.sqrt(1.0 - cls.E * cls.E * sin_lat * sin_lat)
        n = cls.A / (denom if denom != 0 else 1.0)
        t = tan_lat * tan_lat
        c = cls.E_PRIME_SQ * cos_lat * cos_lat
        a_val = cos_lat * (lon_rad - central_lon)

        # Meridional arc length
        m = cls.A * (
            (1.0 - cls.E * cls.E / 4.0 - 3.0 * (cls.E ** 4) / 64.0 - 5.0 * (cls.E ** 6) / 256.0) * lat_rad
            - (3.0 * cls.E * cls.E / 8.0 + 3.0 * (cls.E ** 4) / 32.0 + 45.0 * (cls.E ** 6) / 1024.0) * math.sin(2.0 * lat_rad)
            + (15.0 * (cls.E ** 4) / 256.0 + 45.0 * (cls.E ** 6) / 1024.0) * math.sin(4.0 * lat_rad)
            - (35.0 * (cls.E ** 6) / 3072.0) * math.sin(6.0 * lat_rad)
        )

        easting = cls.K0 * n * (
            a_val
            + (1.0 - t + c) * (a_val ** 3) / 6.0
            + (5.0 - 18.0 * t + t * t + 72.0 * c - 58.0 * cls.E_PRIME_SQ) * (a_val ** 5) / 120.0
        ) + 500000.0  # False Easting

        northing = cls.K0 * (
            m
            + n * tan_lat * (
                (a_val ** 2) / 2.0
                + (5.0 - t + 9.0 * c + 4.0 * c * c) * (a_val ** 4) / 24.0
                + (61.0 - 58.0 * t + t * t + 600.0 * c - 330.0 * cls.E_PRIME_SQ) * (a_val ** 6) / 720.0
            )
        )

        if lat < 0:
            northing += 10000000.0  # False Northing for Southern Hemisphere

        return easting, northing


class PureGeoMath:
    """
    Planar geometric calculations: Shoelace polygon area, Euclidean polyline length, and centroid.
    """

    @classmethod
    def polygon_area(cls, ring: List[Tuple[float, float]]) -> float:
        """Calculates area of a single closed polygon ring."""
        return cls._ring_area(ring)

    @classmethod
    def polygon_area_metric(cls, rings: List[List[Tuple[float, float]]]) -> float:
        """
        Calculates planar area in square meters using Shoelace formula.
        Outer ring (index 0) is added; inner rings (holes, indices > 0) are subtracted.
        """
        if not rings or len(rings) == 0:
            return 0.0

        exterior_area = cls._ring_area(rings[0])

        interior_area = 0.0
        for hole in rings[1:]:
            interior_area += cls._ring_area(hole)

        net_area = max(0.0, exterior_area - interior_area)
        return net_area

    @classmethod
    def _ring_area(cls, ring: List[Tuple[float, float]]) -> float:
        n = len(ring)
        if n < 3:
            return 0.0
        area = 0.0
        for i in range(n):
            j = (i + 1) % n
            area += ring[i][0] * ring[j][1]
            area -= ring[j][0] * ring[i][1]
        return abs(area) / 2.0

    @classmethod
    def linestring_length(cls, coords: List[Tuple[float, float]]) -> float:
        return cls.linestring_length_metric(coords)

    @classmethod
    def linestring_length_metric(cls, coords: List[Tuple[float, float]]) -> float:
        """
        Calculates Euclidean line length in meters from projected metric coordinates.
        """
        if not coords or len(coords) < 2:
            return 0.0
        total_len = 0.0
        for i in range(len(coords) - 1):
            dx = coords[i + 1][0] - coords[i][0]
            dy = coords[i + 1][1] - coords[i][1]
            total_len += math.hypot(dx, dy)
        return total_len

    @classmethod
    def centroid(cls, coords: List[Tuple[float, float]]) -> Tuple[float, float]:
        """Calculates arithmetic mean center of points."""
        if not coords:
            return 0.0, 0.0
        sum_x = sum(pt[0] for pt in coords)
        sum_y = sum(pt[1] for pt in coords)
        return sum_x / len(coords), sum_y / len(coords)


class PureShapefileReader:
    """
    Pure Python ESRI Shapefile (.shp + .dbf) binary reader with defensive bounds checks.
    Guarantees 100% platform portability with zero external C-dependencies.
    """

    @classmethod
    def read_shapefile(cls, shp_path: str) -> Tuple[List[Dict[str, Any]], Optional[str]]:
        """
        Reads .shp and .dbf files directly from disk safely.
        Returns: (features_list, error_message)
        """
        dbf_path = os.path.splitext(shp_path)[0] + ".dbf"
        if not os.path.exists(shp_path):
            return [], f"Shapefile '{shp_path}' does not exist."

        records_props = cls._read_dbf(dbf_path) if os.path.exists(dbf_path) else []

        try:
            with open(shp_path, "rb") as f:
                header = f.read(100)
                if len(header) < 100:
                    return [], "Shapefile header is truncated."

                file_code, = struct.unpack(">i", header[0:4])
                if file_code != 9994:
                    return [], "Invalid Shapefile signature (not 9994)."

                features = []
                idx = 0

                while True:
                    rec_header = f.read(8)
                    if len(rec_header) < 8:
                        break
                    rec_num, content_len = struct.unpack(">ii", rec_header)
                    if content_len < 0 or content_len > 50000000:  # Max 100MB per record safety bound
                        break

                    content_bytes = f.read(content_len * 2)
                    if len(content_bytes) < content_len * 2:
                        break

                    if len(content_bytes) < 4:
                        continue

                    stype, = struct.unpack("<i", content_bytes[0:4])

                    geom_dict = None
                    geom_type = "Unsupported"

                    if stype == 1:  # Point
                        if len(content_bytes) >= 20:
                            x, y = struct.unpack("<dd", content_bytes[4:20])
                            geom_type = "Point"
                            geom_dict = {"type": "Point", "coordinates": [x, y]}

                    elif stype == 3:  # PolyLine
                        if len(content_bytes) >= 44:
                            num_parts, num_points = struct.unpack("<ii", content_bytes[36:44])
                            if num_parts >= 0 and num_points >= 0:
                                parts_size = 4 * num_parts
                                points_offset = 44 + parts_size
                                total_expected = points_offset + 16 * num_points

                                if total_expected <= len(content_bytes):
                                    parts = list(struct.unpack(f"<{num_parts}i", content_bytes[44:points_offset]))
                                    points = []
                                    for p_i in range(num_points):
                                        px, py = struct.unpack("<dd", content_bytes[points_offset + p_i*16 : points_offset + (p_i+1)*16])
                                        points.append((px, py))

                                    parts.append(num_points)
                                    lines = []
                                    for p_idx in range(num_parts):
                                        start_p = max(0, min(num_points, parts[p_idx]))
                                        end_p = max(0, min(num_points, parts[p_idx+1]))
                                        line_coords = [[pt[0], pt[1]] for pt in points[start_p:end_p]]
                                        if len(line_coords) >= 2:
                                            lines.append(line_coords)

                                    if len(lines) == 1:
                                        geom_type = "LineString"
                                        geom_dict = {"type": "LineString", "coordinates": lines[0]}
                                    elif len(lines) > 1:
                                        geom_type = "MultiLineString"
                                        geom_dict = {"type": "MultiLineString", "coordinates": lines}

                    elif stype == 5:  # Polygon
                        if len(content_bytes) >= 44:
                            num_parts, num_points = struct.unpack("<ii", content_bytes[36:44])
                            if num_parts >= 0 and num_points >= 0:
                                parts_size = 4 * num_parts
                                points_offset = 44 + parts_size
                                total_expected = points_offset + 16 * num_points

                                if total_expected <= len(content_bytes):
                                    parts = list(struct.unpack(f"<{num_parts}i", content_bytes[44:points_offset]))
                                    points = []
                                    for p_i in range(num_points):
                                        px, py = struct.unpack("<dd", content_bytes[points_offset + p_i*16 : points_offset + (p_i+1)*16])
                                        points.append((px, py))

                                    parts.append(num_points)
                                    rings = []
                                    for p_idx in range(num_parts):
                                        start_p = max(0, min(num_points, parts[p_idx]))
                                        end_p = max(0, min(num_points, parts[p_idx+1]))
                                        ring_coords = [[pt[0], pt[1]] for pt in points[start_p:end_p]]
                                        if len(ring_coords) >= 3:
                                            rings.append(ring_coords)

                                    if rings:
                                        geom_type = "Polygon"
                                        geom_dict = {"type": "Polygon", "coordinates": rings}

                    props = records_props[idx] if idx < len(records_props) else {}

                    features.append({
                        "feature_index": idx + 1,
                        "geometry_type": geom_type,
                        "geometry_dict": geom_dict,
                        "properties": props
                    })
                    idx += 1

                return features, None

        except Exception as e:
            return [], f"Shapefile binary read error: {str(e)}"

    @classmethod
    def _read_dbf(cls, dbf_path: str) -> List[Dict[str, Any]]:
        """Reads dBASE III / IV (.dbf) attribute records with safety bounds."""
        try:
            file_size = os.path.getsize(dbf_path)
            with open(dbf_path, "rb") as f:
                header = f.read(32)
                if len(header) < 32:
                    return []
                num_records, header_len, record_len = struct.unpack("<IHH", header[4:12])
                if record_len <= 0 or header_len >= file_size:
                    return []

                # Guard against corrupted / spoofed record counts
                max_records = max(0, (file_size - header_len) // record_len)
                num_records = min(num_records, max_records, 100000)

                # Read fields
                fields = []
                while True:
                    field_desc = f.read(32)
                    if len(field_desc) < 32 or field_desc[0] == 0x0D:
                        break
                    field_name = field_desc[:11].split(b'\x00')[0].decode('ascii', errors='ignore').strip()
                    field_type = chr(field_desc[11])
                    field_length = field_desc[16]
                    fields.append((field_name, field_type, field_length))

                f.seek(header_len)
                records = []
                for _ in range(num_records):
                    rec_bytes = f.read(record_len)
                    if len(rec_bytes) < record_len:
                        break
                    if rec_bytes[0] == 0x2A:  # Deleted record mark
                        continue

                    offset = 1
                    row = {}
                    for fname, ftype, flen in fields:
                        if offset + flen <= len(rec_bytes):
                            val_str = rec_bytes[offset:offset+flen].decode('utf-8', errors='ignore').strip()
                            offset += flen
                            if ftype in ('N', 'F'):
                                try:
                                    row[fname] = float(val_str) if '.' in val_str else int(val_str)
                                except ValueError:
                                    row[fname] = None
                            else:
                                row[fname] = val_str
                    records.append(row)
                return records
        except Exception:
            return []
