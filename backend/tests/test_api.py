import io
import os
import pytest

def test_project_crud(client):
    # 1. Create project
    create_resp = client.post("/api/v1/projects", json={
        "name": "Chennai Greenfield Project",
        "description": "Smart city infrastructure zone"
    })
    assert create_resp.status_code == 200
    pdata = create_resp.json()
    project_id = pdata["id"]
    assert pdata["name"] == "Chennai Greenfield Project"

    # 2. List projects
    list_resp = client.get("/api/v1/projects")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # 3. Get project
    get_resp = client.get(f"/api/v1/projects/{project_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == project_id

    # 4. Update project
    up_resp = client.put(f"/api/v1/projects/{project_id}", json={
        "name": "Chennai Greenfield Updated"
    })
    assert up_resp.status_code == 200
    assert up_resp.json()["name"] == "Chennai Greenfield Updated"

def test_kml_upload_and_features(client):
    kml_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "sample_data", "construction_site.kml")
    with open(kml_path, "rb") as f:
        upload_resp = client.post(
            "/api/v1/files",
            files={"file": ("construction_site.kml", f, "application/vnd.google-earth.kml+xml")}
        )
    assert upload_resp.status_code == 200
    data = upload_resp.json()
    file_id = data["file_id"]

    # Check file endpoint
    file_resp = client.get(f"/api/v1/files/{file_id}")
    assert file_resp.status_code == 200

def test_invalid_file_upload(client):
    fake_content = io.BytesIO(b"Not a real kml or shapefile")
    resp = client.post(
        "/api/v1/files",
        files={"file": ("fake.txt", fake_content, "text/plain")}
    )
    assert resp.status_code == 400
    assert "Unsupported file format" in resp.json()["error"]["message"]
