import os
import shutil
import zipfile
import tempfile
import logging
from typing import List, Dict, Any, Tuple, Optional
from app.core.config import settings
from app.geospatial.pure_geo import PureShapefileReader

logger = logging.getLogger(__name__)

REQUIRED_SHAPEFILE_EXTENSIONS = {".shp", ".shx", ".dbf"}
MAX_COMPRESSION_RATIO = 100.0  # Max uncompressed to compressed ratio

class ShapefileParser:
    """
    Safely unpacks, validates, and parses Shapefile ZIP archives.
    Protects against Zip Slip, Zip Bomb, and path traversal vulnerabilities.
    """

    @staticmethod
    def _is_safe_path(base_dir: str, target_path: str) -> bool:
        """Ensures target path resolves strictly inside base_dir without symlink or .. escapes."""
        real_base = os.path.realpath(os.path.abspath(base_dir))
        real_target = os.path.realpath(os.path.abspath(target_path))
        return real_target.startswith(real_base + os.path.sep) or real_target == real_base

    @classmethod
    def extract_and_validate_zip(cls, zip_path: str, temp_dir: str) -> Tuple[str, Optional[str]]:
        try:
            if not zipfile.is_zipfile(zip_path):
                return "", "The uploaded file is not a valid ZIP archive."

            compressed_size = os.path.getsize(zip_path)
            if compressed_size == 0:
                return "", "The uploaded ZIP archive is empty."

            with zipfile.ZipFile(zip_path, 'r') as zf:
                infolist = zf.infolist()

                # 1. Check entry count limit
                if len(infolist) > settings.MAX_ZIP_ENTRIES:
                    return "", f"Security error: ZIP contains too many files ({len(infolist)} > {settings.MAX_ZIP_ENTRIES})."

                # 2. Check total uncompressed size and compression ratio (Zip Bomb defense)
                total_uncompressed = sum(info.file_size for info in infolist)
                if total_uncompressed > settings.MAX_EXTRACTED_SIZE:
                    return "", (
                        f"Security error: Uncompressed ZIP size ({total_uncompressed // (1024*1024)}MB) "
                        f"exceeds safety threshold ({settings.MAX_EXTRACTED_SIZE // (1024*1024)}MB)."
                    )

                if compressed_size > 0:
                    ratio = total_uncompressed / compressed_size
                    if ratio > MAX_COMPRESSION_RATIO and total_uncompressed > 5 * 1024 * 1024:
                        return "", f"Security error: Suspicious compression ratio ({ratio:.1f}:1). Potential Zip Bomb rejected."

                # 3. Zip Slip & Path Traversal check
                for member in infolist:
                    filename = member.filename
                    # Reject absolute paths or Windows drive letters
                    if filename.startswith("/") or filename.startswith("\\") or (len(filename) > 1 and filename[1] == ":"):
                        return "", f"Security error: ZIP contains invalid absolute path ({filename})."

                    target_path = os.path.join(temp_dir, filename)
                    if not cls._is_safe_path(temp_dir, target_path):
                        return "", f"Security error: ZIP file contains an unsafe path traversal vector ({filename})."

                # 4. Safe controlled extraction
                for member in infolist:
                    zf.extract(member, temp_dir)

            all_files = []
            for root, _, files in os.walk(temp_dir):
                for f in files:
                    if not f.startswith("._") and not f.startswith("__MACOSX"):
                        all_files.append(os.path.join(root, f))

            shp_files = [f for f in all_files if f.lower().endswith(".shp")]
            if not shp_files:
                return "", "No Shapefile (.shp) found in the uploaded ZIP archive."

            primary_shp = shp_files[0]
            shp_base = os.path.splitext(primary_shp)[0]

            found_exts = {os.path.splitext(f)[1].lower() for f in all_files if os.path.splitext(f)[0] == shp_base}
            missing_exts = REQUIRED_SHAPEFILE_EXTENSIONS - found_exts
            if missing_exts:
                missing_str = ", ".join(sorted(missing_exts))
                return "", f"Shapefile archive is missing required components: {missing_str}."

            return primary_shp, None

        except zipfile.BadZipFile:
            return "", "The uploaded file is corrupted or not a valid ZIP archive."
        except Exception as e:
            return "", f"Failed to extract Shapefile ZIP: {str(e)}"

    @classmethod
    def parse_shapefile_zip(cls, zip_path: str) -> Tuple[List[Dict[str, Any]], Optional[str], Optional[str]]:
        os.makedirs(settings.TEMP_DIR, exist_ok=True)
        temp_extract_dir = tempfile.mkdtemp(prefix="terraflow_shp_", dir=settings.TEMP_DIR)
        try:
            shp_path, err = cls.extract_and_validate_zip(zip_path, temp_extract_dir)
            if err:
                return [], None, err

            # Check for .prj file
            detected_crs = "EPSG:4326"
            prj_path = os.path.splitext(shp_path)[0] + ".prj"
            if os.path.exists(prj_path):
                try:
                    with open(prj_path, "r", encoding="utf-8", errors="ignore") as pf:
                        detected_crs = pf.read(1024).strip() or "EPSG:4326"
                except Exception:
                    pass

            raw_features, read_err = PureShapefileReader.read_shapefile(shp_path)
            if read_err:
                return [], None, read_err

            features = []
            for f in raw_features:
                features.append({
                    "feature_index": f["feature_index"],
                    "raw_geometry": f["geometry_dict"],
                    "properties": f["properties"],
                    "source_crs": detected_crs
                })

            return features, detected_crs, None

        except Exception as e:
            return [], None, f"Error reading Shapefile: {str(e)}"
        finally:
            shutil.rmtree(temp_extract_dir, ignore_errors=True)
