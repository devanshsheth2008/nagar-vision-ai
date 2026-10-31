import { useState } from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus, Flame, Target, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { CityMap } from '@/components/map/CityMap';
import { hotspots, dailyIncidentTrend } from '@/data/mockData';
import { severityBadge } from '@/lib/badges';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const trendIcon = {
  rising: { icon: TrendingUp, color: 'text-neon-red', variant: 'red' as const },
  stable: { icon: Minus, color: 'text-neon-amber', variant: 'amber' as const },
  declining: { icon: TrendingDown, color: 'text-neon-emerald', variant: 'emerald' as const },
};

export function HotspotIntelligence() {
  const [selected, setSelected] = useState(hotspots[0]);

  const heatmapData = hotspots.map((hs) => ({
    name: hs.location.split(',')[0],
    incidents: hs.incidentCount,
    severity: hs.severity,
  }));

  return (
    <div>
      <PageHeader
        title="Hotspot Intelligence"
        description="Predictive analysis of waste accumulation zones"
        icon={<MapPin className="w-5 h-5" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Hotspots</p>
            <Flame className="w-4 h-4 text-neon-red" />
          </div>
          <p className="text-3xl font-bold text-[#263445] font-mono mt-2">{hotspots.length}</p>
        </div>
        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Critical Zones</p>
            <Target className="w-4 h-4 text-neon-red" />
          </div>
          <p className="text-3xl font-bold text-neon-red font-mono mt-2">{hotspots.filter(h => h.severity === 'critical').length}</p>
        </div>
        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Rising Trends</p>
            <TrendingUp className="w-4 h-4 text-neon-amber" />
          </div>
          <p className="text-3xl font-bold text-neon-amber font-mono mt-2">{hotspots.filter(h => h.trend === 'rising').length}</p>
        </div>
        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Declining</p>
            <TrendingDown className="w-4 h-4 text-neon-emerald" />
          </div>
          <p className="text-3xl font-bold text-neon-emerald font-mono mt-2">{hotspots.filter(h => h.trend === 'declining').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <Panel title="Hotspot Map" subtitle="Interactive zone intelligence - Gandhidham">
            <CityMap hotspots={hotspots} height="460px" />
          </Panel>
        </div>

        <Panel title="Hotspot List" subtitle="Click to inspect" noPadding>
          <div className="divide-y divide-ink-700/60 max-h-[460px] overflow-y-auto">
            {hotspots.map((hs) => {
              const sb = severityBadge(hs.severity);
              const t = trendIcon[hs.trend];
              return (
                <button
                  key={hs.id}
                  onClick={() => setSelected(hs)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-ink-800/40 transition-colors',
                    selected.id === hs.id && 'bg-neon-emerald/[0.03]',
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-gray-500">{hs.id}</span>
                    <Badge variant={sb.variant} dot>{sb.label}</Badge>
                  </div>
                  <p className="text-sm text-[#263445] truncate">{hs.location}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-500">{hs.incidentCount} incidents</span>
                    <div className={cn('flex items-center gap-1', t.color)}>
                      <t.icon className="w-3 h-3" />
                      <span className="text-xs capitalize">{hs.trend}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Hotspot Details" subtitle={selected.id}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-lg text-[#263445] font-medium mt-0.5">{selected.location}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-ink-800/40 rounded-lg p-3 border border-ink-700/60">
                <p className="text-xs text-gray-500">Incidents</p>
                <p className="text-xl font-bold text-[#263445] font-mono mt-1">{selected.incidentCount}</p>
              </div>
              <div className="bg-ink-800/40 rounded-lg p-3 border border-ink-700/60">
                <p className="text-xs text-gray-500">Radius</p>
                <p className="text-xl font-bold text-[#263445] font-mono mt-1">{selected.radius}m</p>
              </div>
              <div className="bg-ink-800/40 rounded-lg p-3 border border-ink-700/60">
                <p className="text-xs text-gray-500">Last Incident</p>
                <p className="text-xs text-[#64748B] mt-1">
                  {new Date(selected.lastIncident).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Trend:</span>
              <Badge variant={trendIcon[selected.trend].variant} dot>{selected.trend}</Badge>
              <span className="text-xs text-gray-500">Severity:</span>
              <Badge variant={severityBadge(selected.severity).variant} dot>{severityBadge(selected.severity).label}</Badge>
            </div>
          </div>
        </Panel>

        <Panel title="Incident Heat" subtitle="Incident count by zone">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={heatmapData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={{ stroke: 'rgba(0,0,0,0.08)' }} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="incidents" name="Incidents" fill="#218838" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
