import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  AlertTriangle, MapPin, Trash2, CheckCircle2, Camera, Target,
  Activity, ArrowRight, Radio, Clock,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { CityMap } from '@/components/map/CityMap';
import {
  stats, dailyIncidentTrend, weeklyGarbageDetection,
  monthlyCleanupPerformance, wasteDistribution, incidents,
  hotspots, cleanupOperations, cameras,
} from '@/data/mockData';
import { severityBadge, statusBadge, cameraStatusBadge } from '@/lib/badges';
import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

const chartTooltipStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: '8px',
  fontSize: '12px',
};

export function CommandCenter() {
  return (
    <div>
      <PageHeader
        title="Command Center"
        description="Real-time overview of municipal waste intelligence operations"
        icon={<LayoutDashboard className="w-5 h-5" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total Incidents" value={stats.totalIncidents.toLocaleString()} icon={<AlertTriangle className="w-5 h-5" />} trend={{ value: '+8.2%', direction: 'up' }} accent="emerald" />
        <StatCard label="Active Hotspots" value={stats.activeHotspots} icon={<MapPin className="w-5 h-5" />} trend={{ value: '+3', direction: 'up' }} accent="red" />
        <StatCard label="Pending Cleanup" value={stats.pendingCleanup} icon={<Trash2 className="w-5 h-5" />} trend={{ value: '-12%', direction: 'down' }} accent="amber" />
        <StatCard label="Resolved" value={stats.resolvedIncidents.toLocaleString()} icon={<CheckCircle2 className="w-5 h-5" />} trend={{ value: '+15.3%', direction: 'up' }} accent="cyan" />
        <StatCard label="Cameras" value={stats.registeredCameras} icon={<Camera className="w-5 h-5" />} sublabel="82 online · 1 offline · 1 maint." accent="purple" />
        <StatCard label="Detection Accuracy" value={`${stats.detectionAccuracy}%`} icon={<Target className="w-5 h-5" />} trend={{ value: '+0.8%', direction: 'up' }} accent="emerald" sublabel="Based on 2,847 evaluated detections" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Panel title="Daily Incident Trends" subtitle="Incidents detected vs resolved (past 7 days)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dailyIncidentTrend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: 'rgba(0,0,0,0.08)' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="incidents" name="Incidents" stroke="#C83E3E" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#218838" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Weekly Garbage Detection" subtitle="Detections by waste category">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyGarbageDetection} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: 'rgba(0,0,0,0.08)' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="garbage" name="Garbage" fill="#218838" radius={[3, 3, 0, 0]} />
              <Bar dataKey="plastic" name="Plastic" fill="#168C8C" radius={[3, 3, 0, 0]} />
              <Bar dataKey="debris" name="Debris" fill="#D99A19" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Panel title="Monthly Cleanup Performance" subtitle="Scheduled vs completed">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyCleanupPerformance} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: 'rgba(0,0,0,0.08)' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="scheduled" name="Scheduled" fill="#94A3B8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#168C8C" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Waste Distribution" subtitle="By category (total volume)">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={wasteDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
              >
                {wasteDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Critical Alerts" subtitle="Highest priority items" noPadding>
          <div className="divide-y divide-ink-700/60 max-h-[240px] overflow-y-auto">
            {incidents.filter(i => i.severity === 'critical').map((inc) => {
              const sb = severityBadge(inc.severity);
              return (
                <div key={inc.id} className="px-5 py-3 hover:bg-ink-800/40 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-red mt-1.5 shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#263445] truncate">{inc.location}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{inc.category} · {inc.cameraId}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant={sb.variant}>{sb.label}</Badge>
                        <span className="text-[10px] text-gray-500">
                          {new Date(inc.detectedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Panel title="Recent Incidents" subtitle="Latest detections" noPadding
          action={<Link to="/incidents" className="text-xs text-neon-cyan hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>}
        >
          <div className="divide-y divide-ink-700/60 max-h-[300px] overflow-y-auto">
            {incidents.slice(0, 6).map((inc) => {
              const sb = severityBadge(inc.severity);
              const stb = statusBadge(inc.status);
              return (
                <div key={inc.id} className="px-5 py-3 hover:bg-ink-800/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-gray-500">{inc.id}</span>
                    <Badge variant={stb.variant} dot>{stb.label}</Badge>
                  </div>
                  <p className="text-sm text-[#263445] truncate">{inc.location}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant={sb.variant}>{sb.label}</Badge>
                    <span className="text-xs text-gray-500">{inc.category}</span>
                    <span className="text-xs text-gray-500 ml-auto">{inc.confidence}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Camera Status" subtitle="Live monitoring network" noPadding
          action={<Link to="/monitoring" className="text-xs text-neon-cyan hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>}
        >
          <div className="divide-y divide-ink-700/60 max-h-[300px] overflow-y-auto">
            {cameras.map((cam) => {
              const csb = cameraStatusBadge(cam.status);
              return (
                <div key={cam.id} className="px-5 py-3 flex items-center gap-3 hover:bg-ink-800/40 transition-colors">
                  <div className="relative">
                    <Camera className="w-4 h-4 text-gray-500" />
                    {cam.status === 'online' && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-neon-emerald" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#263445] truncate">{cam.name}</p>
                    <p className="text-xs text-gray-500">{cam.id} · {cam.zone}</p>
                  </div>
                  <Badge variant={csb.variant} dot>{csb.label}</Badge>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Recent Cleanup Activities" subtitle="Field operations" noPadding
          action={<Link to="/cleanup" className="text-xs text-neon-cyan hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>}
        >
          <div className="divide-y divide-ink-700/60 max-h-[300px] overflow-y-auto">
            {cleanupOperations.map((op) => {
              const variant = op.status === 'completed' ? 'emerald' : op.status === 'in-progress' ? 'cyan' : op.status === 'overdue' ? 'red' : 'amber';
              return (
                <div key={op.id} className="px-5 py-3 hover:bg-ink-800/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-gray-500">{op.id}</span>
                    <Badge variant={variant} dot>{op.status}</Badge>
                  </div>
                  <p className="text-sm text-[#263445] truncate">{op.location}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{op.officer} · {op.crewSize} crew · {op.wasteCollected}t</p>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Hotspot Preview Map" subtitle="Active waste accumulation zones in Gandhidham"
            action={<Link to="/hotspots" className="text-xs text-neon-cyan hover:underline flex items-center gap-1">Open map <ArrowRight className="w-3 h-3" /></Link>}
          >
            <CityMap hotspots={hotspots} height="380px" />
          </Panel>
        </div>

        <Panel title="System Activity" subtitle="Live operation feed">
          <div className="space-y-3">
            {[
              { icon: Radio, color: 'text-neon-emerald', text: 'CAM-001 streaming', time: 'Now' },
              { icon: AlertTriangle, color: 'text-neon-red', text: 'New incident INC-1042', time: '2m ago' },
              { icon: CheckCircle2, color: 'text-neon-cyan', text: 'CLN-3199 completed', time: '15m ago' },
              { icon: Activity, color: 'text-neon-amber', text: 'AI model batch processed', time: '28m ago' },
              { icon: Camera, color: 'text-neon-red', text: 'CAM-018 went offline', time: '3h ago' },
              { icon: Clock, color: 'text-gray-500', text: 'Officer shift started', time: '4h ago' },
            ].map((act, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <act.icon className={`w-4 h-4 ${act.color} shrink-0`} />
                <span className="text-[#64748B] flex-1">{act.text}</span>
                <span className="text-xs text-gray-500">{act.time}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
