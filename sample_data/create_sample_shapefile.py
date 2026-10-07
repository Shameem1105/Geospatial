import os
import struct
import zipfile

def write_shapefile_binary(base_path: str):
    """
    Directly writes valid ESRI Shapefile files (.shp, .shx, .dbf, .prj) in pure Python.
    Creates 2 Polygon features in Chennai (EPSG:4326).
    """
    shp_path = base_path + ".shp"
    shx_path = base_path + ".shx"
    dbf_path = base_path + ".dbf"
    prj_path = base_path + ".prj"

    # PRJ: WGS 84
    prj_wkt = 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]'
    with open(prj_path, "w") as f:
        f.write(prj_wkt)

    # Features:
    poly1_pts = [
        (80.230, 12.990),
        (80.235, 12.990),
        (80.235, 12.995),
        (80.230, 12.995),
        (80.230, 12.990)
    ]
    poly2_pts = [
        (80.236, 12.991),
        (80.240, 12.991),
        (80.240, 12.996),
        (80.236, 12.996),
        (80.236, 12.991)
    ]

    features = [
        {"name": "Commercial Plot A", "zoning": "Commercial-High", "owner": "Metro Development", "pts": poly1_pts},
        {"name": "Commercial Plot B", "zoning": "Mixed-Use", "owner": "Apex Infra Group", "pts": poly2_pts}
    ]

    all_x = [p[0] for feat in features for p in feat["pts"]]
    all_y = [p[1] for feat in features for p in feat["pts"]]
    min_x, max_x = min(all_x), max(all_x)
    min_y, max_y = min(all_y), max(all_y)

    records_shp = []
    shx_entries = []
    offset_words = 50  # 100 bytes header = 50 16-bit words

    for idx, feat in enumerate(features):
        pts = feat["pts"]
        num_pts = len(pts)
        num_parts = 1
        fx = [p[0] for p in pts]
        fy = [p[1] for p in pts]
        f_minx, f_maxx = min(fx), max(fx)
        f_miny, f_maxy = min(fy), max(fy)

        content_bytes = bytearray()
        content_bytes.extend(struct.pack("<i", 5))  # Polygon type
        content_bytes.extend(struct.pack("<dddd", f_minx, f_miny, f_maxx, f_maxy))  # Box
        content_bytes.extend(struct.pack("<ii", num_parts, num_pts))
        content_bytes.extend(struct.pack("<i", 0))  # Part 0 offset
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
        h.extend(struct.pack(">i", 9994))  # File code
        h.extend(struct.pack(">5i", 0, 0, 0, 0, 0))  # Unused
        h.extend(struct.pack(">i", length_words))
        h.extend(struct.pack("<i", 1000))  # Version
        h.extend(struct.pack("<i", 5))  # Shape type (5 = Polygon)
        h.extend(struct.pack("<dddd", min_x, min_y, max_x, max_y))
        h.extend(struct.pack("<dddd", 0.0, 0.0, 0.0, 0.0))  # Z, M
        return bytes(h)

    with open(shp_path, "wb") as f:
        f.write(build_header(file_length_words))
        for r in records_shp:
            f.write(r)

    with open(shx_path, "wb") as f:
        f.write(build_header(shx_length_words))
        for e in shx_entries:
            f.write(e)

    # DBF File
    field_defs = [
        ("NAME", "C", 30),
        ("ZONING", "C", 20),
        ("OWNER", "C", 30)
    ]
    header_len = 32 + len(field_defs) * 32 + 1
    record_len = 1 + sum(f[2] for f in field_defs)
    num_records = len(features)

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

        for feat in features:
            f.write(b" ")
            f.write(feat["name"].encode('utf-8')[:30].ljust(30, b' '))
            f.write(feat["zoning"].encode('utf-8')[:20].ljust(20, b' '))
            f.write(feat["owner"].encode('utf-8')[:30].ljust(30, b' '))
        f.write(b"\x1A")

    print(f"Generated shapefile components at {base_path}")

def make_sample_zip():
    sample_dir = os.path.dirname(os.path.abspath(__file__))
    temp_base = os.path.join(sample_dir, "site_parcels")
    write_shapefile_binary(temp_base)

    zip_path = os.path.join(sample_dir, "site_parcels.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for ext in [".shp", ".shx", ".dbf", ".prj"]:
            fpath = temp_base + ext
            if os.path.exists(fpath):
                zf.write(fpath, arcname="site_parcels" + ext)
                os.remove(fpath)

    print(f"Created sample Shapefile ZIP: {zip_path}")

if __name__ == "__main__":
    make_sample_zip()
