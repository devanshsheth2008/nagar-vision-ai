import type { ComplaintStatus, ComplaintSeverity, CrewTaskStatus, ComplaintCategory } from '@/types';
import type { BadgeProps } from '@/components/ui/Badge';

export function complaintStatusBadge(s: ComplaintStatus): { variant: BadgeProps['variant']; label: string } {
  switch (s) {
    case 'submitted': return { variant: 'gray', label: 'Submitted' };
    case 'verified': return { variant: 'cyan', label: 'Verified' };
    case 'assigned': return { variant: 'amber', label: 'Assigned' };
    case 'in-progress': return { variant: 'cyan', label: 'In Progress' };
    case 'evidence-uploaded': return { variant: 'purple', label: 'Evidence Uploaded' };
    case 'resolved': return { variant: 'emerald', label: 'Resolved' };
    case 'rejected': return { variant: 'red', label: 'Rejected' };
  }
}

export function complaintSeverityBadge(s: ComplaintSeverity): { variant: BadgeProps['variant']; label: string } {
  switch (s) {
    case 'critical': return { variant: 'red', label: 'Critical' };
    case 'high': return { variant: 'amber', label: 'High' };
    case 'medium': return { variant: 'cyan', label: 'Medium' };
    case 'low': return { variant: 'gray', label: 'Low' };
  }
}

export function crewTaskStatusBadge(s: CrewTaskStatus): { variant: BadgeProps['variant']; label: string } {
  switch (s) {
    case 'assigned': return { variant: 'amber', label: 'Assigned' };
    case 'in-progress': return { variant: 'cyan', label: 'In Progress' };
    case 'completed': return { variant: 'purple', label: 'Completed' };
    case 'verified': return { variant: 'emerald', label: 'Verified' };
  }
}

export function categoryLabel(c: ComplaintCategory): string {
  switch (c) {
    case 'garbage-pile': return 'Garbage Pile';
    case 'plastic-waste': return 'Plastic Waste';
    case 'construction-debris': return 'Construction Debris';
    case 'mixed-waste': return 'Mixed Waste';
    case 'drainage-overflow': return 'Drainage Overflow';
    case 'other': return 'Other';
  }
}

export const complaintCategories: ComplaintCategory[] = [
  'garbage-pile', 'plastic-waste', 'construction-debris', 'mixed-waste', 'drainage-overflow', 'other',
];
