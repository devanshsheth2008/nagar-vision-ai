import { useState } from 'react';
import { Users, Phone, BadgeCheck, MapPin, Shield, Activity, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { officers } from '@/data/mockData';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { variant: 'emerald' | 'gray' | 'amber'; label: string }> = {
  'on-duty': { variant: 'emerald', label: 'On Duty' },
  'off-duty': { variant: 'gray', label: 'Off Duty' },
  'on-leave': { variant: 'amber', label: 'On Leave' },
};

const roleColors: Record<string, string> = {
  Inspector: 'text-neon-emerald',
  Supervisor: 'text-neon-cyan',
  'Field Officer': 'text-neon-amber',
  Operator: 'text-neon-purple',
};

const avatarColors: Record<string, string> = {
  'Rajesh Kumar': 'from-neon-emerald to-neon-cyan',
  'Priya Sharma': 'from-neon-cyan to-neon-purple',
  'Amit Patel': 'from-neon-amber to-neon-red',
  'Suresh Rathore': 'from-neon-purple to-neon-cyan',
  'Deepika Joshi': 'from-neon-cyan to-neon-emerald',
  'Manav Desai': 'from-neon-emerald to-neon-amber',
};

export function OfficerManagement() {
  const [search, setSearch] = useState('');
  const filtered = officers.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()) || o.badge.toLowerCase().includes(search.toLowerCase()));

  const onDuty = officers.filter(o => o.status === 'on-duty').length;
  const totalResolved = officers.reduce((a, o) => a + o.incidentsResolved, 0);
  const activeAssignments = officers.reduce((a, o) => a + o.activeAssignments, 0);

  return (
    <div>
      <PageHeader
        title="Officer Management"
        description="Municipal field officer roster and performance"
        icon={<Users className="w-5 h-5" />}
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search officers..."
              className="bg-ink-800 border border-ink-700 rounded-lg pl-10 pr-4 py-2 text-sm text-[#263445] placeholder-gray-400 focus:outline-none focus:border-neon-emerald/30"
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Officers</p>
            <Users className="w-4 h-4 text-neon-cyan" />
          </div>
          <p className="text-2xl font-bold text-[#263445] font-mono mt-2">{officers.length}</p>
        </div>
        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider">On Duty</p>
            <Shield className="w-4 h-4 text-neon-emerald" />
          </div>
          <p className="text-2xl font-bold text-neon-emerald font-mono mt-2">{onDuty}</p>
        </div>
        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Active Assignments</p>
            <Activity className="w-4 h-4 text-neon-amber" />
          </div>
          <p className="text-2xl font-bold text-neon-amber font-mono mt-2">{activeAssignments}</p>
        </div>
        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Resolved</p>
            <BadgeCheck className="w-4 h-4 text-neon-cyan" />
          </div>
          <p className="text-2xl font-bold text-neon-cyan font-mono mt-2">{totalResolved}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((officer) => {
          const sc = statusConfig[officer.status];
          const initials = officer.name.split(' ').map(n => n[0]).join('');
          return (
            <div key={officer.id} className="glass p-5 transition-all duration-300 hover:border-ink-600 animate-slide-up">
              <div className="flex items-start gap-3 mb-4">
                <div className={cn('w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-ink-950 font-bold text-sm shrink-0', avatarColors[officer.name] || 'from-neon-emerald to-neon-cyan')}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#263445] truncate">{officer.name}</p>
                  <p className="text-xs font-mono text-gray-500">{officer.badge}</p>
                  <p className={cn('text-xs font-medium mt-0.5', roleColors[officer.role])}>{officer.role}</p>
                </div>
                <Badge variant={sc.variant} dot>{sc.label}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  {officer.zone}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Phone className="w-3.5 h-3.5 text-gray-500" />
                  {officer.phone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-ink-700/60">
                <div className="text-center">
                  <p className="text-lg font-bold text-[#263445] font-mono">{officer.incidentsResolved}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Resolved</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-neon-amber font-mono">{officer.activeAssignments}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Active</p>
                </div>
              </div>

              <div className="mt-3 text-[10px] text-gray-500 text-center">
                Joined {new Date(officer.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
