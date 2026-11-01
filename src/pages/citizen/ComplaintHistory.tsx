import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { complaintStatusBadge, complaintSeverityBadge, categoryLabel } from '@/lib/complaintBadges';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import type { Complaint } from '@/types';

export function ComplaintHistory() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'resolved' | 'rejected'>('all');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('complaints')
      .select('id, citizen_id, category, description, location_text, lat, lng, status, severity, admin_notes, created_at, updated_at')
      .eq('citizen_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setComplaints((data as Complaint[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const filtered = complaints.filter((c) => {
    if (filter === 'all') return ['resolved', 'rejected'].includes(c.status);
    return c.status === filter;
  });

  return (
    <div>
      <PageHeader
        title="Complaint History"
        description="View all your past complaints including resolved and rejected."
        icon={<FileText className="w-5 h-5" />}
      />

      <div className="flex gap-2 mb-4">
        {(['all', 'resolved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === f
                ? 'bg-[#17365D] text-white border-[#17365D]'
                : 'bg-white text-gray-600 border-ink-700 hover:border-ink-600'
            }`}
          >
            {f === 'all' ? 'All Closed' : f === 'resolved' ? 'Resolved' : 'Rejected'}
          </button>
        ))}
      </div>

      {loading ? (
        <Panel><div className="p-6 text-center text-sm text-gray-500">Loading...</div></Panel>
      ) : filtered.length === 0 ? (
        <Panel>
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No complaints in this category.</p>
          </div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((c) => {
            const sb = complaintStatusBadge(c.status);
            return (
              <Panel key={c.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {c.status === 'resolved' ? (
                        <CheckCircle2 className="w-5 h-5 text-[#218838] shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#C83E3E] shrink-0" />
                      )}
                      <span className="text-xs font-mono text-gray-500">{c.id.slice(0, 8).toUpperCase()}</span>
                      <Badge variant={sb.variant} dot>{sb.label}</Badge>
                      {c.severity && (
                        <Badge variant={complaintSeverityBadge(c.severity).variant}>
                          {complaintSeverityBadge(c.severity).label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#263445]">{c.location_text || categoryLabel(c.category)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {categoryLabel(c.category)} · {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {c.description && <p className="text-sm text-gray-600 mt-2">{c.description}</p>}
                    {c.admin_notes && (
                      <div className="mt-2 p-2 rounded bg-ink-800/50 text-xs text-gray-600">
                        <span className="font-medium">Admin note: </span>{c.admin_notes}
                      </div>
                    )}
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
