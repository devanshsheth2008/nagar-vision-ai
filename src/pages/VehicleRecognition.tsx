import { useState } from 'react';
import {
  Car, CheckCircle2, XCircle, Search, Filter, ShieldCheck, AlertCircle, Camera,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { vehicleRecords } from '@/data/mockData';
import { cn } from '@/lib/utils';
import type { VehicleRecord } from '@/types';

const vehicleTypeIcons: Record<string, string> = {
  Truck: 'lucide:truck',
  Car: 'lucide:car',
  Van: 'lucide:truck',
  'Auto-rickshaw': 'lucide:bike',
  Dumper: 'lucide:truck',
};

export function VehicleRecognition() {
  const [records, setRecords] = useState(vehicleRecords);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [selectedRecord, setSelectedRecord] = useState<VehicleRecord | null>(null);

  const filtered = records.filter(
    (r) =>
      (filter === 'all' || (filter === 'verified' ? r.verified : !r.verified)) &&
      (search === '' || r.plateNumber.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())),
  );

  const verify = (id: string) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, verified: true, verifiedBy: 'Admin Kumar' } : r)));
    if (selectedRecord?.id === id) {
      setSelectedRecord((prev) => prev ? { ...prev, verified: true, verifiedBy: 'Admin Kumar' } : prev);
    }
  };

  return (
    <div>
      <PageHeader
        title="Vehicle Recognition"
        description="ANPR - Automated Number Plate Recognition system"
        icon={<Car className="w-5 h-5" />}
        actions={
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'verified' | 'unverified')}
            className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-[#64748B] focus:outline-none focus:border-neon-emerald/30"
          >
            <option value="all">All Records</option>
            <option value="unverified">Unverified Only</option>
            <option value="verified">Verified Only</option>
          </select>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by plate number or record ID..."
              className="w-full bg-ink-800/60 border border-ink-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#263445] placeholder-gray-400 focus:outline-none focus:border-neon-emerald/30 transition-colors"
            />
          </div>

          <div className="glass overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-700">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Record ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Plate</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Type</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Incident</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">OCR Conf.</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700/60">
                {filtered.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className={cn(
                      'cursor-pointer hover:bg-ink-800/40 transition-colors',
                      selectedRecord?.id === rec.id && 'bg-neon-emerald/[0.03]',
                    )}
                  >
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{rec.id}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-medium text-[#263445]">{rec.plateNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">{rec.vehicleType}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500 hidden lg:table-cell">{rec.incidentId}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('text-sm font-mono font-bold', rec.ocrConfidence >= 90 ? 'text-neon-emerald' : 'text-neon-amber')}>
                        {rec.ocrConfidence.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {rec.verified ? (
                        <Badge variant="emerald" dot>Verified</Badge>
                      ) : (
                        <Badge variant="amber" dot>Pending</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          {selectedRecord ? (
            <Panel title="Record Details" subtitle={selectedRecord.id}>
              <div className="space-y-4">
                {/* Number plate crop preview */}
                <div className="relative aspect-video bg-ink-950 rounded-lg overflow-hidden border border-ink-700 grid-bg flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded px-4 py-2 border-2 border-gray-300 shadow-lg">
                      <p className="text-2xl font-bold font-mono text-black tracking-wider">{selectedRecord.plateNumber}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur px-2 py-1 rounded border border-ink-700">
                    <span className="text-[10px] text-gray-500">Plate crop preview (demo)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Vehicle Type</p>
                    <p className="text-sm text-[#263445] mt-0.5">{selectedRecord.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">OCR Confidence</p>
                    <p className={cn('text-sm font-mono font-bold mt-0.5', selectedRecord.ocrConfidence >= 90 ? 'text-neon-emerald' : 'text-neon-amber')}>
                      {selectedRecord.ocrConfidence.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Incident ID</p>
                    <p className="text-sm font-mono text-neon-cyan mt-0.5">{selectedRecord.incidentId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Detected At</p>
                    <p className="text-sm text-[#64748B] mt-0.5">
                      {new Date(selectedRecord.detectedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm text-[#64748B] mt-0.5">{selectedRecord.location}</p>
                  </div>
                  {selectedRecord.verified && selectedRecord.verifiedBy && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Verified By</p>
                      <p className="text-sm text-[#64748B] mt-0.5">{selectedRecord.verifiedBy}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {selectedRecord.verified ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-neon-emerald/5 border border-neon-emerald/15">
                      <ShieldCheck className="w-4 h-4 text-neon-emerald" />
                      <span className="text-sm text-neon-emerald">Verification complete</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => verify(selectedRecord.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-emerald/10 border border-neon-emerald/20 text-neon-emerald text-sm font-medium hover:bg-neon-emerald/20 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Verify Record
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-neon-amber/5 border border-neon-amber/15 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-neon-amber shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400">
                    <span className="text-neon-amber font-medium">Demo:</span> Plate crop is simulated. OCR output is sample data for workflow demonstration.
                  </p>
                </div>
              </div>
            </Panel>
          ) : (
            <Panel title="Record Details" subtitle="Select a record to view">
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Camera className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500">Click a record to view details and verify</p>
              </div>
            </Panel>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
        <div className="glass p-4 text-center">
          <p className="text-2xl font-bold text-[#263445] font-mono">{records.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Records</p>
        </div>
        <div className="glass p-4 text-center">
          <p className="text-2xl font-bold text-neon-emerald font-mono">{records.filter(r => r.verified).length}</p>
          <p className="text-xs text-gray-500 mt-1">Verified</p>
        </div>
        <div className="glass p-4 text-center">
          <p className="text-2xl font-bold text-neon-amber font-mono">{records.filter(r => !r.verified).length}</p>
          <p className="text-xs text-gray-500 mt-1">Pending Verification</p>
        </div>
        <div className="glass p-4 text-center">
          <p className="text-2xl font-bold text-neon-cyan font-mono">
            {(records.reduce((a, r) => a + r.ocrConfidence, 0) / records.length).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Avg OCR Confidence</p>
        </div>
      </div>
    </div>
  );
}
