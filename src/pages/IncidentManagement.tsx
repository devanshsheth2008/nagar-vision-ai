import { useState } from 'react';
import {
  AlertTriangle, Search, Filter, MapPin, Camera, User, ArrowRight, Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { incidents } from '@/data/mockData';
import { severityBadge, statusBadge } from '@/lib/badges';
import { cn } from '@/lib/utils';
import type { Incident, IncidentStatus } from '@/types';

const statusFilters: Array<{ label: string; value: 'all' | IncidentStatus }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Resolved', value: 'resolved' },
];

export function IncidentManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | IncidentStatus>('all');
  const [selected, setSelected] = useState<Incident | null>(incidents[0]);

  const filtered = incidents.filter(
    (inc) =>
      (statusFilter === 'all' || inc.status === statusFilter) &&
      (search === '' ||
        inc.id.toLowerCase().includes(search.toLowerCase()) ||
        inc.location.toLowerCase().includes(search.toLowerCase()) ||
        inc.category.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div>
      <PageHeader
        title="Incident Management"
        description="Track and manage waste detection incidents"
        icon={<AlertTriangle className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-2">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  statusFilter === f.value
                    ? 'bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/20'
                    : 'text-gray-500 hover:text-[#64748B] border border-transparent',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, location, or category..."
          className="w-full bg-ink-800/60 border border-ink-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#263445] placeholder-gray-400 focus:outline-none focus:border-neon-emerald/30 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="glass overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-700">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Incident ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Location</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden lg:table-cell">Severity</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700/60">
                {filtered.map((inc) => {
                  const sb = severityBadge(inc.severity);
                  const stb = statusBadge(inc.status);
                  return (
                    <tr
                      key={inc.id}
                      onClick={() => setSelected(inc)}
                      className={cn('cursor-pointer hover:bg-ink-800/40 transition-colors', selected?.id === inc.id && 'bg-neon-emerald/[0.03]')}
                    >
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{inc.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">{inc.category}</td>
                      <td className="px-4 py-3 text-sm text-[#263445] truncate max-w-[180px]">{inc.location}</td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell"><Badge variant={sb.variant} dot>{sb.label}</Badge></td>
                      <td className="px-4 py-3 text-center"><Badge variant={stb.variant} dot>{stb.label}</Badge></td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className={cn('text-sm font-mono font-bold', inc.confidence >= 95 ? 'text-neon-emerald' : 'text-neon-amber')}>
                          {inc.confidence.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm">No incidents match your filters.</div>
            )}
          </div>
        </div>

        <div>
          {selected && (
            <Panel title="Incident Details" subtitle={selected.id}>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={severityBadge(selected.severity).variant} dot>
                    {severityBadge(selected.severity).label}
                  </Badge>
                  <Badge variant={statusBadge(selected.status).variant} dot>
                    {statusBadge(selected.status).label}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="text-sm text-[#263445] font-medium">{selected.category}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <div className="flex items-center gap-2 text-sm text-[#64748B]">
                    <MapPin className="w-4 h-4 text-neon-cyan" />
                    {selected.location}
                  </div>
                  <p className="text-xs font-mono text-gray-500 mt-1 ml-6">{selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Detected</p>
                    <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      {new Date(selected.detectedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Camera</p>
                    <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
                      <Camera className="w-3.5 h-3.5 text-gray-500" />
                      {selected.cameraId}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-ink-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-neon-emerald" style={{ width: `${selected.confidence}%` }} />
                    </div>
                    <span className="text-sm font-mono text-neon-emerald font-bold">{selected.confidence.toFixed(1)}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-400">{selected.description}</p>
                </div>

                {selected.assignedOfficer && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Assigned Officer</p>
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <User className="w-4 h-4 text-neon-cyan" />
                      {selected.assignedOfficer}
                    </div>
                  </div>
                )}

                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-emerald/10 border border-neon-emerald/20 text-neon-emerald text-sm font-medium hover:bg-neon-emerald/20 transition-colors">
                  {selected.status === 'pending' ? 'Assign Officer' : selected.status === 'assigned' ? 'Start Cleanup' : 'View Cleanup'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
