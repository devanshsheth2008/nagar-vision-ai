import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { CityMap } from '@/components/map/CityMap';
import {
  complaintStatusBadge, complaintSeverityBadge, categoryLabel,
} from '@/lib/complaintBadges';
import {
  ClipboardList, Clock, CheckCircle2, AlertTriangle, MapPin,
  ShieldCheck, UserCog, XCircle, Loader2, Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  Complaint, ComplaintPhoto, ComplaintSeverity, UserProfile, CrewTask, TaskPhoto,
} from '@/types';

interface ComplaintWithNames extends Complaint {
  citizen_name?: string;
  crew_name?: string;
}

export function AdminComplaints() {
  const [complaints, setComplaints] = useState<ComplaintWithNames[]>([]);
  const [selected, setSelected] = useState<ComplaintWithNames | null>(null);
  const [photos, setPhotos] = useState<ComplaintPhoto[]>([]);
  const [crewMembers, setCrewMembers] = useState<UserProfile[]>([]);
  const [crewTasks, setCrewTasks] = useState<CrewTask[]>([]);
  const [taskPhotos, setTaskPhotos] = useState<TaskPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'verified' | 'assigned' | 'in-progress' | 'evidence-uploaded' | 'resolved' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [severity, setSeverity] = useState<ComplaintSeverity>('medium');
  const [selectedCrewId, setSelectedCrewId] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadComplaints();
    supabase
      .from('profiles')
      .select('id, role, full_name, phone, created_at')
      .eq('role', 'crew')
      .then(({ data }) => setCrewMembers((data as UserProfile[]) ?? []));
  }, []);

  const loadComplaints = () => {
    supabase
      .from('complaints')
      .select(`
        id, citizen_id, category, description, location_text, lat, lng,
        status, severity, assigned_crew_id, admin_notes, created_at, updated_at
      `)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setComplaints((data as Complaint[]) ?? []);
        setLoading(false);
      });
  };

  const selectComplaint = (c: Complaint) => {
    setSelected(c as ComplaintWithNames);
    setAdminNotes(c.admin_notes || '');
    setSelectedCrewId(c.assigned_crew_id || '');
    setSeverity(c.severity || 'medium');

    supabase
      .from('complaint_photos')
      .select('id, complaint_id, photo_url, caption, created_at')
      .eq('complaint_id', c.id)
      .then(({ data }) => setPhotos((data as ComplaintPhoto[]) ?? []));

    supabase
      .from('crew_tasks')
      .select('id, complaint_id, crew_id, status, assigned_at, started_at, completed_at, verified_at, admin_notes, created_at')
      .eq('complaint_id', c.id)
      .then(({ data }) => {
        const tasks = (data as CrewTask[]) ?? [];
        setCrewTasks(tasks);
        if (tasks.length > 0) {
          supabase
            .from('task_photos')
            .select('id, task_id, photo_url, photo_type, caption, created_at')
            .eq('task_id', tasks[0].id)
            .then(({ data: tpData }) => setTaskPhotos((tpData as TaskPhoto[]) ?? []));
        } else {
          setTaskPhotos([]);
        }
      });
  };

  const verifyComplaint = async () => {
    if (!selected) return;
    setActionLoading(true);
    await supabase
      .from('complaints')
      .update({ status: 'verified', severity, admin_notes: adminNotes || null })
      .eq('id', selected.id);
    refreshSelected();
    loadComplaints();
    setActionLoading(false);
  };

  const rejectComplaint = async () => {
    if (!selected) return;
    setActionLoading(true);
    await supabase
      .from('complaints')
      .update({ status: 'rejected', admin_notes: adminNotes || null })
      .eq('id', selected.id);
    refreshSelected();
    loadComplaints();
    setActionLoading(false);
  };

  const assignCrew = async () => {
    if (!selected || !selectedCrewId) return;
    setActionLoading(true);
    await supabase
      .from('complaints')
      .update({ status: 'assigned', assigned_crew_id: selectedCrewId, admin_notes: adminNotes || null })
      .eq('id', selected.id);

    await supabase.from('crew_tasks').insert({
      complaint_id: selected.id,
      crew_id: selectedCrewId,
      status: 'assigned',
    });

    refreshSelected();
    loadComplaints();
    setActionLoading(false);
  };

  const verifyCompletion = async () => {
    if (!selected) return;
    setActionLoading(true);
    await supabase.from('complaints').update({ status: 'resolved' }).eq('id', selected.id);
    if (crewTasks.length > 0) {
      await supabase.from('crew_tasks').update({ status: 'verified', verified_at: new Date().toISOString() }).eq('id', crewTasks[0].id);
    }
    refreshSelected();
    loadComplaints();
    setActionLoading(false);
  };

  const refreshSelected = () => {
    if (!selected) return;
    supabase
      .from('complaints')
      .select('id, citizen_id, category, description, location_text, lat, lng, status, severity, assigned_crew_id, admin_notes, created_at, updated_at')
      .eq('id', selected.id)
      .single()
      .then(({ data }) => {
        if (data) selectComplaint(data as Complaint);
      });
  };

  const filtered = filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

  const counts = {
    submitted: complaints.filter((c) => c.status === 'submitted').length,
    verified: complaints.filter((c) => c.status === 'verified').length,
    inProgress: complaints.filter((c) => c.status === 'in-progress' || c.status === 'assigned').length,
    evidence: complaints.filter((c) => c.status === 'evidence-uploaded').length,
  };

  const beforePhotos = taskPhotos.filter((p) => p.photo_type === 'before');
  const afterPhotos = taskPhotos.filter((p) => p.photo_type === 'after');

  return (
    <div>
      <PageHeader
        title="Citizen Complaints"
        description="Review citizen-reported waste complaints, verify, assign crews, and verify completion."
        icon={<ClipboardList className="w-5 h-5" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="New (Pending Review)" value={counts.submitted} icon={<AlertTriangle className="w-5 h-5" />} accent="amber" />
        <StatCard label="Verified" value={counts.verified} icon={<ShieldCheck className="w-5 h-5" />} accent="cyan" />
        <StatCard label="Active (Assigned/In Progress)" value={counts.inProgress} icon={<Clock className="w-5 h-5" />} accent="purple" />
        <StatCard label="Evidence Submitted" value={counts.evidence} icon={<CheckCircle2 className="w-5 h-5" />} accent="emerald" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'submitted', 'verified', 'assigned', 'in-progress', 'evidence-uploaded', 'resolved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize',
              filter === f
                ? 'bg-[#17365D] text-white border-[#17365D]'
                : 'bg-white text-gray-600 border-ink-700 hover:border-ink-600',
            )}
          >
            {f === 'all' ? 'All' : complaintStatusBadge(f as Complaint['status']).label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <Panel title="Complaints" subtitle={`${filtered.length} complaint(s)`} noPadding>
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center">
                <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No complaints in this category.</p>
              </div>
            ) : (
              <div className="divide-y divide-ink-700/60 max-h-[600px] overflow-y-auto">
                {filtered.map((c) => {
                  const sb = complaintStatusBadge(c.status);
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectComplaint(c)}
                      className={cn(
                        'w-full text-left px-5 py-3 transition-colors',
                        selected?.id === c.id ? 'bg-[#17365D]/5 border-l-[3px] border-[#17365D]' : 'hover:bg-ink-800/40',
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-gray-500">{c.id.slice(0, 8).toUpperCase()}</span>
                        <Badge variant={sb.variant} dot>{sb.label}</Badge>
                      </div>
                      <p className="text-sm text-[#263445] truncate">{c.location_text || categoryLabel(c.category)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{categoryLabel(c.category)}</span>
                        {c.severity && (
                          <Badge variant={complaintSeverityBadge(c.severity).variant} size="sm">
                            {complaintSeverityBadge(c.severity).label}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <Panel title="Complaint Details" subtitle={`ID: ${selected.id.slice(0, 8).toUpperCase()}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Category</p>
                    <p className="text-sm text-[#263445]">{categoryLabel(selected.category)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</p>
                    <Badge variant={complaintStatusBadge(selected.status).variant} dot>
                      {complaintStatusBadge(selected.status).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Reported On</p>
                    <p className="text-sm text-[#263445]">
                      {new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Severity</p>
                    {selected.severity ? (
                      <Badge variant={complaintSeverityBadge(selected.severity).variant}>
                        {complaintSeverityBadge(selected.severity).label}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-400">Not set</span>
                    )}
                  </div>
                </div>

                {selected.description && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm text-[#263445]">{selected.description}</p>
                  </div>
                )}

                {selected.location_text && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Location</p>
                    <div className="flex items-center gap-1.5 text-sm text-[#263445]">
                      <MapPin className="w-3.5 h-3.5 text-[#168C8C]" />
                      {selected.location_text}
                    </div>
                  </div>
                )}
              </Panel>

              {photos.length > 0 && (
                <Panel title="Citizen Photos" subtitle={`${photos.length} photo(s)`}>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((p) => (
                      <div key={p.id} className="rounded-lg overflow-hidden border border-ink-700">
                        <img src={p.photo_url} alt={p.caption || 'Complaint'} className="w-full h-28 object-cover" />
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              <Panel title="Location Map">
                <CityMap
                  markers={[{
                    lat: selected.lat, lng: selected.lng,
                    label: selected.location_text || 'Complaint', color: '#17365D', radius: 7,
                  }]}
                  height="250px"
                  showHotspotZones={false}
                />
              </Panel>

              {crewTasks.length > 0 && taskPhotos.length > 0 && (
                <Panel title="Crew Evidence Photos" subtitle="Before and after photos uploaded by crew">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Before ({beforePhotos.length})</p>
                      <div className="space-y-2">
                        {beforePhotos.map((p) => (
                          <div key={p.id} className="rounded-lg overflow-hidden border border-ink-700">
                            <img src={p.photo_url} alt="Before" className="w-full h-28 object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">After ({afterPhotos.length})</p>
                      <div className="space-y-2">
                        {afterPhotos.map((p) => (
                          <div key={p.id} className="rounded-lg overflow-hidden border border-ink-700">
                            <img src={p.photo_url} alt="After" className="w-full h-28 object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Panel>
              )}

              <Panel title="Admin Actions" subtitle="Verify, assign, or reject this complaint">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Severity Level</label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high', 'critical'] as ComplaintSeverity[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSeverity(s)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize',
                            severity === s
                              ? 'bg-[#17365D] text-white border-[#17365D]'
                              : 'bg-white text-gray-600 border-ink-700 hover:border-ink-600',
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Admin Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={2}
                      placeholder="Add notes for crew or internal reference..."
                      className="w-full bg-white border border-ink-700 rounded-lg px-4 py-2.5 text-sm text-[#263445] placeholder-gray-400 focus:outline-none focus:border-[#168C8C] transition-colors resize-none"
                    />
                  </div>

                  {(selected.status === 'submitted') && (
                    <div className="flex gap-3">
                      <button
                        onClick={verifyComplaint}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#218838] text-white text-sm font-medium hover:bg-[#1a6e2e] transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        Verify Complaint
                      </button>
                      <button
                        onClick={rejectComplaint}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#C83E3E] text-white text-sm font-medium hover:bg-[#a53030] transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Reject
                      </button>
                    </div>
                  )}

                  {selected.status === 'verified' && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Assign to Crew Member</label>
                      <select
                        value={selectedCrewId}
                        onChange={(e) => setSelectedCrewId(e.target.value)}
                        className="w-full bg-white border border-ink-700 rounded-lg px-4 py-2.5 text-sm text-[#263445] focus:outline-none focus:border-[#168C8C] transition-colors mb-3"
                      >
                        <option value="">Select a crew member...</option>
                        {crewMembers.map((cm) => (
                          <option key={cm.id} value={cm.id}>
                            {cm.full_name || 'Unnamed'} {cm.phone ? `· ${cm.phone}` : ''}
                          </option>
                        ))}
                      </select>
                      {crewMembers.length === 0 && (
                        <p className="text-xs text-gray-500 mb-3">
                          No crew members registered yet. Users with crew role will appear here.
                        </p>
                      )}
                      <button
                        onClick={assignCrew}
                        disabled={actionLoading || !selectedCrewId}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#17365D] text-white text-sm font-medium hover:bg-[#2563A6] transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCog className="w-4 h-4" />}
                        Assign &amp; Create Task
                      </button>
                    </div>
                  )}

                  {(selected.status === 'assigned' || selected.status === 'in-progress') && (
                    <div className="p-3 rounded-lg bg-[#D99A19]/5 border border-[#D99A19]/20">
                      <p className="text-sm text-[#D99A19] flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Waiting for crew to complete the cleanup task.
                      </p>
                      {crewTasks.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Task status: <span className="font-medium capitalize">{crewTasks[0].status.replace('-', ' ')}</span>
                          {crewTasks[0].started_at && ` · Started ${new Date(crewTasks[0].started_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                        </p>
                      )}
                    </div>
                  )}

                  {selected.status === 'evidence-uploaded' && (
                    <button
                      onClick={verifyCompletion}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#218838] text-white text-sm font-medium hover:bg-[#1a6e2e] transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Verify Completion &amp; Mark Resolved
                    </button>
                  )}

                  {selected.status === 'resolved' && (
                    <div className="p-3 rounded-lg bg-[#218838]/5 border border-[#218838]/20">
                      <p className="text-sm text-[#218838] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        This complaint has been resolved.
                      </p>
                    </div>
                  )}

                  {selected.status === 'rejected' && (
                    <div className="p-3 rounded-lg bg-[#C83E3E]/5 border border-[#C83E3E]/20">
                      <p className="text-sm text-[#C83E3E] flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        This complaint was rejected.
                      </p>
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          ) : (
            <Panel title="Select a Complaint" subtitle="Choose a complaint from the list to review">
              <div className="py-12 text-center">
                <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Click on a complaint to review citizen photos, verify, assign crew, and track resolution.
                </p>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
