import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { CityMap } from '@/components/map/CityMap';
import { crewTaskStatusBadge, categoryLabel, complaintStatusBadge } from '@/lib/complaintBadges';
import {
  ClipboardList, MapPin, Camera, Play, CheckCircle, X,
  Loader2, ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CrewTask, Complaint, TaskPhoto } from '@/types';

interface TaskWithComplaint extends CrewTask {
  complaint: Complaint;
}

export function CrewTasks() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  const [tasks, setTasks] = useState<TaskWithComplaint[]>([]);
  const [selected, setSelected] = useState<TaskWithComplaint | null>(null);
  const [photos, setPhotos] = useState<TaskPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoTypeRef = useRef<'before' | 'after'>('before');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('crew_tasks')
      .select(`
        id, complaint_id, crew_id, status, assigned_at, started_at, completed_at, verified_at, admin_notes, created_at,
        complaint:complaints(id, citizen_id, category, description, location_text, lat, lng, status, severity, admin_notes, created_at, updated_at)
      `)
      .eq('crew_id', user.id)
      .neq('status', 'verified')
      .order('assigned_at', { ascending: false })
      .then(({ data }) => {
        setTasks((data as unknown as TaskWithComplaint[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (selectedId && tasks.length > 0) {
      const t = tasks.find((t) => t.id === selectedId);
      if (t) selectTask(t);
    }
  }, [selectedId, tasks]);

  const selectTask = (t: TaskWithComplaint) => {
    setSelected(t);
    supabase
      .from('task_photos')
      .select('id, task_id, photo_url, photo_type, caption, created_at')
      .eq('task_id', t.id)
      .then(({ data }) => setPhotos((data as TaskPhoto[]) ?? []));
  };

  const updateStatus = async (newStatus: 'in-progress' | 'completed') => {
    if (!selected || !user) return;
    setUpdating(true);
    const updates: Record<string, string> = { status: newStatus };
    if (newStatus === 'in-progress' && !selected.started_at) {
      updates.started_at = new Date().toISOString();
    }
    if (newStatus === 'completed' && !selected.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase.from('crew_tasks').update(updates).eq('id', selected.id);
    if (!error) {
      const updated = { ...selected, ...updates } as TaskWithComplaint;
      setSelected(updated);
      setTasks((prev) => prev.map((t) => (t.id === selected.id ? updated : t)));

      if (newStatus === 'completed') {
        await supabase.from('complaints').update({ status: 'evidence-uploaded' }).eq('id', selected.complaint_id);
      } else if (newStatus === 'in-progress') {
        await supabase.from('complaints').update({ status: 'in-progress' }).eq('id', selected.complaint_id);
      }
    }
    setUpdating(false);
  };

  const handlePhotoUpload = (type: 'before' | 'after') => {
    photoTypeRef.current = type;
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    setUploadingPhoto(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const { error } = await supabase.from('task_photos').insert({
        task_id: selected.id,
        photo_url: reader.result as string,
        photo_type: photoTypeRef.current,
      });
      if (!error) {
        supabase
          .from('task_photos')
          .select('id, task_id, photo_url, photo_type, caption, created_at')
          .eq('task_id', selected.id)
          .then(({ data }) => setPhotos((data as TaskPhoto[]) ?? []));
      }
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const beforePhotos = photos.filter((p) => p.photo_type === 'before');
  const afterPhotos = photos.filter((p) => p.photo_type === 'after');

  return (
    <div>
      <PageHeader
        title="Assigned Tasks"
        description="View and manage your cleanup tasks."
        icon={<ClipboardList className="w-5 h-5" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <Panel title="My Tasks" subtitle="Active assignments" noPadding>
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading...</div>
            ) : tasks.length === 0 ? (
              <div className="p-6 text-center">
                <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active tasks.</p>
              </div>
            ) : (
              <div className="divide-y divide-ink-700/60 max-h-[600px] overflow-y-auto">
                {tasks.map((t) => {
                  const sb = crewTaskStatusBadge(t.status);
                  return (
                    <button
                      key={t.id}
                      onClick={() => selectTask(t)}
                      className={cn(
                        'w-full text-left px-5 py-3 transition-colors',
                        selected?.id === t.id ? 'bg-[#218838]/5 border-l-[3px] border-[#218838]' : 'hover:bg-ink-800/40',
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-gray-500">{t.id.slice(0, 8).toUpperCase()}</span>
                        <Badge variant={sb.variant} dot>{sb.label}</Badge>
                      </div>
                      <p className="text-sm text-[#263445] truncate">
                        {t.complaint?.location_text || categoryLabel(t.complaint?.category || 'other')}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(t.assigned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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
              <Panel title="Task Details" subtitle={`Task ID: ${selected.id.slice(0, 8).toUpperCase()}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Complaint</p>
                    <p className="text-sm text-[#263445]">{categoryLabel(selected.complaint?.category || 'other')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Task Status</p>
                    <Badge variant={crewTaskStatusBadge(selected.status).variant} dot>
                      {crewTaskStatusBadge(selected.status).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Complaint Status</p>
                    <Badge variant={complaintStatusBadge(selected.complaint?.status || 'submitted').variant}>
                      {complaintStatusBadge(selected.complaint?.status || 'submitted').label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Assigned</p>
                    <p className="text-sm text-[#263445]">
                      {new Date(selected.assigned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {selected.complaint?.description && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm text-[#263445]">{selected.complaint.description}</p>
                  </div>
                )}

                {selected.complaint?.location_text && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Location</p>
                    <div className="flex items-center gap-1.5 text-sm text-[#263445]">
                      <MapPin className="w-3.5 h-3.5 text-[#218838]" />
                      {selected.complaint.location_text}
                    </div>
                  </div>
                )}

                {selected.admin_notes && (
                  <div className="p-3 rounded-lg bg-[#17365D]/5 border border-[#17365D]/10">
                    <p className="text-xs font-medium text-[#17365D] uppercase tracking-wider mb-1">Admin Instructions</p>
                    <p className="text-sm text-[#263445]">{selected.admin_notes}</p>
                  </div>
                )}
              </Panel>

              <Panel title="Location Map">
                <CityMap
                  markers={[{
                    lat: selected.complaint?.lat || 23.0733,
                    lng: selected.complaint?.lng || 70.1306,
                    label: selected.complaint?.location_text || 'Task location',
                    color: '#218838',
                    radius: 7,
                  }]}
                  height="250px"
                  showHotspotZones={false}
                />
              </Panel>

              <Panel title="Evidence Photos" subtitle="Upload before and after photos">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileSelected}
                  className="hidden"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Before Cleanup</p>
                      <button
                        onClick={() => handlePhotoUpload('before')}
                        disabled={uploadingPhoto}
                        className="flex items-center gap-1 text-xs text-[#168C8C] hover:underline disabled:opacity-50"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Upload
                      </button>
                    </div>
                    <div className="space-y-2">
                      {beforePhotos.length === 0 ? (
                        <div className="h-32 rounded-lg border-2 border-dashed border-ink-700 flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon className="w-6 h-6 mb-1" />
                          <span className="text-xs">No photos</span>
                        </div>
                      ) : (
                        beforePhotos.map((p) => (
                          <div key={p.id} className="rounded-lg overflow-hidden border border-ink-700">
                            <img src={p.photo_url} alt="Before" className="w-full h-32 object-cover" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">After Cleanup</p>
                      <button
                        onClick={() => handlePhotoUpload('after')}
                        disabled={uploadingPhoto}
                        className="flex items-center gap-1 text-xs text-[#168C8C] hover:underline disabled:opacity-50"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Upload
                      </button>
                    </div>
                    <div className="space-y-2">
                      {afterPhotos.length === 0 ? (
                        <div className="h-32 rounded-lg border-2 border-dashed border-ink-700 flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon className="w-6 h-6 mb-1" />
                          <span className="text-xs">No photos</span>
                        </div>
                      ) : (
                        afterPhotos.map((p) => (
                          <div key={p.id} className="rounded-lg overflow-hidden border border-ink-700">
                            <img src={p.photo_url} alt="After" className="w-full h-32 object-cover" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                {uploadingPhoto && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading photo...
                  </div>
                )}
              </Panel>

              <div className="flex gap-3">
                {selected.status === 'assigned' && (
                  <button
                    onClick={() => updateStatus('in-progress')}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#168C8C] text-white text-sm font-medium hover:bg-[#147272] transition-colors disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Start Task
                  </button>
                )}
                {(selected.status === 'assigned' || selected.status === 'in-progress') && (
                  <button
                    onClick={() => updateStatus('completed')}
                    disabled={updating || beforePhotos.length === 0 || afterPhotos.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#218838] text-white text-sm font-medium hover:bg-[#1a6e2e] transition-colors disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Mark Completed
                  </button>
                )}
                {selected.status === 'completed' && (
                  <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#218838]/10 border border-[#218838]/20 text-[#218838] text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Task completed — awaiting admin verification
                  </div>
                )}
              </div>
              {selected.status !== 'completed' && (beforePhotos.length === 0 || afterPhotos.length === 0) && (
                <p className="text-xs text-gray-500 text-center">
                  Both before and after photos are required to mark a task as completed.
                </p>
              )}
            </div>
          ) : (
            <Panel title="Select a Task" subtitle="Choose a task from the list to view details">
              <div className="py-12 text-center">
                <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Click on a task to see its details and upload evidence photos.</p>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
