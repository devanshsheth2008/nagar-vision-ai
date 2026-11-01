import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { complaintStatusBadge, categoryLabel } from '@/lib/complaintBadges';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, AlertTriangle, Clock, CheckCircle2,
  Plus, ArrowRight, MapPin, Camera,
} from 'lucide-react';
import type { Complaint } from '@/types';

export function CitizenDashboard() {
  const { user, profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('complaints')
      .select('id, category, description, location_text, lat, lng, status, severity, created_at, updated_at')
      .eq('citizen_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setComplaints((data as Complaint[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const activeCount = complaints.filter((c) => !['resolved', 'rejected'].includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const submittedCount = complaints.filter((c) => c.status === 'submitted').length;

  const recent = complaints.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="My Dashboard"
        description={`Welcome, ${profile?.full_name || 'Citizen'}. Track your waste complaints and report new issues.`}
        icon={<LayoutDashboard className="w-5 h-5" />}
        actions={
          <Link
            to="/citizen/report"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#17365D] text-white text-sm font-medium hover:bg-[#2563A6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Report Garbage
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Active Complaints" value={activeCount} icon={<AlertTriangle className="w-5 h-5" />} accent="amber" />
        <StatCard label="Submitted (Pending Review)" value={submittedCount} icon={<Clock className="w-5 h-5" />} accent="cyan" />
        <StatCard label="Resolved" value={resolvedCount} icon={<CheckCircle2 className="w-5 h-5" />} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel
            title="Recent Complaints"
            subtitle="Your latest reported issues"
            noPadding
            action={
              <Link to="/citizen/track" className="text-xs text-[#168C8C] hover:underline flex items-center gap-1">
                Track all <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
            ) : recent.length === 0 ? (
              <div className="p-8 text-center">
                <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">You haven't reported any garbage yet.</p>
                <Link
                  to="/citizen/report"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#168C8C] text-white text-sm font-medium hover:bg-[#147272] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Report Your First Issue
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-ink-700/60">
                {recent.map((c) => {
                  const sb = complaintStatusBadge(c.status);
                  return (
                    <Link
                      key={c.id}
                      to={`/citizen/track?id=${c.id}`}
                      className="block px-5 py-3 hover:bg-ink-800/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-gray-500">{c.id.slice(0, 8).toUpperCase()}</span>
                        <Badge variant={sb.variant} dot>{sb.label}</Badge>
                      </div>
                      <p className="text-sm text-[#263445] truncate">{c.location_text || categoryLabel(c.category)}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-500">{categoryLabel(c.category)}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Quick Actions" subtitle="Report and track">
          <div className="space-y-3">
            <Link
              to="/citizen/report"
              className="flex items-center gap-3 p-3 rounded-lg border border-ink-700 hover:border-[#168C8C] hover:bg-[#168C8C]/5 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-[#168C8C]/10 border border-[#168C8C]/20 flex items-center justify-center">
                <Camera className="w-4 h-4 text-[#168C8C]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#263445]">Report Garbage</p>
                <p className="text-xs text-gray-500">Upload photo & pin location</p>
              </div>
            </Link>

            <Link
              to="/citizen/track"
              className="flex items-center gap-3 p-3 rounded-lg border border-ink-700 hover:border-[#17365D] hover:bg-[#17365D]/5 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-[#17365D]/10 border border-[#17365D]/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#17365D]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#263445]">Track Complaints</p>
                <p className="text-xs text-gray-500">Check status updates</p>
              </div>
            </Link>

            <Link
              to="/citizen/history"
              className="flex items-center gap-3 p-3 rounded-lg border border-ink-700 hover:border-[#218838] hover:bg-[#218838]/5 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-[#218838]/10 border border-[#218838]/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#218838]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#263445]">Complaint History</p>
                <p className="text-xs text-gray-500">View all past reports</p>
              </div>
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
