import type {
  Incident,
  Camera,
  VehicleRecord,
  Officer,
  CleanupOperation,
  Hotspot,
  Notification,
} from '@/types';

// Gandhidham coordinates
export const GANDHIDHAM_CENTER: [number, number] = [23.0733, 70.1306];

export const stats = {
  totalIncidents: 1284,
  activeHotspots: 37,
  pendingCleanup: 23,
  resolvedIncidents: 1161,
  registeredCameras: 84,
  detectionAccuracy: 96.4,
};

export const dailyIncidentTrend = [
  { day: 'Mon', incidents: 42, resolved: 38 },
  { day: 'Tue', incidents: 35, resolved: 41 },
  { day: 'Wed', incidents: 51, resolved: 44 },
  { day: 'Thu', incidents: 38, resolved: 36 },
  { day: 'Fri', incidents: 47, resolved: 49 },
  { day: 'Sat', incidents: 55, resolved: 43 },
  { day: 'Sun', incidents: 29, resolved: 31 },
];

export const weeklyGarbageDetection = [
  { week: 'W1', garbage: 120, plastic: 80, debris: 45 },
  { week: 'W2', garbage: 135, plastic: 92, debris: 38 },
  { week: 'W3', garbage: 98, plastic: 71, debris: 52 },
  { week: 'W4', garbage: 142, plastic: 105, debris: 61 },
  { week: 'W5', garbage: 156, plastic: 88, debris: 43 },
  { week: 'W6', garbage: 128, plastic: 95, debris: 57 },
];

export const monthlyCleanupPerformance = [
  { month: 'Jan', scheduled: 45, completed: 42 },
  { month: 'Feb', scheduled: 52, completed: 48 },
  { month: 'Mar', scheduled: 38, completed: 36 },
  { month: 'Apr', scheduled: 61, completed: 55 },
  { month: 'May', scheduled: 48, completed: 47 },
  { month: 'Jun', scheduled: 55, completed: 49 },
  { month: 'Jul', scheduled: 67, completed: 61 },
  { month: 'Aug', scheduled: 43, completed: 40 },
  { month: 'Sep', scheduled: 58, completed: 54 },
  { month: 'Oct', scheduled: 72, completed: 63 },
];

export const wasteDistribution = [
  { name: 'Garbage Pile', value: 385, color: '#218838' },
  { name: 'Plastic Waste', value: 272, color: '#168C8C' },
  { name: 'Construction Debris', value: 198, color: '#D99A19' },
  { name: 'Timber Scrap', value: 112, color: '#2563A6' },
  { name: 'Mixed Solid Waste', value: 317, color: '#C83E3E' },
];

