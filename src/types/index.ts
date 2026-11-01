export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'pending' | 'assigned' | 'in-progress' | 'resolved';
export type IncidentCategory =
  | 'Garbage Pile'
  | 'Plastic Waste'
  | 'Construction Debris'
  | 'Timber Scrap'
  | 'Mixed Solid Waste';

export interface Incident {
  id: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: string;
  lat: number;
  lng: number;
  detectedAt: string;
  assignedOfficer?: string;
  cameraId: string;
  confidence: number;
  description: string;
}

export type CameraStatus = 'online' | 'offline' | 'maintenance';
export type CameraType = 'Dome' | 'Bullet' | 'PTZ' | 'Thermal' | 'ANPR';
export type CameraArea = 'Industrial Area' | 'Commercial Area' | 'Highway and Bypass' | 'Residential Area' | 'Market Area' | 'Public Roads';

export interface Camera {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  status: CameraStatus;
  lastHeartbeat: string;
  zone: string;
  resolution: string;
}

export interface MonitoringCamera {
  id: string;
  name: string;
  location: string;
  area: CameraArea;
  lat: number;
  lng: number;
  status: CameraStatus;
  type: CameraType;
  resolution: string;
  lastActive: string;
  hasAlert: boolean;
  streamHealth: 'healthy' | 'degraded' | 'down';
  connectionFailures: number;
}

export type AlertType = 'illegal-dumping' | 'unauthorized-halt' | 'garbage-accumulation' | 'camera-offline';

export interface CameraAlert {
  id: string;
  cameraId: string;
  cameraName: string;
  type: AlertType;
  message: string;
  timestamp: string;
  confidence: number;
  verified: boolean;
}

export interface VehicleRecord {
  id: string;
  plateNumber: string;
  vehicleType: 'Truck' | 'Car' | 'Van' | 'Auto-rickshaw' | 'Dumper';
  ocrConfidence: number;
  incidentId: string;
  detectedAt: string;
  location: string;
  verified: boolean;
  verifiedBy?: string;
}

export interface Officer {
  id: string;
  name: string;
  badge: string;
  role: 'Inspector' | 'Supervisor' | 'Field Officer' | 'Operator';
  zone: string;
  status: 'on-duty' | 'off-duty' | 'on-leave';
  incidentsResolved: number;
  activeAssignments: number;
  phone: string;
  joinedAt: string;
}

export interface CleanupOperation {
  id: string;
  incidentId: string;
  location: string;
  officer: string;
  crewSize: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  scheduledAt: string;
  completedAt?: string;
  wasteCollected: number;
  truckId: string;
}

export interface Hotspot {
  id: string;
  location: string;
  lat: number;
  lng: number;
  incidentCount: number;
  trend: 'rising' | 'stable' | 'declining';
  severity: IncidentSeverity;
  lastIncident: string;
  radius: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  timestamp: string;
  read: boolean;
}

export interface DetectionResult {
  id: string;
  category: IncidentCategory;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}

export interface DetectionSession {
  id: string;
  imageUrl: string;
  results: DetectionResult[];
  processedAt: string;
  processingTime: number;
  modelVersion: string;
  status: 'processing' | 'completed' | 'failed';
}

// ============================================================
// SWATCHNETRA Multi-Portal Types
// ============================================================

export type UserRole = 'admin' | 'citizen' | 'crew';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  created_at: string;
}

export type ComplaintCategory =
  | 'garbage-pile'
  | 'plastic-waste'
  | 'construction-debris'
  | 'mixed-waste'
  | 'drainage-overflow'
  | 'other';

export type ComplaintStatus =
  | 'submitted'
  | 'verified'
  | 'assigned'
  | 'in-progress'
  | 'evidence-uploaded'
  | 'resolved'
  | 'rejected';

export type ComplaintSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Complaint {
  id: string;
  citizen_id: string;
  category: ComplaintCategory;
  description: string;
  location_text: string;
  lat: number;
  lng: number;
  status: ComplaintStatus;
  severity: ComplaintSeverity | null;
  assigned_crew_id: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  photos?: ComplaintPhoto[];
  citizen_name?: string;
  crew_name?: string;
}

export interface ComplaintPhoto {
  id: string;
  complaint_id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
}

export type CrewTaskStatus = 'assigned' | 'in-progress' | 'completed' | 'verified';

export interface CrewTask {
  id: string;
  complaint_id: string;
  crew_id: string;
  status: CrewTaskStatus;
  assigned_at: string;
  started_at: string | null;
  completed_at: string | null;
  verified_at: string | null;
  admin_notes: string | null;
  created_at: string;
  complaint?: Complaint;
  photos?: TaskPhoto[];
  crew_name?: string;
}

export interface TaskPhoto {
  id: string;
  task_id: string;
  photo_url: string;
  photo_type: 'before' | 'after';
  caption: string | null;
  created_at: string;
}
