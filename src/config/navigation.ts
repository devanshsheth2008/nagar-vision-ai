import {
  LayoutDashboard,
  Monitor,
  ScanSearch,
  Car,
  MapPin,
  AlertTriangle,
  Trash2,
  BarChart3,
  Users,
  Settings,
  FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

export const navItems: NavItem[] = [
  { label: 'Command Center', path: '/', icon: LayoutDashboard },
  { label: 'Problem Overview', path: '/problem-overview', icon: FileText },
  { label: 'Live Monitoring', path: '/monitoring', icon: Monitor },
  { label: 'AI Detection', path: '/ai-detection', icon: ScanSearch },
  { label: 'Vehicle Recognition', path: '/vehicles', icon: Car },
  { label: 'Hotspot Intelligence', path: '/hotspots', icon: MapPin },
  { label: 'Incident Management', path: '/incidents', icon: AlertTriangle, badge: '5' },
  { label: 'Cleanup Operations', path: '/cleanup', icon: Trash2, badge: '3' },
  { label: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
  { label: 'Officer Management', path: '/officers', icon: Users },
  { label: 'Settings', path: '/settings', icon: Settings },
];