export const incidents: Incident[] = [
  {
    id: 'INC-2026-1042',
    category: 'Garbage Pile',
    severity: 'critical',
    status: 'pending',
    location: 'Sector 8, Near Bus Stand',
    lat: 23.0789,
    lng: 70.1323,
    detectedAt: '2026-10-31T08:42:00',
    cameraId: 'CAM-014',
    confidence: 97.8,
    description: 'Large accumulation of household waste detected near bus terminal entrance.',
  },
  {
    id: 'INC-2026-1041',
    category: 'Construction Debris',
    severity: 'high',
    status: 'assigned',
    location: 'Gandhidham Highway, Plot 23',
    lat: 23.0654,
    lng: 70.1289,
    detectedAt: '2026-10-31T07:15:00',
    cameraId: 'CAM-007',
    confidence: 94.2,
    assignedOfficer: 'Rajesh Kumar',
    description: 'Illegal dumping of construction material on highway shoulder.',
  },
  {
    id: 'INC-2026-1040',
    category: 'Plastic Waste',
    severity: 'medium',
    status: 'in-progress',
    location: 'Sector 5, Industrial Area',
    lat: 23.0712,
    lng: 70.1356,
    detectedAt: '2026-10-31T06:30:00',
    cameraId: 'CAM-022',
    confidence: 92.1,
    assignedOfficer: 'Priya Sharma',
    description: 'Plastic waste scattered across vacant industrial plot.',
  },
  {
    id: 'INC-2026-1039',
    category: 'Mixed Solid Waste',
    severity: 'high',
    status: 'in-progress',
    location: 'Adipur Junction, Near Railway',
    lat: 23.0756,
    lng: 70.1256,
    detectedAt: '2026-10-30T22:10:00',
    cameraId: 'CAM-003',
    confidence: 95.5,
    assignedOfficer: 'Amit Patel',
    description: 'Mixed waste blocking drainage near railway crossing.',
  },
  {
    id: 'INC-2026-1038',
    category: 'Timber Scrap',
    severity: 'low',
    status: 'resolved',
    location: 'Sector 2, Workshop Area',
    lat: 23.0698,
    lng: 70.1278,
    detectedAt: '2026-10-30T18:45:00',
    cameraId: 'CAM-031',
    confidence: 89.3,
    assignedOfficer: 'Suresh Rathore',
    description: 'Timber scrap dumped behind furniture workshop. Cleanup completed.',
  },
  {
    id: 'INC-2026-1037',
    category: 'Garbage Pile',
    severity: 'critical',
    status: 'pending',
    location: 'Gandhi Chowk, Market Zone',
    lat: 23.0733,
    lng: 70.1306,
    detectedAt: '2026-10-31T09:05:00',
    cameraId: 'CAM-001',
    confidence: 98.2,
    description: 'Critical accumulation near main market. Public health risk.',
  },
  {
    id: 'INC-2026-1036',
    category: 'Plastic Waste',
    severity: 'medium',
    status: 'resolved',
    location: 'Sector 12, Residential',
    lat: 23.0801,
    lng: 70.1334,
    detectedAt: '2026-10-30T15:20:00',
    cameraId: 'CAM-018',
    confidence: 91.7,
    assignedOfficer: 'Priya Sharma',
    description: 'Plastic bags and packaging near residential park. Resolved.',
  },
  {
    id: 'INC-2026-1035',
    category: 'Construction Debris',
    severity: 'high',
    status: 'assigned',
    location: 'KPT Road, Plot 67',
    lat: 23.0678,
    lng: 70.1345,
    detectedAt: '2026-10-30T14:00:00',
    cameraId: 'CAM-029',
    confidence: 93.8,
    assignedOfficer: 'Rajesh Kumar',
    description: 'Concrete and rubble dumped illegally on private plot.',
  },
];

export const cameras: Camera[] = [
  { id: 'CAM-001', name: 'Gandhi Chowk', location: 'Gandhi Chowk, Market Zone', lat: 23.0733, lng: 70.1306, status: 'online', lastHeartbeat: '2026-10-31T09:30:00', zone: 'Zone A - Central', resolution: '4K' },
  { id: 'CAM-003', name: 'Adipur Junction', location: 'Adipur Junction, Near Railway', lat: 23.0756, lng: 70.1256, status: 'online', lastHeartbeat: '2026-10-31T09:30:00', zone: 'Zone B - East', resolution: '1080p' },
  { id: 'CAM-007', name: 'Highway Watch', location: 'Gandhidham Highway, Plot 23', lat: 23.0654, lng: 70.1289, status: 'online', lastHeartbeat: '2026-10-31T09:29:00', zone: 'Zone C - Highway', resolution: '4K' },
  { id: 'CAM-014', name: 'Bus Stand Cam', location: 'Sector 8, Near Bus Stand', lat: 23.0789, lng: 70.1323, status: 'online', lastHeartbeat: '2026-10-31T09:30:00', zone: 'Zone A - Central', resolution: '1080p' },
  { id: 'CAM-018', name: 'Residential S12', location: 'Sector 12, Residential', lat: 23.0801, lng: 70.1334, status: 'offline', lastHeartbeat: '2026-10-31T06:12:00', zone: 'Zone D - North', resolution: '1080p' },
  { id: 'CAM-022', name: 'Industrial S5', location: 'Sector 5, Industrial Area', lat: 23.0712, lng: 70.1356, status: 'online', lastHeartbeat: '2026-10-31T09:30:00', zone: 'Zone E - Industrial', resolution: '4K' },
  { id: 'CAM-029', name: 'KPT Road', location: 'KPT Road, Plot 67', lat: 23.0678, lng: 70.1345, status: 'maintenance', lastHeartbeat: '2026-10-31T05:00:00', zone: 'Zone C - Highway', resolution: '1080p' },
  { id: 'CAM-031', name: 'Workshop S2', location: 'Sector 2, Workshop Area', lat: 23.0698, lng: 70.1278, status: 'online', lastHeartbeat: '2026-10-31T09:28:00', zone: 'Zone D - North', resolution: '720p' },
];

