import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { crewTaskStatusBadge, categoryLabel } from '@/lib/complaintBadges';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Clock, CheckCircle2,
  ArrowRight, MapPin,
} from 'lucide-react';
import type { CrewTask, Complaint } from '@/types';

interface TaskWithComplaint extends CrewTask {
  complaint: Complaint;
}

export function CrewDashboard() {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<TaskWithComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('crew_tasks')
      .select(`
        id, complaint_id, crew_id, status, assigned_at, started_at, completed_at, verified_at, admin_notes, created_at,
        complaint:complaints(id, category, description, location_text, lat, lng, status, severity)
      `)
      .eq('crew_id', user.id)
      .neq('status', 'verified')
      .order('assigned_at', { ascending: false })
      .then(({ data }) => {
        setTasks((data as unknown as TaskWithComplaint[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const assignedCount = tasks.filter((t) => t.status === 'assigned').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div>
      <PageHeader
        title="Crew Dashboard"
        description={`Welcome, ${profile?.full_name || 'Crew Member'}. Here are your assigned cleanup tasks.`}
        icon={<LayoutDashboard className="w-5 h-5" />}
        actions={
          <Link
            to="/crew/tasks"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#17365D] text-white text-sm font-medium hover:bg-[#2563A6] transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            View Tasks
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Assigned" value={assignedCount} icon={<ClipboardList className="w-5 h-5" />} accent="amber" />
        <StatCard label="In Progress" value={inProgressCount} icon={<Clock className="w-5 h-5" />} accent="cyan" />
        <StatCard label="Completed (Pending Verification)" value={completedCount} icon={<CheckCircle2 className="w-5 h-5" />} accent="emerald" />
      </div>

      <Panel
        title="Active Tasks"
        subtitle="Tasks assigned to you that need attention"
        noPadding
        action={
          <Link to="/crew/tasks" className="text-xs text-[#168C8C] hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        }
      >
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No active tasks assigned to you.</p>
          </div>
        ) : (
          <div className="divide-y divide-ink-700/60">
            {tasks.slice(0, 6).map((t) => {
              const sb = crewTaskStatusBadge(t.status);
              return (
                <Link
                  key={t.id}
                  to={`/crew/tasks?id=${t.id}`}
                  className="block px-5 py-3 hover:bg-ink-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-gray-500">{t.id.slice(0, 8).toUpperCase()}</span>
                    <Badge variant={sb.variant} dot>{sb.label}</Badge>
                  </div>
                  <p className="text-sm text-[#263445] truncate">
                    {t.complaint?.location_text || categoryLabel(t.complaint?.category || 'other')}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {t.complaint?.lat.toFixed(3)}, {t.complaint?.lng.toFixed(3)}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      Assigned {new Date(t.assigned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
