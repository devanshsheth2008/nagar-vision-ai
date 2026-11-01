import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { LocationPicker } from '@/components/map/LocationPicker';
import { complaintCategories, categoryLabel } from '@/lib/complaintBadges';
import { GANDHIDHAM_CENTER } from '@/data/mockData';
import {
  AlertTriangle, Camera, MapPin, Send, Loader2, CheckCircle2, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComplaintCategory } from '@/types';

export function ReportGarbage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<ComplaintCategory>('garbage-pile');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [lat, setLat] = useState(GANDHIDHAM_CENTER[0]);
  const [lng, setLng] = useState(GANDHIDHAM_CENTER[1]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!description.trim() && !locationText.trim()) {
      setError('Please provide a description or location.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from('complaints')
      .insert({
        citizen_id: user.id,
        category,
        description: description.trim(),
        location_text: locationText.trim(),
        lat,
        lng,
        status: 'submitted',
      })
      .select('id')
      .single();

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    const complaintId = data.id;

    for (const photo of photos) {
      await supabase.from('complaint_photos').insert({
        complaint_id: complaintId,
        photo_url: photo,
      });
    }

    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => navigate('/citizen/track'), 1500);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-[#218838]/10 border border-[#218838]/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-[#218838]" />
        </div>
        <h2 className="text-lg font-bold text-[#263445]">Complaint Submitted!</h2>
        <p className="text-sm text-gray-500 mt-2">Your report has been received. An admin will review it shortly.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Report Garbage"
        description="Submit a waste complaint with photos and location."
        icon={<AlertTriangle className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Panel title="Complaint Details" subtitle="What type of waste did you spot?">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Waste Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {complaintCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left',
                        category === cat
                          ? 'bg-[#168C8C]/10 text-[#168C8C] border-[#168C8C]/30'
                          : 'bg-white text-gray-600 border-ink-700 hover:border-ink-600',
                      )}
                    >
                      {categoryLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the waste issue (e.g., large garbage pile near the bus stop)..."
                  className="w-full bg-white border border-ink-700 rounded-lg px-4 py-2.5 text-sm text-[#263445] placeholder-gray-400 focus:outline-none focus:border-[#168C8C] transition-colors resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Location / Landmark</label>
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="e.g., Near Sector 5 Bus Stop, Gandhidham"
                  className="w-full bg-white border border-ink-700 rounded-lg px-4 py-2.5 text-sm text-[#263445] placeholder-gray-400 focus:outline-none focus:border-[#168C8C] transition-colors"
                />
              </div>
            </div>
          </Panel>

          <Panel title="Photos" subtitle="Upload photos of the waste (optional but recommended)">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-ink-700">
                  <img src={photo} alt={`Upload ${i + 1}`} className="w-full h-24 object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#C83E3E] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-24 rounded-lg border-2 border-dashed border-ink-700 hover:border-[#168C8C] flex flex-col items-center justify-center text-gray-400 hover:text-[#168C8C] transition-colors"
              >
                <Camera className="w-5 h-5 mb-1" />
                <span className="text-xs">Add Photo</span>
              </button>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Location on Map" subtitle="Click the map to pin the exact location">
            <LocationPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} height="350px" />
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-[#168C8C]" />
              Selected: {lat.toFixed(4)}, {lng.toFixed(4)}
            </div>
          </Panel>

          {error && (
            <div className="p-3 rounded-lg bg-[#C83E3E]/5 border border-[#C83E3E]/20">
              <p className="text-xs text-[#C83E3E]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#17365D] text-white text-sm font-medium hover:bg-[#2563A6] transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Complaint
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