export const vehicleRecords: VehicleRecord[] = [
  { id: 'VEH-5042', plateNumber: 'GJ 04 AB 1298', vehicleType: 'Truck', ocrConfidence: 96.5, incidentId: 'INC-2026-1041', detectedAt: '2026-10-31T07:14:00', location: 'Gandhidham Highway, Plot 23', verified: true, verifiedBy: 'Amit Patel' },
  { id: 'VEH-5041', plateNumber: 'GJ 12 CX 5673', vehicleType: 'Dumper', ocrConfidence: 93.2, incidentId: 'INC-2026-1035', detectedAt: '2026-10-30T13:58:00', location: 'KPT Road, Plot 67', verified: true, verifiedBy: 'Rajesh Kumar' },
  { id: 'VEH-5040', plateNumber: 'GJ 04 DK 8821', vehicleType: 'Van', ocrConfidence: 88.7, incidentId: 'INC-2026-1040', detectedAt: '2026-10-31T06:28:00', location: 'Sector 5, Industrial Area', verified: false },
  { id: 'VEH-5039', plateNumber: 'GJ 18 PY 3340', vehicleType: 'Auto-rickshaw', ocrConfidence: 91.4, incidentId: 'INC-2026-1039', detectedAt: '2026-10-30T22:08:00', location: 'Adipur Junction, Near Railway', verified: false },
  { id: 'VEH-5038', plateNumber: 'GJ 04 LK 7702', vehicleType: 'Truck', ocrConfidence: 97.1, incidentId: 'INC-2026-1042', detectedAt: '2026-10-31T08:40:00', location: 'Sector 8, Near Bus Stand', verified: true, verifiedBy: 'Suresh Rathore' },
  { id: 'VEH-5037', plateNumber: 'GJ 06 RT 1199', vehicleType: 'Car', ocrConfidence: 84.3, incidentId: 'INC-2026-1037', detectedAt: '2026-10-31T09:03:00', location: 'Gandhi Chowk, Market Zone', verified: false },
];

export const officers: Officer[] = [
  { id: 'OFC-001', name: 'Rajesh Kumar', badge: 'GMC-1101', role: 'Inspector', zone: 'Zone C - Highway', status: 'on-duty', incidentsResolved: 87, activeAssignments: 2, phone: '+91 98256 11201', joinedAt: '2024-03-15' },
  { id: 'OFC-002', name: 'Priya Sharma', badge: 'GMC-1102', role: 'Supervisor', zone: 'Zone E - Industrial', status: 'on-duty', incidentsResolved: 64, activeAssignments: 1, phone: '+91 98256 11202', joinedAt: '2024-05-20' },
  { id: 'OFC-003', name: 'Amit Patel', badge: 'GMC-1103', role: 'Field Officer', zone: 'Zone B - East', status: 'on-duty', incidentsResolved: 52, activeAssignments: 1, phone: '+91 98256 11203', joinedAt: '2024-06-10' },
  { id: 'OFC-004', name: 'Suresh Rathore', badge: 'GMC-1104', role: 'Field Officer', zone: 'Zone D - North', status: 'off-duty', incidentsResolved: 71, activeAssignments: 0, phone: '+91 98256 11204', joinedAt: '2023-11-08' },
  { id: 'OFC-005', name: 'Deepika Joshi', badge: 'GMC-1105', role: 'Operator', zone: 'Zone A - Central', status: 'on-duty', incidentsResolved: 38, activeAssignments: 0, phone: '+91 98256 11205', joinedAt: '2025-01-14' },
  { id: 'OFC-006', name: 'Manav Desai', badge: 'GMC-1106', role: 'Field Officer', zone: 'Zone A - Central', status: 'on-leave', incidentsResolved: 45, activeAssignments: 0, phone: '+91 98256 11206', joinedAt: '2024-09-01' },
];

