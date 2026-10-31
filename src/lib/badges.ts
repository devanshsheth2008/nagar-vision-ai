import type { IncidentSeverity, IncidentStatus, CameraStatus } from '@/types';
import type { BadgeProps } from '@/components/ui/Badge';

export function severityBadge(s: IncidentSeverity): { variant: BadgeProps['variant']; label: string } {
  switch (s) {
    case 'critical': return { variant: 'red', label: 'Critical' };
    case 'high': return { variant: 'amber', label: 'High' };
    case 'medium': return { variant: 'cyan', label: 'Medium' };
    case 'low': return { variant: 'gray', label: 'Low' };
  }
}

export function statusBadge(s: IncidentStatus): { variant: BadgeProps['variant']; label: string } {
  switch (s) {
    case 'pending': return { variant: 'red', label: 'Pending' };
    case 'assigned': return { variant: 'amber', label: 'Assigned' };
    case 'in-progress': return { variant: 'cyan', label: 'In Progress' };
    case 'resolved': return { variant: 'emerald', label: 'Resolved' };
  }
}

export function cameraStatusBadge(s: CameraStatus): { variant: BadgeProps['variant']; label: string } {
  switch (s) {
    case 'online': return { variant: 'emerald', label: 'Online' };
    case 'offline': return { variant: 'red', label: 'Offline' };
    case 'maintenance': return { variant: 'amber', label: 'Maintenance' };
  }
}
