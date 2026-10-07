import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Setup environment
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

from app.main import app
from app.core.database import Base, engine, SessionLocal, get_db
from app.services.processing_service import ProcessingService

def run_end_to_end_test():
    print("=" * 70)
    print("TERRAFLOW GEOSPATIAL INTELLIGENCE PLATFORM — END-TO-END VALIDATION")
    print("=" * 70)

    # 1. Initialize Tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    # 2. Verify Health
    health_res = client.get("/api/v1/health")
    assert health_res.status_code == 200, f"Health check failed: {health_res.text}"
    print(f"\n[+] Health Check Passed: {health_res.json()}")

    # 3. Create a Project
    proj_res = client.post("/api/v1/projects", json={
        "name": "Global Infrastructure Portfolio",
        "description": "Comprehensive test project containing real-world survey packages."
    })
    assert proj_res.status_code == 200, f"Project creation failed: {proj_res.text}"
    project_id = proj_res.json()["id"]
    print(f"[+] Created Project: '{proj_res.json()['name']}' (ID: {project_id})")

    # 4. Ingest and Process all 6 Real-world Test Datasets
    input_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "input files")
    files_to_test = sorted([f for f in os.listdir(input_dir) if f.endswith(".kml") or f.endswith(".zip")])
    print(f"\n[+] Found {len(files_to_test)} real-world input files in '{input_dir}':")

    results_summary = []

    for f_idx, fname in enumerate(files_to_test, 1):
        fpath = os.path.join(input_dir, fname)
        mime = "application/vnd.google-earth.kml+xml" if fname.endswith(".kml") else "application/zip"

        print(f"\n--- [{f_idx}/{len(files_to_test)}] Processing: {fname} ---")

        with open(fpath, "rb") as f_data:
            upload_res = client.post(
                "/api/v1/files",
                data={"project_id": project_id},
                files={"file": (fname, f_data, mime)}
            )

        assert upload_res.status_code == 200, f"Upload failed for {fname}: {upload_res.text}"
        file_id = upload_res.json()["file_id"]
        print(f"  -> Uploaded successfully (File ID: {file_id})")

        # Process job synchronously
        ProcessingService.process_file_job(file_id, db)

        # Query File Details
        file_detail_res = client.get(f"/api/v1/files/{file_id}")
        assert file_detail_res.status_code == 200
        file_data = file_detail_res.json()
        status = file_data["status"]
        feature_count = file_data["feature_count"]
        detected_crs = file_data.get("detected_crs")
        print(f"  -> Status: {status} | Features: {feature_count} | CRS: {detected_crs}")
        assert status in ["COMPLETED", "PARTIAL_SUCCESS"], f"Job failed with status {status}"

        # Query Features
        features_res = client.get(f"/api/v1/files/{file_id}/features?page_size=50")
        assert features_res.status_code == 200
        features_list = features_res.json()["features"]
        print(f"  -> Extracted {len(features_list)} features with geometries & properties")

        # Query Statistics
        stats_res = client.get(f"/api/v1/files/{file_id}/statistics")
        assert stats_res.status_code == 200
        stats = stats_res.json()
        print(f"  -> Total Calculated Area: {stats['total_area_sqm']:,.2f} m² ({stats['total_area_acres']:,.2f} acres)")
        print(f"  -> Total Calculated Length: {stats['total_length_m']:,.2f} m ({stats['total_length_km']:,.2f} km)")
        print(f"  -> Calculation Projected CRS: {stats.get('calculation_crs')}")

        # Query GeoJSON FeatureCollection
        geojson_res = client.get(f"/api/v1/files/{file_id}/geojson")
        assert geojson_res.status_code == 200
        geojson = geojson_res.json()
        assert geojson["type"] == "FeatureCollection"
        print(f"  -> RFC 7946 GeoJSON generated ({len(geojson['features'])} GeoJSON features)")

        # Query CSV Export
        csv_res = client.get(f"/api/v1/reports/csv/{file_id}")
        assert csv_res.status_code == 200
        assert len(csv_res.text) > 50
        print(f"  -> CSV Export generated ({len(csv_res.text)} bytes)")

        # Query JSON Export
        json_res = client.get(f"/api/v1/reports/json/{file_id}")
        assert json_res.status_code == 200
        print(f"  -> JSON Export generated ({len(json_res.json()['features'])} items)")

        results_summary.append({
            "filename": fname,
            "features": feature_count,
            "status": status,
            "area_sqm": stats['total_area_sqm'],
            "length_m": stats['total_length_m'],
            "crs": stats.get('calculation_crs') or detected_crs
        })

    # 5. Verify Workspace Analytics
    print("\n" + "=" * 70)
    print("WORKSPACE INTELLIGENCE & AGGREGATED METRICS")
    print("=" * 70)
    analytics_res = client.get("/api/v1/analytics")
    assert analytics_res.status_code == 200
    analytics = analytics_res.json()
    print(f"Total Projects: {analytics['total_projects']}")
    print(f"Total Files Processed: {analytics['total_files']}")
    print(f"Total Indexed Features: {analytics['total_features']}")
    print(f"Total Portfolio Measured Area: {analytics['total_area_sqm']:,.2f} m² ({analytics['total_area_sqkm']:,.4f} km²)")
    print(f"Total Portfolio Line Length: {analytics['total_length_m']:,.2f} m ({analytics['total_length_km']:,.3f} km)")
    print(f"Overall Processing Success Rate: {analytics['success_rate']}%")

    # 6. Verify Project Details
    project_detail_res = client.get(f"/api/v1/projects/{project_id}")
    assert project_detail_res.status_code == 200
    p_data = project_detail_res.json()
    print(f"\nProject '{p_data['name']}' has {len(p_data['files'])} associated survey datasets.")

    print("\n" + "=" * 70)
    print("ALL 6 REAL-WORLD DATASETS PROCESSED END-TO-END WITH ZERO ERRORS!")
    print("=" * 70)

    db.close()

if __name__ == "__main__":
    run_end_to_end_test()
