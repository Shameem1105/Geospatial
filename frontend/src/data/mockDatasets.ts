import type { FileRecord, FileStatistics } from '../types';

export interface DatasetItem {
  file: FileRecord;
  stats: FileStatistics;
  geojson: any;
}

export const FALLBACK_DATASETS: DatasetItem[] = [
  {
    file: {
      id: 'bangalore-tech-park-01',
      original_filename: 'Bangalore_Tech_Park.kml',
      stored_filename: 'Bangalore_Tech_Park.kml',
      file_type: 'kml',
      file_size: 1845,
      status: 'COMPLETED',
      feature_count: 3,
      detected_crs: 'EPSG:4326',
      created_at: '2026-10-08T09:00:00Z',
      updated_at: '2026-10-08T09:00:05Z',
    },
    stats: {
      file_id: 'bangalore-tech-park-01',
      filename: 'Bangalore_Tech_Park.kml',
      file_type: 'kml',
      total_features: 3,
      polygon_count: 3,
      linestring_count: 0,
      point_count: 0,
      other_count: 0,
      successful_features: 3,
      failed_features: 0,
      unsupported_features: 0,
      total_area_sqm: 72436.34,
      total_area_sqkm: 0.0724,
      total_area_acres: 17.899,
      total_length_m: 0,
      total_length_km: 0,
      detected_crs: 'EPSG:4326',
      calculation_crs: 'EPSG:32643 (UTM Zone 43N - Planar Metric)',
    },
    geojson: {
      type: 'FeatureCollection',
      name: 'Bangalore Tech Park',
      features: [
        {
          type: 'Feature',
          id: 'b-01',
          properties: { name: 'Tower Alpha Innovation Hub', ZONE_ID: 'BLR-TP-01', LAND_USE: 'Commercial IT', measurement_type: 'AREA', measurement_value: 34210.5, measurement_unit: 'm²' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[77.6850, 12.9260], [77.6885, 12.9255], [77.6890, 12.9285], [77.6855, 12.9290], [77.6850, 12.9260]]]
          }
        },
        {
          type: 'Feature',
          id: 'b-02',
          properties: { name: 'Tower Beta Engineering Plaza', ZONE_ID: 'BLR-TP-02', LAND_USE: 'Commercial IT', measurement_type: 'AREA', measurement_value: 26820.0, measurement_unit: 'm²' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[77.6895, 12.9250], [77.6930, 12.9245], [77.6935, 12.9275], [77.6900, 12.9280], [77.6895, 12.9250]]]
          }
        },
        {
          type: 'Feature',
          id: 'b-03',
          properties: { name: 'Central Utility & Green Space', ZONE_ID: 'BLR-TP-03', LAND_USE: 'Civic Amenity', measurement_type: 'AREA', measurement_value: 11405.84, measurement_unit: 'm²' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[77.6860, 12.9295], [77.6920, 12.9290], [77.6925, 12.9310], [77.6865, 12.9315], [77.6860, 12.9295]]]
          }
        }
      ]
    }
  },
  {
    file: {
      id: 'chennai-metro-corridor-02',
      original_filename: 'Chennai_Metro_Corridor.kml',
      stored_filename: 'Chennai_Metro_Corridor.kml',
      file_type: 'kml',
      file_size: 3196,
      status: 'COMPLETED',
      feature_count: 5,
      detected_crs: 'EPSG:4326',
      created_at: '2026-10-08T09:15:00Z',
      updated_at: '2026-10-08T09:15:05Z',
    },
    stats: {
      file_id: 'chennai-metro-corridor-02',
      filename: 'Chennai_Metro_Corridor.kml',
      file_type: 'kml',
      total_features: 5,
      polygon_count: 2,
      linestring_count: 1,
      point_count: 2,
      other_count: 0,
      successful_features: 5,
      failed_features: 0,
      unsupported_features: 0,
      total_area_sqm: 764407.89,
      total_area_sqkm: 0.7644,
      total_area_acres: 188.889,
      total_length_m: 6132.7,
      total_length_km: 6.13,
      detected_crs: 'EPSG:4326',
      calculation_crs: 'EPSG:32644 (UTM Zone 44N - Planar Metric)',
    },
    geojson: {
      type: 'FeatureCollection',
      name: 'Chennai Metro Corridor',
      features: [
        {
          type: 'Feature',
          id: 'c-01',
          properties: { name: 'Chennai Metro Phase 2 Alignment', LINE_ID: 'CHN-METRO-LINE', measurement_type: 'LENGTH', measurement_value: 6132.7, measurement_unit: 'm' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [80.2725, 13.0810],
              [80.2610, 13.0720],
              [80.2450, 13.0610],
              [80.2280, 13.0480],
              [80.2150, 13.0290],
              [80.2010, 13.0110]
            ]
          }
        },
        {
          type: 'Feature',
          id: 'c-02',
          properties: { name: 'Koyambedu Maintenance & Depot Yard', ZONE_ID: 'CHN-METRO-02', LAND_USE: 'Depot & Workshop', measurement_type: 'AREA', measurement_value: 482100.5, measurement_unit: 'm²' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[80.1880, 13.0690], [80.1960, 13.0680], [80.1995, 13.0730], [80.1970, 13.0780], [80.1895, 13.0770], [80.1865, 13.0725], [80.1880, 13.0690]]]
          }
        },
        {
          type: 'Feature',
          id: 'c-03',
          properties: { name: 'Chennai Central Metro Interchange Hub', ZONE_ID: 'CHN-METRO-01', LAND_USE: 'Transport Plaza', measurement_type: 'AREA', measurement_value: 282307.39, measurement_unit: 'm²' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[80.2725, 13.0810], [80.2770, 13.0795], [80.2805, 13.0835], [80.2780, 13.0865], [80.2735, 13.0855], [80.2710, 13.0830], [80.2725, 13.0810]]]
          }
        },
        {
          type: 'Feature',
          id: 'c-04',
          properties: { name: 'Nandanam Metro Station Junction', STATION_ID: 'CHN-STN-03' },
          geometry: { type: 'Point', coordinates: [80.2450, 13.0610] }
        },
        {
          type: 'Feature',
          id: 'c-05',
          properties: { name: 'Saidapet Metro Station Terminal', STATION_ID: 'CHN-STN-04' },
          geometry: { type: 'Point', coordinates: [80.2150, 13.0290] }
        }
      ]
    }
  },
  {
    file: {
      id: 'mumbai-coastal-road-03',
      original_filename: 'Mumbai_Coastal_Road.kml',
      stored_filename: 'Mumbai_Coastal_Road.kml',
      file_type: 'kml',
      file_size: 1485,
      status: 'COMPLETED',
      feature_count: 4,
      detected_crs: 'EPSG:4326',
      created_at: '2026-10-08T09:30:00Z',
      updated_at: '2026-10-08T09:30:05Z',
    },
    stats: {
      file_id: 'mumbai-coastal-road-03',
      filename: 'Mumbai_Coastal_Road.kml',
      file_type: 'kml',
      total_features: 4,
      polygon_count: 0,
      linestring_count: 4,
      point_count: 0,
      other_count: 0,
      successful_features: 4,
      failed_features: 0,
      unsupported_features: 0,
      total_area_sqm: 0,
      total_area_sqkm: 0,
      total_area_acres: 0,
      total_length_m: 29200.0,
      total_length_km: 29.2,
      detected_crs: 'EPSG:4326',
      calculation_crs: 'EPSG:32643 (UTM Zone 43N - Planar Metric)',
    },
    geojson: {
      type: 'FeatureCollection',
      name: 'Mumbai Coastal Road',
      features: [
        {
          type: 'Feature',
          id: 'm-01',
          properties: { name: 'Princess Street Flyover to Priyadarshini Park', ALIGNMENT: 'Sector 1', measurement_type: 'LENGTH', measurement_value: 8400.0, measurement_unit: 'm' },
          geometry: {
            type: 'LineString',
            coordinates: [[72.8120, 18.9480], [72.8080, 18.9610], [72.8040, 18.9750], [72.7980, 18.9890]]
          }
        },
        {
          type: 'Feature',
          id: 'm-02',
          properties: { name: 'Twin Undersea Tunnel Section', ALIGNMENT: 'Sector 2 (Subsea)', measurement_type: 'LENGTH', measurement_value: 6200.0, measurement_unit: 'm' },
          geometry: {
            type: 'LineString',
            coordinates: [[72.7980, 18.9890], [72.7930, 19.0020], [72.7890, 19.0150]]
          }
        },
        {
          type: 'Feature',
          id: 'm-03',
          properties: { name: 'Haji Ali Interchange & Reclamation', ALIGNMENT: 'Sector 3', measurement_type: 'LENGTH', measurement_value: 7800.0, measurement_unit: 'm' },
          geometry: {
            type: 'LineString',
            coordinates: [[72.7890, 19.0150], [72.8010, 19.0280], [72.8150, 19.0390]]
          }
        },
        {
          type: 'Feature',
          id: 'm-04',
          properties: { name: 'Worli to Bandra-Worli Sea Link Connector', ALIGNMENT: 'Sector 4', measurement_type: 'LENGTH', measurement_value: 6800.0, measurement_unit: 'm' },
          geometry: {
            type: 'LineString',
            coordinates: [[72.8150, 19.0390], [72.8250, 19.0490], [72.8350, 19.0580]]
          }
        }
      ]
    }
  },
  {
    file: {
      id: 'hyderabad-hitec-city-04',
      original_filename: 'Hyderabad_HITEC_City_Zoning.zip',
      stored_filename: 'Hyderabad_HITEC_City_Zoning.zip',
      file_type: 'shapefile_zip',
      file_size: 1007,
      status: 'COMPLETED',
      feature_count: 4,
      detected_crs: 'EPSG:4326',
      created_at: '2026-10-08T09:45:00Z',
      updated_at: '2026-10-08T09:45:05Z',
    },
    stats: {
      file_id: 'hyderabad-hitec-city-04',
      filename: 'Hyderabad_HITEC_City_Zoning.zip',
      file_type: 'shapefile_zip',
      total_features: 4,
      polygon_count: 4,
      linestring_count: 0,
      point_count: 0,
      other_count: 0,
      successful_features: 4,
      failed_features: 0,
      unsupported_features: 0,
      total_area_sqm: 165000.0,
      total_area_sqkm: 0.165,
      total_area_acres: 40.772,
      total_length_m: 0,
      total_length_km: 0,
      detected_crs: 'EPSG:4326',
      calculation_crs: 'EPSG:32644 (UTM Zone 44N - Planar Metric)',
    },
    geojson: {
      type: 'FeatureCollection',
      name: 'Hyderabad HITEC City Zoning',
      features: [
        {
          type: 'Feature',
          id: 'h-01',
          properties: { name: 'Cyber Towers SEZ Sector 1', ZONE: 'IT-SEZ', measurement_type: 'AREA', measurement_value: 52000.0, measurement_unit: 'm²' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[78.3740, 17.4480], [78.3810, 17.4475], [78.3815, 17.4520], [78.3745, 17.4525], [78.3740, 17.4480]]]
          }
        },
        {
          type: 'Feature',
          id: 'h-02',
          properties: { name: 'Knowledge City Commercial Hub', ZONE: 'Commercial', measurement_type: 'AREA', measurement_value: 48000.0, measurement_unit: 'm²' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[78.3820, 17.4470], [78.3890, 17.4465], [78.3895, 17.4510], [78.3825, 17.4515], [78.3820, 17.4470]]]
          }
        },
        {
          type: 'Feature',
          id: 'h-03',
          properties: { name: 'Mindspace IT Park Sector 3', ZONE: 'IT-Park', measurement_type: 'AREA', measurement_value: 39000.0, measurement_unit: 'm²' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[78.3735, 17.4430], [78.3800, 17.4425], [78.3805, 17.4470], [78.3740, 17.4475], [78.3735, 17.4430]]]
          }
        },
        {
          type: 'Feature',
          id: 'h-04',
          properties: { name: 'Raheja Vistas Campus', ZONE: 'Commercial', measurement_type: 'AREA', measurement_value: 26000.0, measurement_unit: 'm²' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[78.3810, 17.4420], [78.3875, 17.4415], [78.3880, 17.4460], [78.3815, 17.4465], [78.3810, 17.4420]]]
          }
        }
      ]
    }
  },
  {
    file: {
      id: 'delhi-aerocity-05',
      original_filename: 'Delhi_Aerocity_Infrastructure.zip',
      stored_filename: 'Delhi_Aerocity_Infrastructure.zip',
      file_type: 'shapefile_zip',
      file_size: 1038,
      status: 'COMPLETED',
      feature_count: 6,
      detected_crs: 'EPSG:4326',
      created_at: '2026-10-08T10:00:00Z',
      updated_at: '2026-10-08T10:00:05Z',
    },
    stats: {
      file_id: 'delhi-aerocity-05',
      filename: 'Delhi_Aerocity_Infrastructure.zip',
      file_type: 'shapefile_zip',
      total_features: 6,
      polygon_count: 4,
      linestring_count: 2,
      point_count: 0,
      other_count: 0,
      successful_features: 6,
      failed_features: 0,
      unsupported_features: 0,
      total_area_sqm: 170000.0,
      total_area_sqkm: 0.17,
      total_area_acres: 42.008,
      total_length_m: 7200.0,
      total_length_km: 7.2,
      detected_crs: 'EPSG:4326',
      calculation_crs: 'EPSG:32643 (UTM Zone 43N - Planar Metric)',
    },
    geojson: {
      type: 'FeatureCollection',
      name: 'Delhi Aerocity Infrastructure',
      features: [
        {
          type: 'Feature',
          id: 'd-01',
          properties: { name: 'Hospitality District Block A', USE: 'Hotels & Retail', measurement_type: 'AREA', measurement_value: 55000.0, measurement_unit: 'm²' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[77.1180, 28.5480], [77.1240, 28.5470], [77.1250, 28.5520], [77.1190, 28.5530], [77.1180, 28.5480]]]
          }
        },
        {
          type: 'Feature',
          id: 'd-02',
          properties: { name: 'Aerocity Spine Expressway Corridor', USE: 'Arterial Road', measurement_type: 'LENGTH', measurement_value: 4800.0, measurement_unit: 'm' },
          geometry: {
            type: 'LineString',
            coordinates: [[77.1150, 28.5440], [77.1220, 28.5500], [77.1310, 28.5560], [77.1420, 28.5630]]
          }
        },
        {
          type: 'Feature',
          id: 'd-03',
          properties: { name: 'GMR Corporate Office Complex', USE: 'Commercial Office', measurement_type: 'AREA', measurement_value: 45000.0, measurement_unit: 'm²' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[77.1260, 28.5490], [77.1320, 28.5480], [77.1330, 28.5530], [77.1270, 28.5540], [77.1260, 28.5490]]]
          }
        }
      ]
    }
  },
  {
    file: {
      id: 'dubai-marina-06',
      original_filename: 'Dubai_Marina_Development.zip',
      stored_filename: 'Dubai_Marina_Development.zip',
      file_type: 'shapefile_zip',
      file_size: 1013,
      status: 'COMPLETED',
      feature_count: 4,
      detected_crs: 'EPSG:4326',
      created_at: '2026-10-08T10:15:00Z',
      updated_at: '2026-10-08T10:15:05Z',
    },
    stats: {
      file_id: 'dubai-marina-06',
      filename: 'Dubai_Marina_Development.zip',
      file_type: 'shapefile_zip',
      total_features: 4,
      polygon_count: 3,
      linestring_count: 1,
      point_count: 0,
      other_count: 0,
      successful_features: 4,
      failed_features: 0,
      unsupported_features: 0,
      total_area_sqm: 196400.0,
      total_area_sqkm: 0.1964,
      total_area_acres: 48.531,
      total_length_m: 5100.0,
      total_length_km: 5.1,
      detected_crs: 'EPSG:4326',
      calculation_crs: 'EPSG:32640 (UTM Zone 40N - Planar Metric)',
    },
    geojson: {
      type: 'FeatureCollection',
      name: 'Dubai Marina Development',
      features: [
        {
          type: 'Feature',
          id: 'dub-01',
          properties: { name: 'Marina Canal Waterfront Promenade', PROMENADE: 'Walkway', measurement_type: 'LENGTH', measurement_value: 5100.0, measurement_unit: 'm' },
          geometry: {
            type: 'LineString',
            coordinates: [[55.1380, 25.0780], [55.1430, 25.0820], [55.1490, 25.0860], [55.1550, 25.0910]]
          }
        },
        {
          type: 'Feature',
          id: 'dub-02',
          properties: { name: 'Marina Mall & Retail Podium', LAND_USE: 'Commercial Retail', measurement_type: 'AREA', measurement_value: 86400.0, measurement_unit: 'm²' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[55.1410, 25.0760], [55.1470, 25.0750], [55.1480, 25.0800], [55.1420, 25.0810], [55.1410, 25.0760]]]
          }
        },
        {
          type: 'Feature',
          id: 'dub-03',
          properties: { name: 'Marina Towers Residential Sector', LAND_USE: 'High-Rise Residential', measurement_type: 'AREA', measurement_value: 68000.0, measurement_unit: 'm²' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[55.1485, 25.0790], [55.1540, 25.0780], [55.1550, 25.0830], [55.1495, 25.0840], [55.1485, 25.0790]]]
          }
        }
      ]
    }
  }
];