export const cleanupOperations: CleanupOperation[] = [
  { id: 'CLN-3201', incidentId: 'INC-2026-1039', location: 'Adipur Junction, Near Railway', officer: 'Amit Patel', crewSize: 6, status: 'in-progress', scheduledAt: '2026-10-31T06:00:00', wasteCollected: 2.4, truckId: 'TRK-08' },
  { id: 'CLN-3200', incidentId: 'INC-2026-1040', location: 'Sector 5, Industrial Area', officer: 'Priya Sharma', crewSize: 4, status: 'in-progress', scheduledAt: '2026-10-31T07:00:00', wasteCollected: 1.8, truckId: 'TRK-05' },
  { id: 'CLN-3199', incidentId: 'INC-2026-1038', location: 'Sector 2, Workshop Area', officer: 'Suresh Rathore', crewSize: 3, status: 'completed', scheduledAt: '2026-10-30T14:00:00', completedAt: '2026-10-30T17:30:00', wasteCollected: 3.2, truckId: 'TRK-08' },
  { id: 'CLN-3198', incidentId: 'INC-2026-1041', location: 'Gandhidham Highway, Plot 23', officer: 'Rajesh Kumar', crewSize: 8, status: 'scheduled', scheduledAt: '2026-10-31T14:00:00', wasteCollected: 0, truckId: 'TRK-12' },
  { id: 'CLN-3197', incidentId: 'INC-2026-1035', location: 'KPT Road, Plot 67', officer: 'Rajesh Kumar', crewSize: 6, status: 'scheduled', scheduledAt: '2026-10-31T16:00:00', wasteCollected: 0, truckId: 'TRK-12' },
  { id: 'CLN-3196', incidentId: 'INC-2026-1036', location: 'Sector 12, Residential', officer: 'Priya Sharma', crewSize: 4, status: 'completed', scheduledAt: '2026-10-30T15:00:00', completedAt: '2026-10-30T18:00:00', wasteCollected: 1.5, truckId: 'TRK-05' },
];

export const hotspots: Hotspot[] = [
  { id: 'HS-001', location: 'Gandhi Chowk, Market Zone', lat: 23.0733, lng: 70.1306, incidentCount: 23, trend: 'rising', severity: 'critical', lastIncident: '2026-10-31T09:05:00', radius: 150 },
  { id: 'HS-002', location: 'Sector 8, Near Bus Stand', lat: 23.0789, lng: 70.1323, incidentCount: 18, trend: 'rising', severity: 'critical', lastIncident: '2026-10-31T08:42:00', radius: 120 },
  { id: 'HS-003', location: 'Adipur Junction', lat: 23.0756, lng: 70.1256, incidentCount: 15, trend: 'stable', severity: 'high', lastIncident: '2026-10-30T22:10:00', radius: 100 },
  { id: 'HS-004', location: 'KPT Road, Plot 67', lat: 23.0678, lng: 70.1345, incidentCount: 12, trend: 'rising', severity: 'high', lastIncident: '2026-10-30T14:00:00', radius: 90 },
  { id: 'HS-005', location: 'Sector 5, Industrial Area', lat: 23.0712, lng: 70.1356, incidentCount: 9, trend: 'stable', severity: 'medium', lastIncident: '2026-10-31T06:30:00', radius: 80 },
  { id: 'HS-006', location: 'Sector 2, Workshop Area', lat: 23.0698, lng: 70.1278, incidentCount: 7, trend: 'declining', severity: 'low', lastIncident: '2026-10-30T18:45:00', radius: 60 },
  { id: 'HS-007', location: 'Highway Plot 23', lat: 23.0654, lng: 70.1289, incidentCount: 11, trend: 'rising', severity: 'high', lastIncident: '2026-10-31T07:15:00', radius: 110 },
];

export const notifications: Notification[] = [
  { id: 'N-001', title: 'Critical Alert', message: 'New garbage pile detected at Gandhi Chowk - confidence 98.2%', type: 'alert', timestamp: '2026-10-31T09:05:00', read: false },
  { id: 'N-002', title: 'Camera Offline', message: 'CAM-018 in Sector 12 has been offline for 3 hours', type: 'alert', timestamp: '2026-10-31T06:12:00', read: false },
  { id: 'N-003', title: 'Cleanup Completed', message: 'Sector 2 workshop area cleanup finished - 3.2 tonnes collected', type: 'success', timestamp: '2026-10-30T17:30:00', read: true },
  { id: 'N-004', title: 'Vehicle Verified', message: 'Plate GJ 04 AB 1298 verified for incident INC-2026-1041', type: 'info', timestamp: '2026-10-31T07:30:00', read: false },
  { id: 'N-005', title: 'New Hotspot', message: 'Rising trend detected at KPT Road - 12 incidents this month', type: 'alert', timestamp: '2026-10-30T16:00:00', read: true },
];

export const cameraZones = ['All Zones', 'Zone A - Central', 'Zone B - East', 'Zone C - Highway', 'Zone D - North', 'Zone E - Industrial'];
