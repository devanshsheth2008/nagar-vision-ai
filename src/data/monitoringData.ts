import type { MonitoringCamera, CameraAlert, CameraArea, CameraType, CameraStatus } from '@/types';

export const GANDHIDHAM_CENTER: [number, number] = [23.0733, 70.1306];

const areaConfig: Array<{ area: CameraArea; center: [number, number]; count: number }> = [
  { area: 'Industrial Area', center: [23.0712, 70.1356], count: 220 },
  { area: 'Commercial Area', center: [23.0733, 70.1306], count: 180 },
  { area: 'Highway and Bypass', center: [23.0654, 70.1289], count: 200 },
  { area: 'Residential Area', center: [23.0801, 70.1334], count: 150 },
  { area: 'Market Area', center: [23.0745, 70.1290], count: 120 },
  { area: 'Public Roads', center: [23.0700, 70.1320], count: 160 },
];

const cameraTypes: CameraType[] = ['Dome', 'Bullet', 'PTZ', 'Thermal', 'ANPR'];
const resolutions = ['4K', '1080p', '720p'];
const streetNames = [
  'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6',
  'Sector 7', 'Sector 8', 'Sector 8', 'Sector 10', 'Sector 11', 'Sector 12',
  'Gandhi Chowk', 'Adipur Junction', 'KPT Road', 'Highway Plot', 'Bus Stand',
  'Railway Crossing', 'Workshop Area', 'Market Road', 'Bypass Road', 'Main Road',
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seededRandom(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function jitter(base: number, amount: number): number {
  return base + (rand() - 0.5) * amount;
}

function formatTimestamp(minutesAgo: number): string {
  const d = new Date('2026-10-31T09:30:00');
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
}

export function generateCameras(): MonitoringCamera[] {
  const cameras: MonitoringCamera[] = [];
  let counter = 1;

  for (const cfg of areaConfig) {
    for (let i = 0; i < cfg.count; i++) {
      const id = `CAM-${String(counter).padStart(4, '0')}`;
      const street = pick(streetNames);
      const statusRoll = rand();
      let status: CameraStatus;
      if (statusRoll > 0.97) status = 'offline';
      else if (statusRoll > 0.94) status = 'maintenance';
      else status = 'online';

      const alertRoll = rand();
      const hasAlert = status === 'online' && alertRoll > 0.97;

      const minutesAgo = status === 'online'
        ? Math.floor(rand() * 5)
        : status === 'maintenance'
        ? Math.floor(rand() * 300) + 60
        : Math.floor(rand() * 600) + 120;

      let streamHealth: 'healthy' | 'degraded' | 'down';
      if (status === 'offline') streamHealth = 'down';
      else if (statusRoll > 0.92) streamHealth = 'degraded';
      else streamHealth = 'healthy';

      const connectionFailures = status === 'offline' ? Math.floor(rand() * 15) + 3
        : streamHealth === 'degraded' ? Math.floor(rand() * 3) + 1
        : 0;

      cameras.push({
        id,
        name: `${street} Cam ${i + 1}`,
        location: `${street}, ${cfg.area}`,
        area: cfg.area,
        lat: jitter(cfg.center[0], 0.03),
        lng: jitter(cfg.center[1], 0.03),
        status,
        type: pick(cameraTypes),
        resolution: pick(resolutions),
        lastActive: formatTimestamp(minutesAgo),
        hasAlert,
        streamHealth,
        connectionFailures,
      });
      counter++;
    }
  }

  return cameras;
}

export const monitoringCameras: MonitoringCamera[] = generateCameras();

export function getMonitoringStats() {
  const total = monitoringCameras.length;
  const online = monitoringCameras.filter(c => c.status === 'online').length;
  const offline = monitoringCameras.filter(c => c.status === 'offline').length;
  const maintenance = monitoringCameras.filter(c => c.status === 'maintenance').length;
  const alertCount = monitoringCameras.filter(c => c.hasAlert).length;
  return { total, online, offline, maintenance, alertCount };
}

export const cameraAreas: CameraArea[] = [
  'Industrial Area',
  'Commercial Area',
  'Highway and Bypass',
  'Residential Area',
  'Market Area',
  'Public Roads',
];

const alertMessages: Record<CameraAlert['type'], string[]> = {
  'illegal-dumping': [
    'Suspected illegal dumping of waste material detected',
    'Vehicle seen unloading debris at restricted location',
    'Dumping activity detected near municipal plot boundary',
  ],
  'unauthorized-halt': [
    'Vehicle stationary in restricted zone beyond permitted duration',
    'Unauthorized vehicle halt detected on service lane',
    'Commercial vehicle stopped in no-parking area',
  ],
  'garbage-accumulation': [
    'Garbage pile detected growing in size over last scan',
    'Accumulation of mixed waste detected at roadside',
    'Waste accumulation near public infrastructure',
  ],
  'camera-offline': [
    'Camera connectivity lost - no heartbeat received',
    'Camera went offline unexpectedly - requires inspection',
    'Network gateway unreachable for this camera',
  ],
};

export const cameraAlerts: CameraAlert[] = [
  {
    id: 'ALR-001',
    cameraId: 'CAM-0014',
    cameraName: 'Sector 8 Cam 15',
    type: 'illegal-dumping',
    message: alertMessages['illegal-dumping'][0],
    timestamp: formatTimestamp(12),
    confidence: 94.2,
    verified: false,
  },
  {
    id: 'ALR-002',
    cameraId: 'CAM-0007',
    cameraName: 'Highway Plot Cam 8',
    type: 'unauthorized-halt',
    message: alertMessages['unauthorized-halt'][0],
    timestamp: formatTimestamp(28),
    confidence: 88.7,
    verified: false,
  },
  {
    id: 'ALR-003',
    cameraId: 'CAM-0022',
    cameraName: 'Sector 5 Cam 23',
    type: 'garbage-accumulation',
    message: alertMessages['garbage-accumulation'][0],
    timestamp: formatTimestamp(45),
    confidence: 91.5,
    verified: false,
  },
  {
    id: 'ALR-004',
    cameraId: 'CAM-0018',
    cameraName: 'Sector 12 Cam 19',
    type: 'camera-offline',
    message: alertMessages['camera-offline'][0],
    timestamp: formatTimestamp(180),
    confidence: 100,
    verified: false,
  },
  {
    id: 'ALR-005',
    cameraId: 'CAM-0031',
    cameraName: 'Workshop Area Cam 32',
    type: 'illegal-dumping',
    message: alertMessages['illegal-dumping'][1],
    timestamp: formatTimestamp(65),
    confidence: 86.3,
    verified: false,
  },
  {
    id: 'ALR-006',
    cameraId: 'CAM-0029',
    cameraName: 'KPT Road Cam 30',
    type: 'unauthorized-halt',
    message: alertMessages['unauthorized-halt'][1],
    timestamp: formatTimestamp(95),
    confidence: 82.1,
    verified: true,
  },
];

export const alertTypeLabels: Record<CameraAlert['type'], string> = {
  'illegal-dumping': 'Suspected Illegal Dumping',
  'unauthorized-halt': 'Unauthorized Vehicle Halt',
  'garbage-accumulation': 'Possible Garbage Accumulation',
  'camera-offline': 'Camera Connectivity Issue',
};

export interface IncidentHeatPoint {
  id: string;
  lat: number;
  lng: number;
  intensity: number;
  location: string;
  incidentCount: number;
  type: 'historical' | 'active';
}

export const incidentHeatPoints: IncidentHeatPoint[] = [
  { id: 'HEAT-001', lat: 23.0733, lng: 70.1306, intensity: 0.95, location: 'Gandhi Chowk, Market Zone', incidentCount: 23, type: 'active' },
  { id: 'HEAT-002', lat: 23.0789, lng: 70.1323, intensity: 0.88, location: 'Sector 8, Near Bus Stand', incidentCount: 18, type: 'active' },
  { id: 'HEAT-003', lat: 23.0756, lng: 70.1256, intensity: 0.72, location: 'Adipur Junction', incidentCount: 15, type: 'historical' },
  { id: 'HEAT-004', lat: 23.0678, lng: 70.1345, intensity: 0.68, location: 'KPT Road, Plot 67', incidentCount: 12, type: 'active' },
  { id: 'HEAT-005', lat: 23.0712, lng: 70.1356, intensity: 0.55, location: 'Sector 5, Industrial Area', incidentCount: 9, type: 'historical' },
  { id: 'HEAT-006', lat: 23.0698, lng: 70.1278, intensity: 0.42, location: 'Sector 2, Workshop Area', incidentCount: 7, type: 'historical' },
  { id: 'HEAT-007', lat: 23.0654, lng: 70.1289, intensity: 0.65, location: 'Highway Plot 23', incidentCount: 11, type: 'active' },
  { id: 'HEAT-008', lat: 23.0801, lng: 70.1334, intensity: 0.38, location: 'Sector 12, Residential', incidentCount: 5, type: 'historical' },
  { id: 'HEAT-009', lat: 23.0745, lng: 70.1290, intensity: 0.50, location: 'Market Road, Central', incidentCount: 8, type: 'historical' },
  { id: 'HEAT-010', lat: 23.0700, lng: 70.1320, intensity: 0.45, location: 'Main Road, Public Roads', incidentCount: 6, type: 'historical' },
];

export interface CameraIncident {
  id: string;
  cameraId: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'assigned' | 'in-progress' | 'resolved';
  detectedAt: string;
  description: string;
}

export const cameraIncidents: CameraIncident[] = [
  { id: 'INC-2026-1042', cameraId: 'CAM-0014', category: 'Garbage Pile', severity: 'critical', status: 'pending', detectedAt: formatTimestamp(12), description: 'Large accumulation of household waste detected near bus terminal entrance.' },
  { id: 'INC-2026-1041', cameraId: 'CAM-0007', category: 'Construction Debris', severity: 'high', status: 'assigned', detectedAt: formatTimestamp(28), description: 'Illegal dumping of construction material on highway shoulder.' },
  { id: 'INC-2026-1040', cameraId: 'CAM-0022', category: 'Plastic Waste', severity: 'medium', status: 'in-progress', detectedAt: formatTimestamp(45), description: 'Plastic waste scattered across vacant industrial plot.' },
  { id: 'INC-2026-1039', cameraId: 'CAM-0014', category: 'Mixed Solid Waste', severity: 'high', status: 'in-progress', detectedAt: formatTimestamp(95), description: 'Mixed waste blocking drainage near bus stand exit.' },
  { id: 'INC-2026-1037', cameraId: 'CAM-0001', category: 'Garbage Pile', severity: 'critical', status: 'pending', detectedAt: formatTimestamp(15), description: 'Critical accumulation near main market. Public health risk.' },
  { id: 'INC-2026-1035', cameraId: 'CAM-0029', category: 'Construction Debris', severity: 'high', status: 'assigned', detectedAt: formatTimestamp(120), description: 'Concrete and rubble dumped illegally on private plot.' },
];
