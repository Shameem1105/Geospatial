import os
import struct
import zipfile

INPUT_FILES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "input files")
os.makedirs(INPUT_FILES_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. Chennai Metro Corridor KML
# -------------------------------------------------------------
chennai_kml = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Chennai Metro Rail Infrastructure Corridor</name>
    <description>Phase 2 alignment, station plazas, and depot yard facilities in Chennai, India.</description>

    <!-- Station Area Polygon -->
    <Placemark>
      <name>Chennai Central Metro Interchange Hub</name>
      <description>Multi-modal transit terminal connecting Central Station and Metro Phase 1 &amp; 2</description>
      <ExtendedData>
        <Data name="ZONE_ID"><value>CHN-METRO-01</value></Data>
        <Data name="LAND_USE"><value>Transport Infrastructure</value></Data>
        <Data name="AUTHORITY"><value>CMRL</value></Data>
      </ExtendedData>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              80.2740,13.0815,0
              80.2785,13.0815,0
              80.2785,13.0850,0
              80.2740,13.0850,0
              80.2740,13.0815,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>

    <!-- Koyambedu Depot Polygon -->
    <Placemark>
      <name>Koyambedu Maintenance &amp; Depot Yard</name>
      <description>Rolling stock maintenance, stabling lines, and operational control center</description>
      <ExtendedData>
        <Data name="ZONE_ID"><value>CHN-METRO-02</value></Data>
        <Data name="FACILITY"><value>Depot &amp; Workshop</value></Data>
      </ExtendedData>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              80.1900,13.0700,0
              80.1980,13.0700,0
              80.1980,13.0760,0
              80.1900,13.0760,0
              80.1900,13.0700,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>

    <!-- Blue Line Corridor LineString -->
    <Placemark>
      <name>Anna Salai Blue Line Elevated Corridor</name>
      <description>Guindy to Saidapet to Nandanam metro corridor section</description>
      <ExtendedData>
        <Data name="CORRIDOR"><value>Blue Line Corridor 1</value></Data>
        <Data name="STRUCTURE"><value>Elevated Viaduct</value></Data>
      </ExtendedData>
      <LineString>
        <coordinates>
          80.2185,13.0080,0
          80.2240,13.0180,0
          80.2310,13.0270,0
          80.2390,13.0330,0
          80.2450,13.0410,0
          80.2520,13.0520,0
        </coordinates>
      </LineString>
    </Placemark>

    <!-- Guindy Station Point -->
    <Placemark>
      <name>Guindy Metro Station</name>
      <description>Interchange with Suburban Railway and Industrial Estate</description>
      <Point>
        <coordinates>80.2185,13.0080,0</coordinates>
      </Point>
    </Placemark>

    <!-- Saidapet Station Point -->
    <Placemark>
      <name>Saidapet Metro Station</name>
      <description>Underground station adjacent to Maraimalai Adigal Bridge</description>
      <Point>
        <coordinates>80.2240,13.0180,0</coordinates>
      </Point>
    </Placemark>

  </Document>
</kml>
"""

with open(os.path.join(INPUT_FILES_DIR, "Chennai_Metro_Corridor.kml"), "w", encoding="utf-8") as f:
    f.write(chennai_kml)

# -------------------------------------------------------------
# 2. Bangalore Tech Park KML
# -------------------------------------------------------------
bangalore_kml = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Bengaluru Electronic City Tech Park Zone</name>
    <description>Special Economic Zone IT Park plots and internal arterial ring road in Bengaluru, Karnataka.</description>

    <Placemark>
      <name>Electronic City Phase 1 Main Campus</name>
      <description>Major enterprise tech park and data center facility</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              77.6650,12.8450,0
              77.6740,12.8450,0
              77.6740,12.8520,0
              77.6650,12.8520,0
              77.6650,12.8450,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>

    <Placemark>
      <name>Hosur Road Expressway Flyover Link</name>
      <description>Direct elevated expressway access ramp to IT Hub</description>
      <LineString>
        <coordinates>
          77.6580,12.8380,0
          77.6640,12.8440,0
          77.6720,12.8500,0
          77.6800,12.8580,0
        </coordinates>
      </LineString>
    </Placemark>

    <Placemark>
      <name>Helipad &amp; Emergency Hub</name>
      <Point>
        <coordinates>77.6680,12.8480,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>
"""

with open(os.path.join(INPUT_FILES_DIR, "Bangalore_Tech_Park.kml"), "w", encoding="utf-8") as f:
    f.write(bangalore_kml)

# -------------------------------------------------------------
# 3. Mumbai Coastal Road KML
# -------------------------------------------------------------
mumbai_kml = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Mumbai Coastal Road Expressway Package</name>
    <description>Reclaimed coastal alignment from Marine Drive to Worli Sea Face, Mumbai, Maharashtra.</description>

    <Placemark>
      <name>Marine Drive to Worli High-Speed Alignment</name>
      <description>8-lane access controlled arterial coastal road with undersea tunnel section</description>
      <LineString>
        <coordinates>
          72.8180,18.9440,0
          72.8120,18.9600,0
          72.8050,18.9800,0
          72.8100,19.0020,0
          72.8160,19.0200,0
        </coordinates>
      </LineString>
    </Placemark>

    <Placemark>
      <name>Haji Ali Coastal Promenade Reclamation Plot</name>
      <description>Reclaimed green parkland, seaside promenade and transit interchange</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              72.8080,18.9750,0
              72.8140,18.9750,0
              72.8140,18.9820,0
              72.8080,18.9820,0
              72.8080,18.9750,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>

    <Placemark>
      <name>Worli Sea Link Interchange Anchor Point</name>
      <Point>
        <coordinates>72.8160,19.0200,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>
"""

with open(os.path.join(INPUT_FILES_DIR, "Mumbai_Coastal_Road.kml"), "w", encoding="utf-8") as f:
    f.write(mumbai_kml)


# -------------------------------------------------------------
# Helper: Write binary shapefile components (.shp, .shx, .dbf, .prj) and zip
# -------------------------------------------------------------
def build_shapefile_zip(output_zip_path: str, base_name: str, features_list: list, field_defs: list):
    temp_base = os.path.join(INPUT_FILES_DIR, f"_temp_{base_name}")
    shp_path = temp_base + ".shp"
    shx_path = temp_base + ".shx"
    dbf_path = temp_base + ".dbf"
    prj_path = temp_base + ".prj"

    # 1. PRJ
    prj_wkt = 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]'
    with open(prj_path, "w", encoding="utf-8") as f:
        f.write(prj_wkt)

    # 2. Geometry Bounding Box
    all_x = [pt[0] for feat in features_list for pt in feat["pts"]]
    all_y = [pt[1] for feat in features_list for pt in feat["pts"]]
    min_x, max_x = min(all_x), max(all_x)
    min_y, max_y = min(all_y), max(all_y)

    records_shp = []
    shx_entries = []
    offset_words = 50

    for idx, feat in enumerate(features_list):
        pts = feat["pts"]
        num_pts = len(pts)
        num_parts = 1
        fx = [p[0] for p in pts]
        fy = [p[1] for p in pts]
        f_minx, f_maxx = min(fx), max(fx)
        f_miny, f_maxy = min(fy), max(fy)

        content_bytes = bytearray()
        content_bytes.extend(struct.pack("<i", 5))  # 5 = Polygon
        content_bytes.extend(struct.pack("<dddd", f_minx, f_miny, f_maxx, f_maxy))
        content_bytes.extend(struct.pack("<ii", num_parts, num_pts))
        content_bytes.extend(struct.pack("<i", 0))
        for px, py in pts:
            content_bytes.extend(struct.pack("<dd", px, py))

        content_len_words = len(content_bytes) // 2
        rec_header = struct.pack(">ii", idx + 1, content_len_words)
        record = rec_header + bytes(content_bytes)

        records_shp.append(record)
        shx_entries.append(struct.pack(">ii", offset_words, content_len_words))
        offset_words += len(record) // 2

    file_length_words = offset_words
    shx_length_words = 50 + len(shx_entries) * 4

    def build_header(length_words):
        h = bytearray()
        h.extend(struct.pack(">i", 9994))
        h.extend(struct.pack(">5i", 0, 0, 0, 0, 0))
        h.extend(struct.pack(">i", length_words))
        h.extend(struct.pack("<i", 1000))
        h.extend(struct.pack("<i", 5))
        h.extend(struct.pack("<dddd", min_x, min_y, max_x, max_y))
        h.extend(struct.pack("<dddd", 0.0, 0.0, 0.0, 0.0))
        return bytes(h)

    with open(shp_path, "wb") as f:
        f.write(build_header(file_length_words))
        for r in records_shp:
            f.write(r)

    with open(shx_path, "wb") as f:
        f.write(build_header(shx_length_words))
        for e in shx_entries:
            f.write(e)

    # 3. DBF
    header_len = 32 + len(field_defs) * 32 + 1
    record_len = 1 + sum(f[2] for f in field_defs)
    num_records = len(features_list)

    dbf_header = struct.pack(
        "<BBBBIHH20s",
        3, 126, 10, 7,
        num_records,
        header_len,
        record_len,
        b"\x00" * 20
    )

    with open(dbf_path, "wb") as f:
        f.write(dbf_header)
        for fname, ftype, flen in field_defs:
            fname_b = fname.encode('ascii')[:10].ljust(11, b'\x00')
            fdesc = struct.pack("<11scIBB14s", fname_b, ftype.encode('ascii'), 0, flen, 0, b"\x00" * 14)
            f.write(fdesc)
        f.write(b"\x0D")

        for feat in features_list:
            f.write(b" ")
            for fname, ftype, flen in field_defs:
                val = str(feat.get(fname.lower(), feat.get(fname, "")))
                f.write(val.encode('utf-8')[:flen].ljust(flen, b' '))
        f.write(b"\x1A")

    # 4. Pack into ZIP
    with zipfile.ZipFile(output_zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for ext in [".shp", ".shx", ".dbf", ".prj"]:
            fpath = temp_base + ext
            if os.path.exists(fpath):
                zf.write(fpath, arcname=f"{base_name}{ext}")
                os.remove(fpath)

    print(f"Created Shapefile ZIP: {output_zip_path}")


# -------------------------------------------------------------
# 4. Hyderabad HITEC City Zoning ZIP
# -------------------------------------------------------------
hyd_features = [
    {
        "name": "Cyber Towers Commercial Zone",
        "zoning": "Commercial-IT",
        "district": "Madhapur",
        "pts": [
            (78.3750, 17.4480),
            (78.3810, 17.4480),
            (78.3810, 17.4530),
            (78.3750, 17.4530),
            (78.3750, 17.4480)
        ]
    },
    {
        "name": "Knowledge City Mixed Parcel",
        "zoning": "Mixed-Commercial",
        "district": "Raidurg",
        "pts": [
            (78.3820, 17.4420),
            (78.3890, 17.4420),
            (78.3890, 17.4470),
            (78.3820, 17.4470),
            (78.3820, 17.4420)
        ]
    }
]
hyd_fields = [("NAME", "C", 35), ("ZONING", "C", 20), ("DISTRICT", "C", 20)]
build_shapefile_zip(
    os.path.join(INPUT_FILES_DIR, "Hyderabad_HITEC_City_Zoning.zip"),
    "Hyderabad_HITEC_City_Zoning",
    hyd_features,
    hyd_fields
)

# -------------------------------------------------------------
# 5. Delhi Aerocity Infrastructure ZIP
# -------------------------------------------------------------
delhi_features = [
    {
        "name": "Aerocity Hospitality District A",
        "sector": "Hospitality-01",
        "authority": "DIAL-GMR",
        "pts": [
            (77.1180, 28.5480),
            (77.1260, 28.5480),
            (77.1260, 28.5540),
            (77.1180, 28.5540),
            (77.1180, 28.5480)
        ]
    },
    {
        "name": "Cargo & Aviation Logistics Hub",
        "sector": "Cargo-Logistics",
        "authority": "AAI",
        "pts": [
            (77.1100, 28.5420),
            (77.1170, 28.5420),
            (77.1170, 28.5470),
            (77.1100, 28.5470),
            (77.1100, 28.5420)
        ]
    }
]
delhi_fields = [("NAME", "C", 35), ("SECTOR", "C", 20), ("AUTHORITY", "C", 20)]
build_shapefile_zip(
    os.path.join(INPUT_FILES_DIR, "Delhi_Aerocity_Infrastructure.zip"),
    "Delhi_Aerocity_Infrastructure",
    delhi_features,
    delhi_fields
)

# -------------------------------------------------------------
# 6. Dubai Marina Development ZIP
# -------------------------------------------------------------
dubai_features = [
    {
        "name": "Marina Promenade Sector 1",
        "zone": "Waterfront-Res",
        "developer": "Emaar Properties",
        "pts": [
            (55.1380, 25.0780),
            (55.1440, 25.0780),
            (55.1440, 25.0840),
            (55.1380, 25.0840),
            (55.1380, 25.0780)
        ]
    },
    {
        "name": "JBR The Walk Retail Plaza",
        "zone": "Commercial-Retail",
        "developer": "Dubai Holding",
        "pts": [
            (55.1320, 25.0720),
            (55.1370, 25.0720),
            (55.1370, 25.0770),
            (55.1320, 25.0770),
            (55.1320, 25.0720)
        ]
    }
]
dubai_fields = [("NAME", "C", 35), ("ZONE", "C", 20), ("DEVELOPER", "C", 25)]
build_shapefile_zip(
    os.path.join(INPUT_FILES_DIR, "Dubai_Marina_Development.zip"),
    "Dubai_Marina_Development",
    dubai_features,
    dubai_fields
)

print(f"\nAll 6 real-world test datasets generated successfully in: {INPUT_FILES_DIR}")
