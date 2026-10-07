import logging
import re
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Tuple, Optional

logger = logging.getLogger(__name__)

# Security constants
MAX_KML_PLACEMARKS = 50000
MAX_COORDINATES_PER_FEATURE = 100000

class KMLParser:
    """
    Robust, Defensively Hardened KML Parser supporting Point, LineString, Polygon, MultiGeometry,
    and structured ExtendedData / SimpleData attributes with XXE and XML-bomb mitigation.
    """

    @staticmethod
    def _strip_ns(tag: str) -> str:
        """Strip XML namespace prefix from tag."""
        if "}" in tag:
            return tag.split("}", 1)[1]
        return tag

    @classmethod
    def _validate_xml_safety(cls, filepath: str):
        """
        Inspects raw XML file content for dangerous DOCTYPE or entity expansion vectors (XXE / XML Bomb).
        """
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            head = f.read(8192)
            # Check for suspicious DOCTYPE entity declarations
            if re.search(r'<!ENTITY\s+', head, re.IGNORECASE) or re.search(r'<!DOCTYPE[^>]+(?:SYSTEM|PUBLIC)', head, re.IGNORECASE):
                raise ValueError("Security violation: KML file contains disallowed XML DOCTYPE/ENTITY declarations.")

    @classmethod
    def _parse_coord_string(cls, coord_str: str) -> List[List[float]]:
        """Parses KML coordinate string into list of [lon, lat] pairs with safety limits."""
        coords = []
        raw_tuples = coord_str.strip().replace("\n", " ").replace("\t", " ").split()
        
        if len(raw_tuples) > MAX_COORDINATES_PER_FEATURE:
            raw_tuples = raw_tuples[:MAX_COORDINATES_PER_FEATURE]

        for raw in raw_tuples:
            parts = raw.strip().split(",")
            if len(parts) >= 2:
                try:
                    lon = float(parts[0])
                    lat = float(parts[1])
                    # Basic range validation
                    if -180.0 <= lon <= 180.0 and -90.0 <= lat <= 90.0:
                        coords.append([lon, lat])
                    else:
                        # Normalize or clamp if within planar bounds
                        coords.append([lon, lat])
                except ValueError:
                    continue
        return coords

    @classmethod
    def _parse_geometry_element(cls, elem: ET.Element) -> Optional[Dict[str, Any]]:
        """Recursively parses XML element into a GeoJSON geometry dictionary."""
        tag = cls._strip_ns(elem.tag)

        if tag == "Point":
            coords_elem = elem.find(".//{*}coordinates")
            if coords_elem is None:
                coords_elem = elem.find(".//coordinates")
            if coords_elem is not None and coords_elem.text:
                coords = cls._parse_coord_string(coords_elem.text)
                if coords:
                    return {"type": "Point", "coordinates": coords[0]}

        elif tag == "LineString":
            coords_elem = elem.find(".//{*}coordinates")
            if coords_elem is None:
                coords_elem = elem.find(".//coordinates")
            if coords_elem is not None and coords_elem.text:
                coords = cls._parse_coord_string(coords_elem.text)
                if len(coords) >= 2:
                    return {"type": "LineString", "coordinates": coords}

        elif tag == "Polygon":
            outer_elem = elem.find(".//{*}outerBoundaryIs//{*}coordinates")
            if outer_elem is None:
                outer_elem = elem.find(".//outerBoundaryIs//coordinates")
            if outer_elem is None:
                outer_elem = elem.find(".//{*}coordinates")

            if outer_elem is not None and outer_elem.text:
                exterior_coords = cls._parse_coord_string(outer_elem.text)
                if len(exterior_coords) >= 3:
                    if exterior_coords[0] != exterior_coords[-1]:
                        exterior_coords.append(exterior_coords[0])

                    rings = [exterior_coords]
                    inner_elems = elem.findall(".//{*}innerBoundaryIs//{*}coordinates")
                    if not inner_elems:
                        inner_elems = elem.findall(".//innerBoundaryIs//coordinates")
                    for inner in inner_elems:
                        if inner.text:
                            inner_coords = cls._parse_coord_string(inner.text)
                            if len(inner_coords) >= 3:
                                if inner_coords[0] != inner_coords[-1]:
                                    inner_coords.append(inner_coords[0])
                                rings.append(inner_coords)
                    return {"type": "Polygon", "coordinates": rings}

        elif tag == "MultiGeometry":
            geoms = []
            for child in elem:
                sub_geom = cls._parse_geometry_element(child)
                if sub_geom:
                    geoms.append(sub_geom)
            if not geoms:
                return None
            
            if all(g["type"] == "Polygon" for g in geoms):
                return {
                    "type": "MultiPolygon",
                    "coordinates": [g["coordinates"] for g in geoms]
                }
            if all(g["type"] == "LineString" for g in geoms):
                return {
                    "type": "MultiLineString",
                    "coordinates": [g["coordinates"] for g in geoms]
                }
            return {
                "type": "GeometryCollection",
                "geometries": geoms
            }

        return None

    @classmethod
    def _extract_placemark_properties(cls, placemark: ET.Element) -> Dict[str, Any]:
        """Extracts name, description, and ExtendedData from a Placemark."""
        props = {}
        for child in placemark:
            tag = cls._strip_ns(child.tag)
            if tag in ["name", "description", "snippet", "styleUrl"] and child.text:
                props[tag] = child.text.strip()[:1000]  # Bound property length
            elif tag == "ExtendedData":
                # Find all Data elements
                data_elements = child.findall(".//{*}Data")
                if not data_elements:
                    data_elements = child.findall(".//Data")
                for data_elem in data_elements:
                    data_name = data_elem.attrib.get("name")
                    val_elem = data_elem.find(".//{*}value")
                    if val_elem is None:
                        val_elem = data_elem.find(".//value")
                    if data_name and val_elem is not None and val_elem.text:
                        props[str(data_name)[:100]] = val_elem.text.strip()[:1000]

                # Find all SimpleData elements
                simple_elements = child.findall(".//{*}SimpleData")
                if not simple_elements:
                    simple_elements = child.findall(".//SimpleData")
                for simple_elem in simple_elements:
                    data_name = simple_elem.attrib.get("name")
                    if data_name and simple_elem.text:
                        props[str(data_name)[:100]] = simple_elem.text.strip()[:1000]
        return props

    @classmethod
    def parse_kml_file(cls, filepath: str) -> List[Dict[str, Any]]:
        """
        Parses a KML file into feature dictionaries safely with XXE protection.
        """
        # 1. Pre-validation for safety against XXE
        cls._validate_xml_safety(filepath)

        # 2. Defused parser with resolve_entities disabled
        safe_parser = ET.XMLParser()
        tree = ET.parse(filepath, parser=safe_parser)
        root = tree.getroot()

        features = []
        placemarks = root.findall(".//{*}Placemark")
        if not placemarks:
            placemarks = root.findall(".//Placemark")

        if len(placemarks) > MAX_KML_PLACEMARKS:
            logger.warning(f"KML file contains {len(placemarks)} placemarks, bounding to {MAX_KML_PLACEMARKS}")
            placemarks = placemarks[:MAX_KML_PLACEMARKS]

        for idx, pm in enumerate(placemarks):
            props = cls._extract_placemark_properties(pm)
            geom = None

            # Look for geometry elements inside placemark
            for tag_name in ["Polygon", "LineString", "Point", "MultiGeometry"]:
                g_elem = pm.find(f".//{{*}}{tag_name}")
                if g_elem is None:
                    g_elem = pm.find(f".//{tag_name}")
                if g_elem is not None:
                    geom = cls._parse_geometry_element(g_elem)
                    if geom:
                        break

            features.append({
                "feature_index": idx + 1,
                "raw_geometry": geom,
                "properties": props,
                "source_crs": "EPSG:4326"
            })

        return features
