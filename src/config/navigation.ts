import {
  LayoutDashboard, Monitor, ScanSearch, Car, MapPin,
  AlertTriangle, Trash2, BarChart3, Users, Settings, FileText,
  ClipboardList, CheckSquare, User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@/types';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

export const adminNavItems: NavItem[] = [
  { label: 'Command Center', path: '/admin', icon: LayoutDashboard },
  { label: 'Problem Overview', path: '/admin/problem-overview', icon: FileText },
  { label: 'Live Monitoring', path: '/admin/monitoring', icon: Monitor },
  { label: 'AI Detection', path: '/admin/ai-detection', icon: ScanSearch },
  { label: 'Vehicle Recognition', path: '/admin/vehicles', icon: Car },
  { label: 'Hotspot Intelligence', path: '/admin/hotspots', icon: MapPin },
  { label: 'Incident Management', path: '/admin/incidents', icon: AlertTriangle, badge: '5' },
  { label: 'Citizen Complaints', path: '/admin/complaints', icon: ClipboardList, badge: 'New' },
  { label: 'Cleanup Operations', path: '/admin/cleanup', icon: Trash2, badge: '3' },
  { label: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Officer Management', path: '/admin/officers', icon: Users },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export const citizenNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/citizen', icon: LayoutDashboard },
  { label: 'Report Garbage', path: '/citizen/report', icon: AlertTriangle },
  { label: 'Track Complaints', path: '/citizen/track', icon: ClipboardList },
  { label: 'Complaint History', path: '/citizen/history', icon: FileText },
  { label: 'Profile', path: '/citizen/profile', icon: User },
];

export const crewNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/crew', icon: LayoutDashboard },
  { label: 'Assigned Tasks', path: '/crew/tasks', icon: ClipboardList, badge: 'Active' },
  { label: 'Completed Tasks', path: '/crew/completed', icon: CheckSquare },
  { label: 'Task History', path: '/crew/history', icon: FileText },
  { label: 'Profile', path: '/crew/profile', icon: User },
];

export function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case 'admin': return adminNavItems;
    case 'citizen': return citizenNavItems;
    case 'crew': return crewNavItems;
  }
}

export const portalLabels: Record<UserRole, string> = {
  admin: 'Admin Portal',
  citizen: 'Citizen Portal',
  crew: 'Cleaning Crew Portal',
};
