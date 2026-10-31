import { Trash2, Users, Clock, MapPin, Truck, Calendar, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { cleanupOperations, monthlyCleanupPerformance } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const chartTooltipStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: '8px',
  fontSize: '12px',
};

const statusConfig: Record<string, { variant: 'emerald' | 'cyan' | 'amber' | 'red'; label: string }> = {
  completed: { variant: 'emerald', label: 'Completed' },
  'in-progress': { variant: 'cyan', label: 'In Progress' },
  scheduled: { variant: 'amber', label: 'Scheduled' },
  overdue: { variant: 'red', label: 'Overdue' },
};

export function CleanupOperations() {
  const totalWaste = cleanupOperations.reduce((a, o) => a + o.wasteCollected, 0);
  const completed = cleanupOperations.filter(o => o.status === 'completed').length;
  const active = cleanupOperations.filter(o => o.status === 'in-progress').length;
  const scheduled = cleanupOperations.filter(o => o.status === 'scheduled').length;

  return (
    <div>
      <PageHeader
        title="Cleanup Operations"
        description="Field crew deployment and waste collection tracking"
        icon={<Trash2 className="w-5 h-5" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Waste Collected</p>
            <Trash2 className="w-4 h-4 text-neon-emerald" />
          </div>
          <p className="text-2xl font-bold text-[#263445] font-mono mt-2">{totalWaste.toFixed(1)}t</p>
        </div>
        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Completed</p>
            <CheckCircle2 className="w-4 h-4 text-neon-emerald" />
          </div>
          <p className="text-2xl font-bold text-neon-emerald font-mono mt-2">{completed}</p>
        </div>
        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider">In Progress</p>
            <Clock className="w-4 h-4 text-neon-cyan" />
          </div>
          <p className="text-2xl font-bold text-neon-cyan font-mono mt-2">{active}</p>
        </div>
        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Scheduled</p>
            <Calendar className="w-4 h-4 text-neon-amber" />
          </div>
          <p className="text-2xl font-bold text-neon-amber font-mono mt-2">{scheduled}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <Panel title="Cleanup Performance" subtitle="Monthly scheduled vs completed operations">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyCleanupPerformance} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#168C8C" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#168C8C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradScheduled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: 'rgba(0,0,0,0.08)' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="scheduled" name="Scheduled" stroke="#94A3B8" strokeWidth={2} fill="url(#gradScheduled)" />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#168C8C" strokeWidth={2} fill="url(#gradCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        <Panel title="Waste by Truck" subtitle="Collection distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={[
              { truck: 'TRK-08', waste: 5.6 },
              { truck: 'TRK-05', waste: 3.3 },
              { truck: 'TRK-12', waste: 0 },
            ]} margin={{ top: 5, right: 10, bottom: 5, left: -20 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="truck" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="waste" name="Waste (tonnes)" fill="#218838" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Operations Board" subtitle="All active and recent cleanup operations" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-700">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Op ID</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Incident</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Location</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden lg:table-cell">Officer</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden sm:table-cell">Crew</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Truck</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Waste</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700/60">
              {cleanupOperations.map((op) => {
                const sc = statusConfig[op.status];
                return (
                  <tr key={op.id} className="hover:bg-ink-800/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{op.id}</td>
                    <td className="px-4 py-3 text-xs font-mono text-neon-cyan">{op.incidentId}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B] hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="truncate max-w-[150px]">{op.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B] hidden lg:table-cell">{op.officer}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                        <Users className="w-3.5 h-3.5 text-gray-500" />
                        {op.crewSize}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-mono text-gray-400 hidden md:table-cell">{op.truckId}</td>
                    <td className="px-4 py-3 text-right">
                      {op.wasteCollected > 0 ? (
                        <span className="text-sm font-mono text-neon-emerald">{op.wasteCollected}t</span>
                      ) : (
                        <span className="text-sm text-gray-500">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center"><Badge variant={sc.variant} dot>{sc.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
