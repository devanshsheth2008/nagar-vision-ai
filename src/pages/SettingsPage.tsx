import { useState } from 'react';
import {
  Settings as SettingsIcon, Bell, Shield, Database, Eye, Cpu, Globe,
  Save, HardDrive, Wifi, Server, Camera, AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface ToggleProps {
  label: string;
  description: string;
  defaultOn?: boolean;
}

function Toggle({ label, description, defaultOn = false }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-[#263445]">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0',
          on ? 'bg-neon-emerald/30' : 'bg-ink-600',
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-200',
            on ? 'translate-x-5 bg-neon-emerald' : 'bg-gray-400',
          )}
        />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const [detectionThreshold, setDetectionThreshold] = useState(75);
  const [ocrThreshold, setOcrThreshold] = useState(85);
  const [scanInterval, setScanInterval] = useState(30);
  const [retentionDays, setRetentionDays] = useState(90);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="System configuration and operational parameters"
        icon={<SettingsIcon className="w-5 h-5" />}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-emerald/10 border border-neon-emerald/20 text-neon-emerald text-sm font-medium hover:bg-neon-emerald/20 transition-colors">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Detection Configuration" subtitle="AI model parameters">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#263445]">Detection Confidence Threshold</label>
                <span className="text-sm font-mono text-neon-emerald">{detectionThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={detectionThreshold}
                onChange={(e) => setDetectionThreshold(Number(e.target.value))}
                className="w-full accent-neon-emerald"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum confidence for incident creation</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#263445]">OCR Confidence Threshold</label>
                <span className="text-sm font-mono text-neon-cyan">{ocrThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={ocrThreshold}
                onChange={(e) => setOcrThreshold(Number(e.target.value))}
                className="w-full accent-neon-cyan"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum confidence for auto-verification</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#263445]">Camera Scan Interval</label>
                <span className="text-sm font-mono text-neon-amber">{scanInterval}s</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={scanInterval}
                onChange={(e) => setScanInterval(Number(e.target.value))}
                className="w-full accent-neon-amber"
              />
              <p className="text-xs text-gray-500 mt-1">Time between automated scans per camera</p>
            </div>
          </div>
        </Panel>

        <Panel title="Data Management" subtitle="Storage and retention policies">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#263445]">Data Retention Period</label>
                <span className="text-sm font-mono text-neon-cyan">{retentionDays} days</span>
              </div>
              <input
                type="range"
                min="30"
                max="365"
                step="15"
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-full accent-neon-cyan"
              />
              <p className="text-xs text-gray-500 mt-1">How long incident records are stored</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-ink-800/40 rounded-lg p-3 border border-ink-700/60">
                <div className="flex items-center gap-2 mb-1">
                  <HardDrive className="w-4 h-4 text-neon-emerald" />
                  <span className="text-xs text-gray-500">Storage Used</span>
                </div>
                <p className="text-lg font-bold text-[#263445] font-mono">247 GB</p>
                <p className="text-[10px] text-gray-500">of 1 TB</p>
              </div>
              <div className="bg-ink-800/40 rounded-lg p-3 border border-ink-700/60">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-neon-cyan" />
                  <span className="text-xs text-gray-500">Records</span>
                </div>
                <p className="text-lg font-bold text-[#263445] font-mono">12,847</p>
                <p className="text-[10px] text-gray-500">total in database</p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Notifications" subtitle="Alert preferences">
          <div className="divide-y divide-ink-700/60">
            <Toggle label="Critical Incident Alerts" description="Immediate notification for critical severity detections" defaultOn={true} />
            <Toggle label="Camera Offline Warnings" description="Alert when a camera goes offline for 5+ minutes" defaultOn={true} />
            <Toggle label="New Hotspot Detection" description="Notify when a new hotspot trend is identified" defaultOn={true} />
            <Toggle label="Cleanup Completion" description="Notification when a cleanup operation is completed" defaultOn={false} />
            <Toggle label="Daily Summary Report" description="Email digest of daily operations at 6:00 PM" defaultOn={true} />
            <Toggle label="Officer Assignment" description="Alert officers when assigned to a new incident" defaultOn={true} />
          </div>
        </Panel>

        <Panel title="System Status" subtitle="Infrastructure health">
          <div className="space-y-3">
            {[
              { icon: Server, label: 'API Server', status: 'Operational', variant: 'emerald' as const },
              { icon: Database, label: 'Database (Supabase)', status: 'Connected', variant: 'emerald' as const },
              { icon: Cpu, label: 'AI Inference Engine', status: 'Demo Mode', variant: 'amber' as const },
              { icon: Camera, label: 'Camera Network', status: '82 of 84 Online', variant: 'emerald' as const },
              { icon: Wifi, label: 'Network Gateway', status: 'Operational', variant: 'emerald' as const },
              { icon: Globe, label: 'Map Service (OSM)', status: 'Connected', variant: 'emerald' as const },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-2">
                <item.icon className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-sm text-[#64748B] flex-1">{item.label}</span>
                <Badge variant={item.variant} dot>{item.status}</Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Security" subtitle="Access control settings">
          <div className="divide-y divide-ink-700/60">
            <Toggle label="Two-Factor Authentication" description="Require 2FA for all officer accounts" defaultOn={true} />
            <Toggle label="Session Timeout" description="Auto-logout after 30 minutes of inactivity" defaultOn={true} />
            <Toggle label="Audit Logging" description="Log all administrative actions" defaultOn={true} />
            <Toggle label="IP Allowlisting" description="Restrict access to municipal network IPs" defaultOn={false} />
          </div>
        </Panel>

        <Panel title="Municipal Configuration" subtitle="Organization details">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">Organization</label>
              <p className="text-sm text-[#263445] mt-1">Gandhidham Municipal Corporation</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">City</label>
                <p className="text-sm text-[#263445] mt-1">Gandhidham</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">State</label>
                <p className="text-sm text-[#263445] mt-1">Gujarat, India</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Timezone</label>
                <p className="text-sm text-[#263445] mt-1">IST (UTC+5:30)</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Coverage Zones</label>
                <p className="text-sm text-[#263445] mt-1">5 Zones</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-neon-amber/5 border border-neon-amber/15">
              <AlertTriangle className="w-4 h-4 text-neon-amber shrink-0" />
              <p className="text-xs text-gray-400">
                Database schema is Supabase-ready. Tables for incidents, cameras, vehicles, officers, and cleanup operations are prepared for migration.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
