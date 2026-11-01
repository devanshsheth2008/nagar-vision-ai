import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { crewTaskStatusBadge, categoryLabel } from '@/lib/complaintBadges';
import { CheckSquare, MapPin } from 'lucide-react';
import type { CrewTask, Complaint } from '@/types';

interface TaskWithComplaint extends CrewTask {
  complaint: Complaint;
}

export function CompletedTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('crew_tasks')
      .select(`
        id, complaint_id, crew_id, status, assigned_at, started_at, completed_at, verified_at, admin_notes, created_at,
        complaint:complaints(id, category, description, location_text, lat, lng, status, severity, created_at, updated_at)
      `)
      .eq('crew_id', user.id)
      .in('status', ['completed', 'verified'])
      .order('completed_at', { ascending: false })
      .then(({ data }) => {
        setTasks((data as unknown as TaskWithComplaint[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div>
      <PageHeader
        title="Completed Tasks"
        description="Tasks you've finished, pending or confirmed by admin."
        icon={<CheckSquare className="w-5 h-5" />}
      />

      {loading ? (
        <Panel><div className="p-6 text-center text-sm text-gray-500">Loading...</div></Panel>
      ) : tasks.length === 0 ? (
        <Panel>
          <div className="py-12 text-center">
            <CheckSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No completed tasks yet.</p>
          </div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {tasks.map((t) => {
            const sb = crewTaskStatusBadge(t.status);
            return (
              <Panel key={t.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-gray-500">{t.id.slice(0, 8).toUpperCase()}</span>
                      <Badge variant={sb.variant} dot>{sb.label}</Badge>
                    </div>
                    <p className="text-sm font-medium text-[#263445]">
                      {t.complaint?.location_text || categoryLabel(t.complaint?.category || 'other')}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {t.complaint?.lat.toFixed(3)}, {t.complaint?.lng.toFixed(3)}
                      </span>
                      <span>
                        Completed: {t.completed_at ? new Date(t.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                      {t.verified_at && (
                        <span className="text-[#218838]">
                          Verified: {new Date(t.verified_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
