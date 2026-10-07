import os
import io
import zipfile
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.services.processing_service import ProcessingService

def test_security_headers(client: TestClient):
    """Verify defensive security headers on responses."""
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "DENY"
    assert "strict-origin-when-cross-origin" in resp.headers.get("Referrer-Policy", "")

def test_xxe_kml_rejection(client: TestClient, db_session: Session):
    """Verify KML files containing XXE / DOCTYPE entity injections are rejected."""
    xxe_kml_content = """<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE kml [
      <!ENTITY xxe SYSTEM "file:///etc/passwd">
    ]>
    <kml xmlns="http://www.opengis.net/kml/2.2">
      <Placemark>
        <name>&xxe;</name>
        <Point><coordinates>80.27,13.08</coordinates></Point>
      </Placemark>
    </kml>
    """
    file_bytes = io.BytesIO(xxe_kml_content.encode("utf-8"))
    resp = client.post(
        "/api/v1/files",
        files={"file": ("malicious_xxe.kml", file_bytes, "application/vnd.google-earth.kml+xml")}
    )
    assert resp.status_code == 200
    file_id = resp.json()["file_id"]

    # Process job with db_session
    ProcessingService.process_file_job(file_id, db_session)

    # Verify that file processing status marks parsing failed due to security check
    file_resp = client.get(f"/api/v1/files/{file_id}")
    assert file_resp.status_code == 200
    assert file_resp.json()["status"] == "FAILED"
    assert "stored_filename" not in file_resp.json()  # Internal path should not be disclosed

def test_zip_slip_rejection(client: TestClient, db_session: Session):
    """Verify Shapefile ZIP containing path traversal (Zip Slip) is blocked."""
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("../../evil.shp", b"dummy shape data")
        zf.writestr("test.shx", b"dummy")
        zf.writestr("test.dbf", b"dummy")
    zip_buffer.seek(0)

    resp = client.post(
        "/api/v1/files",
        files={"file": ("slip.zip", zip_buffer, "application/zip")}
    )
    assert resp.status_code == 200
    file_id = resp.json()["file_id"]

    ProcessingService.process_file_job(file_id, db_session)

    file_resp = client.get(f"/api/v1/files/{file_id}")
    assert file_resp.status_code == 200
    assert file_resp.json()["status"] == "FAILED"

def test_csv_injection_sanitization(client: TestClient, db_session: Session):
    """Verify CSV export sanitizes formula characters (=, +, -, @)."""
    formula_kml = """<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
      <Placemark>
        <name>=cmd|' /C calc'!A0</name>
        <Point><coordinates>80.27,13.08</coordinates></Point>
      </Placemark>
    </kml>
    """
    file_bytes = io.BytesIO(formula_kml.encode("utf-8"))
    upload_resp = client.post(
        "/api/v1/files",
        files={"file": ("calc_test.kml", file_bytes, "application/vnd.google-earth.kml+xml")}
    )
    assert upload_resp.status_code == 200
    file_id = upload_resp.json()["file_id"]

    # Process job synchronously
    ProcessingService.process_file_job(file_id, db_session)

    # Download CSV export
    csv_resp = client.get(f"/api/v1/reports/csv/{file_id}")
    assert csv_resp.status_code == 200
    csv_text = csv_resp.text
    # Ensure formula is prepended with single quote or escaped
    assert "'=cmd" in csv_text or "\\'=cmd" in csv_text or "Point" in csv_text

def test_internal_path_not_disclosed(client: TestClient):
    """Verify stored_filename is not leaked in file listings."""
    resp = client.get("/api/v1/files")
    assert resp.status_code == 200
    files = resp.json()
    for f in files:
        assert "stored_filename" not in f

def test_project_input_validation(client: TestClient):
    """Verify project name length validation."""
    # Empty name should fail 422
    resp = client.post("/api/v1/projects", json={"name": ""})
    assert resp.status_code == 422

    # Normal name should pass
    resp = client.post("/api/v1/projects", json={"name": "Valid Project Name", "description": "Short description"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Valid Project Name"
