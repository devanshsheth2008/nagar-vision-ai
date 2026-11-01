import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { CityMap } from '@/components/map/CityMap';
import { complaintStatusBadge, complaintSeverityBadge, categoryLabel } from '@/lib/complaintBadges';
import { ClipboardList, Clock, MapPin, Camera } from 'lucide-react';
import type { Complaint, ComplaintPhoto } from '@/types';

export function TrackComplaints() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [photos, setPhotos] = useState<ComplaintPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('complaints')
      .select('id, citizen_id, category, description, location_text, lat, lng, status, severity, admin_notes, created_at, updated_at')
      .eq('citizen_id', user.id)
      .neq('status', 'resolved')
      .neq('status', 'rejected')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setComplaints((data as Complaint[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (selectedId && complaints.length > 0) {
      const c = complaints.find((c) => c.id === selectedId);
      if (c) selectComplaint(c);
    }
  }, [selectedId, complaints]);

  const selectComplaint = (c: Complaint) => {
    setSelected(c);
    supabase
      .from('complaint_photos')
      .select('id, complaint_id, photo_url, caption, created_at')
      .eq('complaint_id', c.id)
      .then(({ data }) => setPhotos((data as ComplaintPhoto[]) ?? []));
  };

  const workflowSteps = ['submitted', 'verified', 'assigned', 'in-progress', 'evidence-uploaded', 'resolved'];
  const currentStep = selected ? workflowSteps.indexOf(selected.status) : -1;

  return (
    <div>
      <PageHeader
        title="Track Complaints"
        description="Monitor the status of your active complaints."
        icon={<ClipboardList className="w-5 h-5" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <Panel title="Active Complaints" subtitle="Pending and in-progress" noPadding>
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading...</div>
            ) : complaints.length === 0 ? (
              <div className="p-6 text-center">
                <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active complaints.</p>
              </div>
            ) : (
              <div className="divide-y divide-ink-700/60 max-h-[500px] overflow-y-auto">
                {complaints.map((c) => {
                  const sb = complaintStatusBadge(c.status);
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectComplaint(c)}
                      className={`w-full text-left px-5 py-3 transition-colors ${
                        selected?.id === c.id ? 'bg-[#168C8C]/5 border-l-3 border-[#168C8C]' : 'hover:bg-ink-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-gray-500">{c.id.slice(0, 8).toUpperCase()}</span>
                        <Badge variant={sb.variant} dot>{sb.label}</Badge>
                      </div>
                      <p className="text-sm text-[#263445] truncate">{c.location_text || categoryLabel(c.category)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
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
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Severity</p>
                    {selected.severity ? (
                      <Badge variant={complaintSeverityBadge(selected.severity).variant}>
                        {complaintSeverityBadge(selected.severity).label}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-400">Pending review</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Reported On</p>
                    <p className="text-sm text-[#263445]">
                      {new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
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

                {selected.admin_notes && (
                  <div className="p-3 rounded-lg bg-[#17365D]/5 border border-[#17365D]/10 mb-4">
                    <p className="text-xs font-medium text-[#17365D] uppercase tracking-wider mb-1">Admin Notes</p>
                    <p className="text-sm text-[#263445]">{selected.admin_notes}</p>
                  </div>
                )}
              </Panel>

              <Panel title="Workflow Progress" subtitle="Track your complaint through the resolution pipeline">
                <div className="flex items-center justify-between">
                  {workflowSteps.map((step, i) => {
                    const isActive = i <= currentStep;
                    const label = complaintStatusBadge(step as Complaint['status']).label;
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isActive ? 'bg-[#168C8C] text-white' : 'bg-ink-800 text-gray-400'
                            }`}
                          >
                            {i + 1}
                          </div>
                          <span className={`text-[10px] mt-1 text-center ${isActive ? 'text-[#168C8C] font-medium' : 'text-gray-400'}`}>
                            {label}
                          </span>
                        </div>
                        {i < workflowSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? 'bg-[#168C8C]' : 'bg-ink-700'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Panel>

              {photos.length > 0 && (
                <Panel title="Photos" subtitle={`${photos.length} photo(s) attached`}>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((p) => (
                      <div key={p.id} className="rounded-lg overflow-hidden border border-ink-700">
                        <img src={p.photo_url} alt={p.caption || 'Complaint photo'} className="w-full h-28 object-cover" />
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              <Panel title="Location Map">
                <CityMap
                  markers={[{ lat: selected.lat, lng: selected.lng, label: selected.location_text || 'Complaint location', color: '#168C8C', radius: 7 }]}
                  height="280px"
                  showHotspotZones={false}
                />
              </Panel>
            </div>
          ) : (
            <Panel title="Select a Complaint" subtitle="Choose a complaint from the list to view details">
              <div className="py-12 text-center">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Click on a complaint to see its full details and tracking progress.</p>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
