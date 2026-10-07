# TERRAFLOW

> **"Geospatial intelligence for the built environment."**

TerraFlow is an enterprise-grade geospatial file ingestion, validation, transformation, and measurement platform. It processes geographic datasets—specifically **Keyhole Markup Language (`.kml`)** files and zipped **ESRI Shapefile archives (`.zip`)**—extracting vector features, identifying geometry types, automatically transforming geographic coordinate reference systems (CRS) to optimal projected metric systems (UTM), and executing high-precision geometric measurements (planar polygon area and polyline length) persisted in a relational **MySQL** database.

The system features a **FastAPI** backend delivering REST APIs with defensive cybersecurity controls and an interactive **React 19 / TypeScript / Vite / Tailwind CSS** interface featuring Leaflet-powered spatial map visualization, feature analysis, statistical aggregations, and export capabilities.

---

## Table of Contents

1. [Project Overview & Problem Statement](#1-project-overview--problem-statement)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Repository & Project Structure](#5-repository--project-structure)
6. [Local Installation & Quickstart](#6-local-installation--quickstart)
7. [Database Architecture (MySQL & phpMyAdmin)](#7-database-architecture-mysql--phpmyadmin)
8. [Environment Variables](#8-environment-variables)
9. [REST API Documentation & curl Examples](#9-rest-api-documentation--curl-examples)
10. [End-to-End File Processing Flow](#10-end-to-end-file-processing-flow)
11. [Geometric Measurement Flow](#11-geometric-measurement-flow)
12. [Coordinate Reference System (CRS) Transformation Strategy](#12-coordinate-reference-system-crs-transformation-strategy)
13. [Partial Success & Resilient Error Handling](#13-partial-success--resilient-error-handling)
14. [Defensive Cybersecurity Implementation](#14-defensive-cybersecurity-implementation)
15. [Automated Testing Suite](#15-automated-testing-suite)
16. [Key Design Decisions](#16-key-design-decisions)
17. [Current Platform Limitations](#17-current-platform-limitations)
18. [Engineering Learnings & Takeaways](#18-engineering-learnings--takeaways)
19. [Future Roadmap & Scope](#19-future-roadmap--scope)
20. [Deployment Guide (Vercel & Production MySQL)](#20-deployment-guide-vercel--production-mysql)

---

## 1. Project Overview & Problem Statement

### The Problem
Geospatial data in civil engineering, urban planning, infrastructure construction, property appraisal, and surveying arrives in disparate spatial vector formats—principally **KML/KMZ** and **ESRI Shapefile ZIP packages**. Calculating physical real-world quantities (such as building footprints, land parcel square meters, pipeline kilometers, and right-of-way corridor lengths) directly from raw geographic files introduces severe errors:
1. **Latitude/Longitude Miscalculations**: Coordinates stored in angular degrees (`EPSG:4326 - WGS 84`) cannot be measured using standard Euclidean formulas without severe geometric distortion away from the equator.
2. **Format Incompatibilities**: Shapefiles require multi-part binary sidecars (`.shp`, `.shx`, `.dbf`, `.prj`), whereas KML files are XML structures with nested placemarks and multi-geometries.
3. **Data Integrity & Vulnerabilities**: GIS files uploaded from untrusted third parties risk malicious XML External Entity (XXE) attacks, Zip Slip directory traversals, and CSV formula injection.
4. **All-or-Nothing Batch Failures**: A single malformed vertex in a 5,000-parcel dataset should not crash the entire ingestion job.

### The Solution: TerraFlow
TerraFlow addresses these challenges through an automated processing pipeline:
- Ingests `.kml` and `.zip` Shapefile archives with strict validation.
- Automatically calculates the spatial centroid and dynamically reprojects geometries to the appropriate **Universal Transverse Mercator (UTM)** metric projection zone.
- Computes planar polygon area ($m^2$ / hectares) and polyline length (meters / kilometers) using planar metric algorithms.
- Handles points, multi-geometries, and unsupported shapes gracefully with granular per-feature status tracking (`SUCCESS`, `UNSUPPORTED`, `FAILED`).
- Persists all results, attributes, and spatial bounding boxes to a relational **MySQL** schema managed by **SQLAlchemy** and **Alembic**.
- Exposes RESTful APIs and an interactive visual dashboard for spatial exploration.

---

## 2. Key Features

- **Multi-Format Vector Ingestion**:
  - Direct KML parsing supporting Placemarks, Polygons, LineStrings, Points, and MultiGeometries.
  - Shapefile ZIP ingestion validating required sidecars (`.shp`, `.shx`, `.dbf`, `.prj`).
- **Dynamic Projected CRS Engine**:
  - Automatic centroid calculation across geographic coordinates.
  - Automatic UTM zone resolution ($1 \dots 60$, Northern/Southern hemisphere EPSG codes $32601 \dots 32660$ and $32701 \dots 32760$).
  - High-precision geodesic-to-planar coordinate transformation before metric calculations.
- **Accurate Metric Calculations**:
  - **Polygon / MultiPolygon**: Exact 2D Shoelace area in square meters ($m^2$) and hectares ($ha$).
  - **LineString / MultiLineString**: Geodesic/planar cumulative segment length in meters ($m$) and kilometers ($km$).
  - **Point / MultiPoint**: Zero-dimensional feature classification (`NO_MEASUREMENT_REQUIRED`), coordinates stored safely.
  - **Unsupported Geometries**: Logged and categorized gracefully without pipeline termination.
- **Resilient Batch Processing**:
  - Multi-status job lifecycle: `PENDING` $\rightarrow$ `PROCESSING` $\rightarrow$ `COMPLETED` / `PARTIAL_SUCCESS` / `FAILED`.
  - Feature-level error tracking with error messages stored per record.
- **Spatial Visualization & Reporting**:
  - RFC 7946 compliant GeoJSON generation with embedded measurement properties.
  - Interactive Leaflet map with layer controls, bounding-box zoom, and feature inspection.
  - Instant CSV and JSON data exports with CSV formula injection defense.
- **Enterprise Security Hardening**:
  - XXE prevention via secure XML entity parsing.
  - Zip Slip & Zip Bomb mitigation with path verification and extraction limits.
  - Sanitized error messages preventing filesystem disclosure.
  - HTTP Security Headers (`nosniff`, `DENY` frames, `strict-origin-when-cross-origin`).

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Type-safe dynamic user interface |
| **Frontend Tooling** | Vite 8 + Tailwind CSS | Ultra-fast bundling, modern responsive styling |
| **Mapping Engine** | Leaflet + React-Leaflet | Vector map rendering, layer management, bounding box fitting |
| **Icons & UI** | Lucide React | Modern interface iconography |
| **Backend Framework** | Python 3.12 + FastAPI | High-performance asynchronous REST API |
| **ASGI Web Server** | Uvicorn | High-throughput asynchronous server |
| **Database** | MySQL (8.0+ / MariaDB) | Relational persistence for files, jobs, features, and measurements |
| **ORM & Migrations** | SQLAlchemy 2.0 + Alembic | Declarative database models, schema versioning |
| **Database Driver** | PyMySQL + Cryptography | Pure-Python MySQL connectivity |
| **Geospatial Processing** | GeoPandas, Shapely, PyProj, Pyogrio | Coordinate transformations, spatial analysis, geometric math |
| **XML Parsing** | Python Standard `xml.etree` (Defensive) | Safe KML parsing with entity expansion disabled |
| **Testing Suite** | Pytest + Httpx + AnyIO | Unit, integration, security, and API regression testing |
| **Deployment** | Vercel (Serverless Python + Vite) | Cloud hosting with serverless API rewrites |

---

## 4. System Architecture

```
                                  +---------------------------------------+
                                  |         CLIENT APPLICATION            |
                                  |    React 19 / TypeScript / Vite       |
                                  |   (Leaflet Map + Spatial Explorer)    |
                                  +-------------------+-------------------+
                                                      |
                                    HTTPS / REST API  |  Multipart Form Data
                                                      v
                                  +---------------------------------------+
                                  |          FASTAPI GATEWAY              |
                                  |  - Security Headers Middleware        |
                                  |  - CORS Policy Verification           |
                                  |  - File Upload Validation (Size/Ext)  |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |       PROCESSING SERVICE ENGINE       |
                                  |  - Anti-XXE KML Stream Parser         |
                                  |  - Anti-ZipSlip Shapefile Parser      |
                                  |  - Feature & Geometry Extraction      |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |       GEOSPATIAL & CRS ENGINE         |
                                  |  1. Centroid Detection (Lat/Lon)      |
                                  |  2. Dynamic UTM Zone Determination    |
                                  |  3. PyProj Coordinate Transformation  |
                                  |  4. Planar Shoelace Area (m² / ha)    |
                                  |  5. Polyline Length (m / km)          |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |         PERSISTENCE LAYER             |
                                  |      SQLAlchemy ORM + PyMySQL         |
                                  +-------------------+-------------------+
                                                      |
                        +-----------------------------+-----------------------------+
                        |                                                           |
                        v                                                           v
+-----------------------------------------------+           +-----------------------------------------------+
|         LOCAL DEVELOPMENT (XAMPP)             |           |          PRODUCTION DATABASE (CLOUD)          |
|  - MySQL Server (Port 3306)                   |           |  - Remote Cloud MySQL (TiDB / RDS / Aiven)   |
|  - phpMyAdmin GUI (Database: terraflow)       |           |  - SSL / TLS Encrypted Connections            |
+-----------------------------------------------+           +-----------------------------------------------+
```

---

## 5. Repository & Project Structure

```
c:/Geospatial/
├── README.md                      # Comprehensive project documentation
├── vercel.json                    # Vercel deployment, build, and API rewrite rules
├── requirements.txt               # Root Python dependencies for cloud deployment
├── .gitignore                     # Git exclusion rules (secrets, venv, uploads, dist)
├── .env.example                   # Master environment template
│
├── api/                           # Serverless API Entrypoint
│   └── index.py                   # Vercel serverless Python adapter exposing FastAPI app
│
├── backend/                       # Python FastAPI Backend
│   ├── alembic.ini                # Alembic migration configuration
│   ├── requirements.txt           # Backend dependencies
│   ├── .env.example               # Backend environment template
│   ├── alembic/                   # Database migration versions
│   │   ├── env.py
│   │   └── versions/
│   │       └── 001_initial_schema.py
│   │
│   ├── app/                       # Core Application Package
│   │   ├── main.py                # FastAPI initialization, CORS, middleware, routers
│   │   ├── core/                  # Core settings and database engine
│   │   │   ├── config.py          # Pydantic v2 settings (env parsing, upload limits)
│   │   │   └── database.py        # SQLAlchemy sessionmaker, MySQL engine, DB init
│   │   ├── models/                # SQLAlchemy ORM Models
│   │   │   ├── file.py            # FileRecord & ProcessingJob models
│   │   │   ├── feature.py         # Feature vector entity model
│   │   │   ├── measurement.py     # Measurement results & CRS metadata model
│   │   │   └── project.py         # Project management workspace model
│   │   ├── schemas/               # Pydantic Request/Response Schemas
│   │   │   ├── file.py            # File upload & summary schemas
│   │   │   ├── feature.py         # Feature & GeoJSON schemas
│   │   │   ├── measurement.py     # Measurement response schemas
│   │   │   ├── project.py         # Project CRUD schemas
│   │   │   └── analytics.py       # Aggregated spatial statistics schemas
│   │   ├── geospatial/            # Geospatial Computation Engine
│   │   │   ├── crs_service.py     # Centroid detection & UTM zone projection
│   │   │   ├── measurement_service.py # Planar area & polyline distance calculator
│   │   │   ├── kml_parser.py      # Secure XML/KML placemark & geometry parser
│   │   │   ├── shapefile_parser.py # Binary ESRI shapefile reader (.shp/.dbf)
│   │   │   └── geojson_service.py # GeoJSON FeatureCollection serializer
│   │   ├── services/              # Business Logic Services
│   │   │   ├── file_service.py    # File storage, validation, delete cascades
│   │   │   ├── processing_service.py # End-to-end extraction and measurement pipeline
│   │   │   ├── analytics_service.py # Global spatial analytics aggregation
│   │   │   └── report_service.py  # CSV & JSON export generation
│   │   └── api/                   # REST API Route Handlers
│   │       └── routes/
│   │           ├── health.py      # Health & DB connectivity probe
│   │           ├── files.py       # Core upload, status, measurements, features
│   │           ├── projects.py    # Project grouping endpoints
│   │           ├── analytics.py   # System-wide metric summaries
│   │           └── reports.py     # Export endpoints
│   │
│   └── tests/                     # Automated Test Suite (18 Test Cases)
│       ├── conftest.py            # Pytest fixtures & isolated SQLite test DB
│       ├── test_health.py         # Health probe tests
│       ├── test_api.py            # Core file upload & project CRUD tests
│       ├── test_crs_service.py    # UTM projection & coordinate transformation tests
│       ├── test_measurements.py   # Polygon area, LineString length, Point handling
│       ├── test_parsers.py        # KML and Shapefile binary parser tests
│       └── test_security.py       # XXE, Zip Slip, CSV injection, path disclosure
│
├── frontend/                      # React 19 Frontend Application
│   ├── package.json               # Node dependencies and scripts
│   ├── vite.config.ts             # Vite configuration with proxy rules
│   ├── tsconfig.json              # TypeScript compilation rules
│   ├── tailwind.config.js         # Tailwind CSS styling tokens
│   ├── src/
│   │   ├── main.tsx               # React application entrypoint
│   │   ├── App.tsx                # Main application component & tab routing
│   │   ├── api/
│   │   │   └── client.ts          # Axios client with dynamic environment base URLs
│   │   ├── components/            # UI Components
│   │   │   ├── FileUpload.tsx     # Drag-and-drop file upload with validation
│   │   │   ├── ProcessingStatus.tsx # Real-time job progress indicator
│   │   │   ├── FileList.tsx       # Datatable of uploaded files & actions
│   │   │   ├── FeatureTable.tsx   # Paginated feature list with measurements
│   │   │   ├── MapView.tsx        # Leaflet interactive map with layer toggles
│   │   │   ├── StatisticsCard.tsx # Metric cards (total area, length, features)
│   │   │   ├── ProjectModal.tsx   # Project workspace creation modal
│   │   │   └── Navbar.tsx         # Header navigation and system health badge
│   │   └── types/
│   │       └── index.ts           # TypeScript interfaces and data models
│   └── public/                    # Static public assets
│
└── input files/                   # Real-World Geospatial Validation Datasets
    ├── Chennai_Metro_Corridor.kml          # Urban transit corridor (LineStrings)
    ├── Bangalore_Tech_Park.kml             # IT park land parcels (Polygons)
    ├── Mumbai_Coastal_Road.kml             # Highway coastal alignment (LineStrings)
    ├── Hyderabad_HITEC_City_Zoning.zip     # Commercial zoning Shapefile (Polygons)
    ├── Delhi_Aerocity_Infrastructure.zip   # Aviation hub parcels (Polygons & Lines)
    └── Dubai_Marina_Development.zip        # Waterfront towers & canals (Polygons)
```

---

## 6. Local Installation & Quickstart

### Prerequisites
- **Python 3.10+** (Tested on Python 3.12)
- **Node.js 18+** & **npm 9+**
- **XAMPP** (or standalone MySQL 8.0+)
- **Git**

---

### Step 1: Start MySQL Database via XAMPP
1. Launch the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL** (Default port `3306`).
3. Open your browser to `http://localhost/phpmyadmin`.
4. Create a new database named `terraflow` with collation `utf8mb4_unicode_ci` (or allow the backend to auto-create it on first run).

---

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate a Python virtual environment
python -m venv venv

# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Create your local .env configuration from the template
cp .env.example .env

# Run database migrations (or let FastAPI auto-generate tables on startup)
alembic upgrade head

# Start the FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be live at:
- **API Base**: `http://localhost:8000`
- **Swagger Interactive API Docs**: `http://localhost:8000/docs`
- **ReDoc Interactive Documentation**: `http://localhost:8000/redoc`
- **Health Endpoint**: `http://localhost:8000/api/health`

---

### Step 3: Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

Frontend will be live at:
- **Web Application**: `http://localhost:5173`

---

## 7. Database Architecture (MySQL & phpMyAdmin)

TerraFlow strictly utilizes a relational **MySQL** schema. The database is organized into 5 primary tables:

```
+-------------------------------------------------------------------------------+
|                                 projects                                      |
|  - id (VARCHAR(36) PK)                                                        |
|  - name (VARCHAR(255))                                                        |
|  - description (TEXT)                                                         |
|  - created_at, updated_at (DATETIME)                                          |
+---------------------------------------+---------------------------------------+
                                        | 1:N
                                        v
+-------------------------------------------------------------------------------+
|                                  files                                        |
|  - id (VARCHAR(36) PK)                                                        |
|  - project_id (VARCHAR(36) FK -> projects.id)                                 |
|  - original_filename (VARCHAR(255))                                           |
|  - stored_filename (VARCHAR(255))                                             |
|  - file_type (ENUM: 'KML', 'SHAPEFILE_ZIP')                                   |
|  - file_size (INT)                                                            |
|  - status (ENUM: 'UPLOADED', 'PROCESSING', 'COMPLETED', 'PARTIAL_SUCCESS')    |
|  - feature_count (INT)                                                        |
|  - bounding_box (JSON)                                                        |
|  - crs_detected (VARCHAR(100))                                                |
|  - created_at, updated_at (DATETIME)                                          |
+-------------------+---------------------------------------+-------------------+
                    | 1:1                                   | 1:N
                    v                                       v
+---------------------------------------+   +-----------------------------------+
|            processing_jobs            |   |             features              |
|  - id (VARCHAR(36) PK)                |   |  - id (VARCHAR(36) PK)            |
|  - file_id (VARCHAR(36) FK)           |   |  - file_id (VARCHAR(36) FK)       |
|  - status (ENUM)                      |   |  - feature_index (INT)            |
|  - total_features (INT)               |   |  - geometry_type (VARCHAR(50))    |
|  - successful_features (INT)          |   |  - geometry_data (JSON/WKT)       |
|  - failed_features (INT)              |   |  - properties (JSON)              |
|  - error_log (JSON)                   |   |  - source_crs (VARCHAR(100))      |
|  - started_at, completed_at (DATETIME)|   |  - processing_status (ENUM)       |
+---------------------------------------+   +-----------------+-----------------+
                                                              | 1:1
                                                              v
                                            +-----------------------------------+
                                            |           measurements            |
                                            |  - id (VARCHAR(36) PK)            |
                                            |  - feature_id (VARCHAR(36) FK)    |
                                            |  - measurement_type (VARCHAR(50)) |
                                            |  - measurement_value (FLOAT)      |
                                            |  - measurement_unit (VARCHAR(20)) |
                                            |  - calculation_crs (VARCHAR(100)) |
                                            |  - created_at (DATETIME)          |
                                            +-----------------------------------+
```

### Inspecting via phpMyAdmin
1. Open `http://localhost/phpmyadmin` in your browser.
2. Select the `terraflow` database in the left sidebar.
3. Browse `files`, `features`, `measurements`, and `processing_jobs` to view live records populated during uploads.

---

## 8. Environment Variables

TerraFlow uses explicit, typed configuration via Pydantic Settings.

| Variable | Scope | Default / Local Example | Production (Vercel) Description |
| :--- | :--- | :--- | :--- |
| `DB_HOST` | Backend | `localhost` | Hostname of remote cloud MySQL (e.g., `aws.connect.psdb.cloud`) |
| `DB_PORT` | Backend | `3306` | MySQL port (typically `3306` or `4000` for TiDB) |
| `DB_USER` | Backend | `root` | Database username |
| `DB_PASSWORD` | Backend | `""` (empty for default XAMPP) | Database password (Set via Vercel Secret) |
| `DB_NAME` | Backend | `terraflow` | Database schema name |
| `CORS_ORIGINS` | Backend | `http://localhost:5173,http://localhost:3000` | Allowed origins (e.g., `https://terraflow-app.vercel.app`) |
| `UPLOAD_DIR` | Backend | `uploads` | Ephemeral directory for uploaded files during processing |
| `MAX_UPLOAD_SIZE_MB`| Backend | `50` | Maximum file upload ceiling (Megabytes) |
| `VITE_API_URL` | Frontend | `http://localhost:8000/api/v1` | URL endpoint for frontend API requests |
| `VITE_API_BASE_URL` | Frontend | `http://localhost:8000/api/v1` | Fallback alias for API client |

> **Security Note**: Never commit `.env` files containing real production credentials to GitHub. Always use Vercel's Environment Variables dashboard for production secrets.

---

## 9. REST API Documentation & curl Examples

The backend mounts all routes under both `/api` and `/api/v1` for maximum client compatibility.

### 1. File Ingestion
- **Method**: `POST`
- **Endpoint**: `/api/files/` (or `/api/v1/files/`)
- **Content-Type**: `multipart/form-data`
- **Parameters**: `file` (File binary, `.kml` or `.zip`), `project_id` (Optional string)

**Example curl Request:**
```bash
curl -X POST "http://localhost:8000/api/files/" \
  -H "accept: application/json" \
  -F "file=@\"input files/Bangalore_Tech_Park.kml\""
```

**Response (200 OK):**
```json
{
  "file_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "job_id": "a4e12345-6789-4abc-def0-123456789abc",
  "original_filename": "Bangalore_Tech_Park.kml",
  "file_type": "KML",
  "file_size": 1845,
  "status": "UPLOADED",
  "message": "File uploaded successfully. Processing started in background."
}
```

---

### 2. Get File Processing Details
- **Method**: `GET`
- **Endpoint**: `/api/files/{id}/`

**Example curl Request:**
```bash
curl -X GET "http://localhost:8000/api/files/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/" \
  -H "accept: application/json"
```

**Response (200 OK):**
```json
{
  "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "original_filename": "Bangalore_Tech_Park.kml",
  "file_type": "KML",
  "file_size": 1845,
  "status": "COMPLETED",
  "feature_count": 3,
  "bounding_box": {
    "min_lon": 77.6881,
    "min_lat": 12.9234,
    "max_lon": 77.6965,
    "max_lat": 12.9312
  },
  "crs_detected": "EPSG:4326",
  "created_at": "2026-10-07T18:30:00Z"
}
```

---

### 3. Get Calculated Measurements
- **Method**: `GET`
- **Endpoint**: `/api/files/{id}/measurements/`

**Example curl Request:**
```bash
curl -X GET "http://localhost:8000/api/files/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/measurements/" \
  -H "accept: application/json"
```

**Response (200 OK):**
```json
[
  {
    "id": "meas-001",
    "feature_id": "feat-001",
    "measurement_type": "AREA",
    "measurement_value": 43521.84,
    "measurement_unit": "sq_meters",
    "calculation_crs": "EPSG:32643 (UTM Zone 43N)",
    "formatted_value": "43,521.84 sq_meters",
    "created_at": "2026-10-07T18:30:01Z"
  },
  {
    "id": "meas-002",
    "feature_id": "feat-002",
    "measurement_type": "AREA",
    "measurement_value": 28914.50,
    "measurement_unit": "sq_meters",
    "calculation_crs": "EPSG:32643 (UTM Zone 43N)",
    "formatted_value": "28,914.50 sq_meters",
    "created_at": "2026-10-07T18:30:01Z"
  }
]
```

---

### 4. Supporting API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/files/` | List all uploaded files with status & metadata |
| `GET` | `/api/files/{id}/features/` | Paginated features with geometry, properties, and status |
| `GET` | `/api/files/{id}/statistics/` | Aggregated metrics (total area, total length, geometry counts) |
| `GET` | `/api/files/{id}/geojson/` | RFC 7946 GeoJSON FeatureCollection with embedded metrics |
| `DELETE` | `/api/files/{id}/` | Delete file and cascade delete all features and measurements |
| `GET` | `/api/health/` | Health check probe returning database connectivity status |
| `GET` | `/api/analytics/` | System-wide spatial aggregation summary |
| `GET` | `/api/reports/csv/{id}` | Export measurements as sanitized CSV |
| `GET` | `/api/reports/json/{id}` | Export full structured analysis as JSON |

---

## 10. End-to-End File Processing Flow

```
[User Uploads .kml or .zip via UI / API]
                     │
                     ▼
[1. Pre-Flight File Validation]
 ├─ Enforce size limit (MAX_UPLOAD_SIZE_MB = 50MB)
 ├─ Verify MIME type & extension (.kml / .zip)
 └─ Generate cryptographically random UUID filename
                     │
                     ▼
[2. Database Record Creation]
 ├─ Insert FileRecord (status: 'UPLOADED')
 └─ Insert ProcessingJob (status: 'PENDING')
                     │
                     ▼
[3. Async Background Processing Dispatched]
                     │
                     ▼
[4. File Parsing & Feature Extraction]
 ├─ KML: Parse placemarks, extract coordinates & metadata (XXE-protected)
 └─ Shapefile: Extract .shp/.dbf into memory (ZipSlip-protected)
                     │
                     ▼
[5. Geometry & CRS Detection]
 ├─ Detect source CRS (Default: EPSG:4326 for KML, .prj for Shapefile)
 └─ Compute geometric bounding box & spatial centroid
                     │
                     ▼
[6. Projected CRS Resolution]
 ├─ Determine optimal UTM Zone based on Centroid Longitude: zone = int((lon + 180)/6) + 1
 └─ Resolve EPSG Code (32601-32660 for North, 32701-32760 for South)
                     │
                     ▼
[7. Planar Coordinate Transformation & Measurement]
 ├─ Polygon / MultiPolygon  ──► Reproject vertices to UTM ──► Compute Planar Shoelace Area (m²)
 ├─ LineString / MultiLine  ──► Reproject vertices to UTM ──► Compute Euclidean Segment Length (m)
 ├─ Point / MultiPoint      ──► Store coordinates ────────► Mark NO_MEASUREMENT_REQUIRED
 └─ Unsupported Geometry    ──► Log error ────────────────► Mark UNSUPPORTED
                     │
                     ▼
[8. Database Transaction Persistence]
 ├─ Insert all Feature records with attributes
 ├─ Insert all Measurement records linked to features
 └─ Update FileRecord (status: 'COMPLETED' or 'PARTIAL_SUCCESS')
```

---

## 11. Geometric Measurement Flow

| Geometry Type | Measurement Executed | Formula / Method | Units Stored & Formatted |
| :--- | :--- | :--- | :--- |
| **Polygon** | 2D Planar Area | Shoelace Formula on projected UTM metric coordinates: $$A = \frac{1}{2} \left\| \sum_{i=0}^{n-1} (x_i y_{i+1} - x_{i+1} y_i) \right\|$$ | Square Meters ($m^2$), Hectares ($ha$) |
| **MultiPolygon** | Aggregated Planar Area | Sum of exterior ring areas minus interior holes for each component polygon | Square Meters ($m^2$), Hectares ($ha$) |
| **LineString** | Cumulative Planar Length | Euclidean distance between successive projected metric vertices: $$L = \sum_{i=0}^{n-2} \sqrt{(x_{i+1} - x_i)^2 + (y_{i+1} - y_i)^2}$$ | Meters ($m$), Kilometers ($km$) |
| **MultiLineString**| Aggregated Length | Sum of lengths across all polyline segments | Meters ($m$), Kilometers ($km$) |
| **Point / MultiPoint** | Zero-Dimensional | Coordinate storage; no metric calculation required | `NO_MEASUREMENT_REQUIRED` |
| **GeometryCollection** | Recursive Extraction | Decomposed into sub-geometries and evaluated individually | Varies by component |

---

## 12. Coordinate Reference System (CRS) Transformation Strategy

### Why Raw Geographic Coordinates (EPSG:4326) Cannot Be Used
Coordinates in **WGS 84 (EPSG:4326)** represent angular positions on an ellipsoid measured in degrees of latitude and longitude. 
- At the equator, 1 degree of longitude is approximately $111.32\text{ km}$.
- At 60 degrees latitude (e.g., Oslo/Stockholm), 1 degree of longitude is only approximately $55.8\text{ km}$.
- Direct Euclidean area calculation $(\Delta\text{lat} \times \Delta\text{lon})$ produces meaningless degree-squared ($\text{deg}^2$) values with massive spatial distortion.

### TerraFlow's UTM Selection Strategy
TerraFlow automatically determines the exact **Universal Transverse Mercator (UTM)** projection zone for each dataset:

1. **Centroid Calculation**: Compute the mean geographic center $(\bar{\lambda}, \bar{\phi})$ across all valid coordinates in the dataset:
   $$\bar{\lambda} = \frac{1}{N} \sum_{k=1}^{N} \text{lon}_k, \quad \bar{\phi} = \frac{1}{N} \sum_{k=1}^{N} \text{lat}_k$$

2. **UTM Zone Identification**:
   $$\text{Zone} = \left\lfloor \frac{\bar{\lambda} + 180}{6} \right\rfloor + 1 \quad (1 \le \text{Zone} \le 60)$$

3. **EPSG Code Resolution**:
   $$\text{EPSG Code} = \begin{cases} 32600 + \text{Zone} & \text{if } \bar{\phi} \ge 0 \text{ (Northern Hemisphere)} \\ 32700 + \text{Zone} & \text{if } \bar{\phi} < 0 \text{ (Southern Hemisphere)} \end{cases}$$

4. **Coordinate Transformation**: Coordinates are transformed from ellipsoidal angles $(\lambda, \phi)$ to conformal planar Cartesian meters $(E, N)$ using PyProj / transverse Mercator series expansions before computing area or distance.

---

## 13. Partial Success & Resilient Error Handling

In real-world GIS pipelines, vector files often contain malformed individual geometries (e.g., self-intersecting polygon boundaries or unclosed rings) alongside thousands of valid features. 

TerraFlow implements a **Resilient Batch Strategy**:
- A single corrupt feature does **not** abort the entire file ingestion.
- Valid features are processed, projected, measured, and committed to the database.
- Failed features are marked with `processing_status = 'FAILED'`, and the error reason is recorded.
- Unsupported geometry types are marked with `processing_status = 'UNSUPPORTED'`.
- If a dataset has both successful and failed features, the file status is marked as **`PARTIAL_SUCCESS`**.
- If all features fail, the file status is marked as **`FAILED`**.
- If all features succeed, the file status is marked as **`COMPLETED`**.

---

## 14. Defensive Cybersecurity Implementation

| Vulnerability Vector | Threat Scenario | TerraFlow Defensive Control |
| :--- | :--- | :--- |
| **XXE (XML External Entity)** | Malicious KML loading `<!ENTITY xxe SYSTEM "file:///etc/passwd">` | Disabled external entity resolving and DTD expansion in XML parser. |
| **Zip Slip Directory Traversal** | Malicious ZIP containing `../../app/main.py` to overwrite system files | Path resolution audit enforcing extracted files remain strictly inside isolated temporary directories. |
| **Zip Bomb Denial of Service** | Compressed ZIP decompressing into hundreds of gigabytes | Enforced extraction size ceilings and maximum decompressed file count limits. |
| **CSV Formula Injection** | Attributes containing `=cmd|' /C calc'!A0` executing code when opened in Excel | Automated sanitization prepending a single quote (`'`) to fields starting with `=`, `+`, `-`, or `@`. |
| **Path Disclosure** | Detailed server stack traces leaking absolute server paths | Sanitized custom error handlers returning clean, structured error codes. |
| **CORS Abuse** | Unauthorized browser domains accessing sensitive APIs | Strict, environment-driven CORS configuration allowing only authorized frontend origins. |
| **HTTP Clickjacking & Sniffing**| Embedding in malicious iframes or MIME-sniffing | Enforced `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff`. |

---

## 15. Automated Testing Suite

TerraFlow includes an automated Pytest test suite covering all core requirements.

```bash
# Run tests inside backend directory
cd backend
pytest -v
```

### Test Coverage Highlights:
- `test_project_crud`: Project workspace creation, retrieval, and cascading file associations.
- `test_kml_upload_and_features`: Multipart KML upload, asynchronous parsing, and feature extraction.
- `test_invalid_file_upload`: Rejection of unsupported extensions and corrupt files.
- `test_utm_zone_determination`: Centroid calculation and correct EPSG UTM zone derivation.
- `test_utm_coordinate_projection`: High-precision coordinate transformation validation.
- `test_polygon_area_calculation`: Verification of planar Shoelace formula against benchmark polygons.
- `test_linestring_length_calculation`: Polyline distance calculation against known spatial benchmarks.
- `test_point_handling`: Validation that points are stored without measurement errors.
- `test_parsers`: Direct validation of KML and binary Shapefile parsers.
- `test_security_headers`: Verification of HTTP security headers.
- `test_xxe_kml_rejection`: Verification that malicious XML entities are safely rejected.
- `test_zip_slip_rejection`: Verification that Zip Slip path traversal attempts are blocked.
- `test_csv_injection_sanitization`: Verification that formula injection triggers are sanitized in exports.
- `test_internal_path_not_disclosed`: Verification that server paths are never exposed in error responses.

---

## 16. Key Design Decisions

1. **FastAPI over Django/Flask**: High asynchronous I/O performance for concurrent file processing, built-in OpenAPI documentation (`/docs`), and native Pydantic v2 data validation.
2. **MySQL Relational Schema over Document Stores**: Spatial features have strict relational dependencies (Project $\rightarrow$ File $\rightarrow$ Feature $\rightarrow$ Measurement). Relational integrity guarantees consistency across cascading deletions.
3. **Pure Python Fallback Spatial Engine alongside GeoPandas**: Ensures lightweight, deterministic UTM math and zero-dependency execution in resource-constrained serverless runtimes.
4. **Decoupled React 19 Frontend**: Independent deployment, client-side Leaflet vector rendering, responsive layout, and zero SSR latency.
5. **RFC 7946 GeoJSON Standard**: Native browser-compatible format allowing direct, zero-overhead visualization on Leaflet maps.

---

## 17. Current Platform Limitations

- **Upload Size Ceiling**: Maximum file size is currently configured to 50MB (standard for serverless HTTP payloads).
- **Multi-Zone Crossings**: Extremely large vector lines spanning multiple continental UTM zones (e.g., transcontinental pipelines) are projected to their centroid's primary UTM zone.
- **Serverless File Persistence**: In serverless cloud deployments (like Vercel), uploaded source raw files are ephemeral. Metadata, features, and measurements persist permanently in MySQL.

---

## 18. Engineering Learnings & Takeaways

- **Geodetic vs. Planar Geometry**: Learned the critical importance of spatial reference systems; calculations in EPSG:4326 produce incorrect values without proper metric projection.
- **Defensive Ingestion Architecture**: Real-world vector files from GIS tools contain inconsistencies, self-intersections, and security risks (XXE, Zip Slip) requiring robust parsing defenses.
- **Full-Stack Spatial Integration**: Combining FastAPI, SQLAlchemy, GeoJSON, and Leaflet creates a smooth developer and user experience for GIS workflows.

---

## 19. Future Roadmap & Scope

- **Distributed Task Queues**: Integration with Celery / Redis for processing multi-gigabyte LiDAR and raster files.
- **Cloud Object Storage**: Direct S3 / Cloudflare R2 bucket integration for persistent source file archival.
- **Advanced Spatial Analytics**: Buffer generation, spatial polygon intersection, and Voronoi diagram generation.
- **User Authentication & RBAC**: JWT-based user authentication and multi-tenant organization workspaces.
- **PostGIS Spatial Indexing**: Optional PostGIS support for spatial SQL queries.

---

## 20. Deployment Guide (Vercel & Production MySQL)

### Production Architecture
TerraFlow deploys seamlessly to **Vercel** with the React frontend and FastAPI serverless backend unified under a single project domain.

```
TERRAFLOW (Vercel Project)
├── / (Root) ──────────► React 19 Vite Static Frontend
├── /api/* ────────────► FastAPI Serverless Python Function (api/index.py)
├── /docs ─────────────► Interactive Swagger UI
└── Database ──────────► Remote MySQL (TiDB / PlanetScale / AWS RDS)
```

### Deployment Steps:

1. **Provision a Remote MySQL Database**:
   - Create a MySQL-compatible database instance using TiDB Cloud, PlanetScale, Aiven, or AWS RDS.
   - Obtain your remote `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.

2. **Configure Vercel Project**:
   - Push your code to your GitHub repository.
   - Import the repository into your Vercel Dashboard.
   - Configure Environment Variables in the Vercel Project Settings:
     ```env
     DB_HOST=<your-cloud-db-host>
     DB_PORT=3306
     DB_USER=<your-db-user>
     DB_PASSWORD=<your-db-password>
     DB_NAME=terraflow
     CORS_ORIGINS=*
     ```

3. **Deploy**:
   - Vercel automatically builds the Vite frontend (`npm run build`) and mounts Python serverless API functions via `api/index.py` based on `vercel.json`.

### Production Links
- **GitHub Repository**: [https://github.com/Shameem1105/Geospatial](https://github.com/Shameem1105/Geospatial)
- **Deployment Platform**: Vercel Serverless (Vite Frontend + Python FastAPI Backend)
- **Database Engine**: Relational MySQL / Cloud MySQL
- **Documentation**: `/docs` (Swagger UI) & `/redoc` (ReDoc)

---

## License

This project is developed and released under the **MIT License**.
