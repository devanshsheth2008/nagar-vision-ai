import { useState, useMemo, useRef } from 'react';
import {
  Monitor, Video, Upload, Play, Pause, Maximize2, Radio, MapPin,
  Camera as CameraIcon, Search, ChevronLeft, ChevronRight, Grid2x2,
  Grid3x3, LayoutGrid, Square, AlertTriangle, Trash2, Car,
  WifiOff, ShieldAlert, Eye, X, ChevronUp, ChevronDown,
  Activity, Maximize, Minimize2, Flame, Layers, Map as MapIcon,
  Heart, Clock, ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { MonitoringMap } from '@/components/map/MonitoringMap';
import { monitoringCameras, getMonitoringStats, cameraAreas, cameraAlerts, alertTypeLabels, cameraIncidents } from '@/data/monitoringData';
import { cameraStatusBadge } from '@/lib/badges';
import { cn } from '@/lib/utils';
import type { MonitoringCamera, CameraAlert } from '@/types';

type GridLayout = 1 | 4 | 9 | 16;

const layoutConfig: Record<GridLayout, { icon: typeof Square; label: string; cols: string }> = {
  1: { icon: Square, label: '1×1', cols: 'grid-cols-1' },
  4: { icon: Grid2x2, label: '2×2', cols: 'grid-cols-2' },
  9: { icon: Grid3x3, label: '3×3', cols: 'grid-cols-3' },
  16: { icon: LayoutGrid, label: '4×4', cols: 'grid-cols-4' },
};

const alertTypeIcon: Record<CameraAlert['type'], typeof AlertTriangle> = {
  'illegal-dumping': Trash2,
  'unauthorized-halt': Car,
  'garbage-accumulation': AlertTriangle,
  'camera-offline': WifiOff,
};

const alertTypeColor: Record<CameraAlert['type'], string> = {
  'illegal-dumping': 'text-[#C83E3E]',
  'unauthorized-halt': 'text-[#D99A19]',
  'garbage-accumulation': 'text-[#168C8C]',
  'camera-offline': 'text-gray-500',
};

const healthConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  healthy: { label: 'Healthy', color: 'text-[#218838]', bg: 'bg-[#218838]/10', border: 'border-[#218838]/20' },
  degraded: { label: 'Degraded', color: 'text-[#D99A19]', bg: 'bg-[#D99A19]/10', border: 'border-[#D99A19]/20' },
  down: { label: 'Down', color: 'text-[#C83E3E]', bg: 'bg-[#C83E3E]/10', border: 'border-[#C83E3E]/20' },
};

const severityVariant: Record<string, 'red' | 'amber' | 'cyan' | 'gray'> = {
  critical: 'red', high: 'amber', medium: 'cyan', low: 'gray',
};

const statusVariantMap: Record<string, 'red' | 'amber' | 'cyan' | 'emerald'> = {
  pending: 'red', assigned: 'amber', 'in-progress': 'cyan', resolved: 'emerald',
};

const PAGE_SIZE = 12;

export function LiveMonitoring() {
  const stats = useMemo(() => getMonitoringStats(), []);

  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('All Areas');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'status'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [selectedCam, setSelectedCam] = useState<MonitoringCamera | null>(monitoringCameras[0]);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [playing, setPlaying] = useState<Record<string, boolean>>({});
  const [gridLayout, setGridLayout] = useState<GridLayout>(4);
  const [gridCameras, setGridCameras] = useState<MonitoringCamera[]>(monitoringCameras.slice(0, 4));
  const [fullscreenCam, setFullscreenCam] = useState<MonitoringCamera | null>(null);
  const [detailCam, setDetailCam] = useState<MonitoringCamera | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showCamerasLayer, setShowCamerasLayer] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<CameraAlert | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const filtered = useMemo(() => {
    let result = monitoringCameras.filter(
      (c) =>
        (areaFilter === 'All Areas' || c.area === areaFilter) &&
        (statusFilter === 'All' || c.status === statusFilter) &&
        (search === '' ||
          c.id.toLowerCase().includes(search.toLowerCase()) ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.location.toLowerCase().includes(search.toLowerCase())),
    );
    result.sort((a, b) => {
      let cmp: number;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [search, areaFilter, statusFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>, camId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoUrls({ ...videoUrls, [camId]: URL.createObjectURL(file) });
      setPlaying({ ...playing, [camId]: true });
    }
  };

  const togglePlay = (camId: string) => {
    const v = videoRefs.current[camId];
    if (!v) return;
    if (playing[camId]) v.pause();
    else v.play();
    setPlaying({ ...playing, [camId]: !playing[camId] });
  };

  const selectCamera = (cam: MonitoringCamera) => {
    setSelectedCam(cam);
    setDetailCam(cam);
    const exists = gridCameras.find(c => c.id === cam.id);
    if (!exists) {
      const newGrid = [...gridCameras];
      newGrid[0] = cam;
      setGridCameras(newGrid);
    }
  };

  const swapGridCamera = (cam: MonitoringCamera, slot: number) => {
    const newGrid = [...gridCameras];
    newGrid[slot] = cam;
    setGridCameras(newGrid);
  };

  const openInGrid = (cam: MonitoringCamera) => {
    const exists = gridCameras.find(c => c.id === cam.id);
    if (exists) return;
    const newGrid = [...gridCameras];
    if (newGrid.length >= gridLayout) {
      newGrid[newGrid.length - 1] = cam;
    } else {
      newGrid.push(cam);
    }
    setGridCameras(newGrid.slice(0, gridLayout));
  };

  const handleSort = (col: 'name' | 'status') => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const handleAlertClick = (alert: CameraAlert) => {
    setSelectedAlert(alert);
    const cam = monitoringCameras.find(c => c.id === alert.cameraId);
    if (cam) selectCamera(cam);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const minsAgo = Math.floor((Date.now() - d.getTime()) / 60000);
    if (minsAgo < 1) return 'Just now';
    if (minsAgo < 60) return `${minsAgo}m ago`;
    if (minsAgo < 1440) return `${Math.floor(minsAgo / 60)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const statCards = [
    { label: 'Total Registered', value: stats.total.toLocaleString(), icon: CameraIcon, color: 'text-[#17365D]', bg: 'bg-[#17365D]/10', border: 'border-[#17365D]/20' },
    { label: 'Online', value: stats.online.toLocaleString(), icon: Radio, color: 'text-[#218838]', bg: 'bg-[#218838]/10', border: 'border-[#218838]/20' },
    { label: 'Offline', value: stats.offline.toLocaleString(), icon: WifiOff, color: 'text-[#C83E3E]', bg: 'bg-[#C83E3E]/10', border: 'border-[#C83E3E]/20' },
    { label: 'Active Alerts', value: stats.alertCount.toLocaleString(), icon: ShieldAlert, color: 'text-[#D99A19]', bg: 'bg-[#D99A19]/10', border: 'border-[#D99A19]/20' },
  ];

  return (
    <div>
      <PageHeader
        title="Live Monitoring"
        description="Smart City CCTV Surveillance Network — Gandhidham"
        icon={<Monitor className="w-5 h-5" />}
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#17365D] text-white text-sm font-medium hover:bg-[#2563A6] transition-colors"
          >
            <CameraIcon className="w-4 h-4" />
            Add Camera
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
        {statCards.map((s) => (
          <div key={s.label} className="glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-[#263445] font-mono mt-1">{s.value}</p>
              </div>
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center border', s.bg, s.border, s.color)}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-6">Demonstration data — sample camera records for prototype evaluation.</p>

      {/* Camera Health Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#218838]/10 border border-[#218838]/20 flex items-center justify-center text-[#218838] shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Stream Healthy</p>
            <p className="text-sm font-bold text-[#263445] font-mono">{monitoringCameras.filter(c => c.streamHealth === 'healthy').length.toLocaleString()}</p>
          </div>
        </div>
        <div className="glass p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#D99A19]/10 border border-[#D99A19]/20 flex items-center justify-center text-[#D99A19] shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Degraded Streams</p>
            <p className="text-sm font-bold text-[#263445] font-mono">{monitoringCameras.filter(c => c.streamHealth === 'degraded').length.toLocaleString()}</p>
          </div>
        </div>
        <div className="glass p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#C83E3E]/10 border border-[#C83E3E]/20 flex items-center justify-center text-[#C83E3E] shrink-0">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Connection Failures</p>
            <p className="text-sm font-bold text-[#263445] font-mono">{monitoringCameras.reduce((a, c) => a + c.connectionFailures, 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="glass p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#17365D]/10 border border-[#17365D]/20 flex items-center justify-center text-[#17365D] shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Last Active</p>
            <p className="text-sm font-bold text-[#263445] font-mono">2m ago</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Map with Controls */}
        <div className="lg:col-span-2">
          <Panel
            title="Geographic Camera Map"
            subtitle="OpenStreetMap — blue: online, grey: offline, red: active alert"
            action={
              <div className="flex items-center gap-2">
                <select
                  value={areaFilter}
                  onChange={(e) => { setAreaFilter(e.target.value); setPage(0); }}
                  className="bg-white border border-ink-700 rounded-lg px-2 py-1.5 text-xs text-[#263445] focus:outline-none focus:border-[#168C8C]"
                >
                  <option>All Areas</option>
                  {cameraAreas.map(a => <option key={a}>{a}</option>)}
                </select>
                <button
                  onClick={() => setMapFullscreen(!mapFullscreen)}
                  className="p-1.5 rounded-lg border border-ink-700 text-gray-500 hover:text-[#17365D] hover:bg-ink-800/40 transition-colors"
                  title={mapFullscreen ? 'Exit fullscreen' : 'Fullscreen map'}
                >
                  {mapFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            }
          >
            {/* Layer Controls */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                onClick={() => setShowCamerasLayer(!showCamerasLayer)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                  showCamerasLayer ? 'bg-[#17365D]/10 text-[#17365D] border-[#17365D]/20' : 'bg-white text-gray-500 border-ink-700',
                )}
              >
                <MapIcon className="w-3.5 h-3.5" />
                Camera Layer
              </button>
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                  showHeatmap ? 'bg-[#C83E3E]/10 text-[#C83E3E] border-[#C83E3E]/20' : 'bg-white text-gray-500 border-ink-700',
                )}
              >
                <Flame className="w-3.5 h-3.5" />
                Incident Heatmap
              </button>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 ml-auto">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C83E3E]" /> Active</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D99A19]" /> Historical</span>
              </div>
            </div>

            <MonitoringMap
              cameras={filtered}
              selectedId={selectedCam?.id ?? null}
              onSelect={selectCamera}
              height="420px"
              showHeatmap={showHeatmap}
              showCameras={showCamerasLayer}
              fullscreen={mapFullscreen}
            />
          </Panel>
        </div>

        {/* AI Alerts */}
        <Panel title="AI Alert Panel" subtitle="Suspected events requiring officer verification" noPadding>
          <div className="max-h-[480px] overflow-y-auto divide-y divide-ink-700/60">
            {cameraAlerts.map((alert) => {
              const Icon = alertTypeIcon[alert.type];
              const cam = monitoringCameras.find(c => c.id === alert.cameraId);
              return (
                <button
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-ink-800/40 transition-colors',
                    selectedAlert?.id === alert.id && 'bg-[#168C8C]/5',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('shrink-0 mt-0.5', alertTypeColor[alert.type])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">{alert.cameraId}</span>
                        {alert.verified ? (
                          <Badge variant="emerald" dot>Verified</Badge>
                        ) : (
                          <Badge variant="amber" dot>Unverified</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-[#263445]">{alertTypeLabels[alert.type]}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-gray-400">{formatTime(alert.timestamp)}</span>
                        {alert.confidence < 100 && (
                          <span className="text-[10px] font-mono text-[#168C8C]">{alert.confidence}% confidence</span>
                        )}
                        {cam && (
                          <span className="text-[10px] text-[#168C8C] ml-auto flex items-center gap-0.5">
                            Open <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Camera Directory */}
      <Panel
        title="Camera Directory"
        subtitle={`${filtered.length.toLocaleString()} cameras${filtered.length < monitoringCameras.length ? ` of ${monitoringCameras.length.toLocaleString()}` : ''}`}
        noPadding
        className="mb-6"
      >
        {/* Advanced Search */}
        <div className="px-4 py-3 border-b border-ink-700 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by camera ID, name, or location..."
              className="w-full bg-white border border-ink-700 rounded-lg pl-10 pr-4 py-2 text-sm text-[#263445] placeholder-gray-400 focus:outline-none focus:border-[#168C8C]"
            />
          </div>
          <select
            value={areaFilter}
            onChange={(e) => { setAreaFilter(e.target.value); setPage(0); }}
            className="bg-white border border-ink-700 rounded-lg px-3 py-2 text-sm text-[#263445] focus:outline-none focus:border-[#168C8C]"
          >
            <option>All Areas</option>
            {cameraAreas.map(a => <option key={a}>{a}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="bg-white border border-ink-700 rounded-lg px-3 py-2 text-sm text-[#263445] focus:outline-none focus:border-[#168C8C]"
          >
            <option>All</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ink-800/40">
              <tr className="border-b border-ink-700">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Camera ID</th>
                <th
                  className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 cursor-pointer hover:text-[#263445] select-none"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center gap-1">Name {sortBy === 'name' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Location</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden lg:table-cell">Area</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden sm:table-cell">Type</th>
                <th
                  className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 cursor-pointer hover:text-[#263445] select-none"
                  onClick={() => handleSort('status')}
                >
                  <span className="flex items-center gap-1">Status {sortBy === 'status' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Last Active</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700/60">
              {pageItems.map((cam) => {
                const csb = cameraStatusBadge(cam.status);
                const hc = healthConfig[cam.streamHealth];
                return (
                  <tr
                    key={cam.id}
                    className={cn('hover:bg-ink-800/40 transition-colors', selectedCam?.id === cam.id && 'bg-[#168C8C]/5')}
                  >
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{cam.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#263445]">{cam.name}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B] hidden md:table-cell">{cam.location}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{cam.area}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{cam.type}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={csb.variant} dot>{csb.label}</Badge>
                        {cam.hasAlert && <ShieldAlert className="w-3.5 h-3.5 text-[#D99A19]" />}
                        <span className={cn('hidden lg:inline-block w-2 h-2 rounded-full', hc.bg, 'border', hc.border)} title={`Stream: ${hc.label}`} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{formatTime(cam.lastActive)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => selectCamera(cam)}
                          className="p-1.5 rounded hover:bg-ink-800/60 text-gray-500 hover:text-[#17365D] transition-colors"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openInGrid(cam)}
                          className="p-1.5 rounded hover:bg-ink-800/60 text-gray-500 hover:text-[#168C8C] transition-colors"
                          title="Open in grid"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pageItems.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No cameras match your filters.</div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-ink-700 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Page {page + 1} of {totalPages} · {filtered.length.toLocaleString()} cameras
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1.5 rounded border border-ink-700 text-gray-500 hover:text-[#17365D] hover:bg-ink-800/40 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded border border-ink-700 text-gray-500 hover:text-[#17365D] hover:bg-ink-800/40 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Panel>

      {/* Video Grid */}
      <Panel
        title="Live Video Monitoring Grid"
        subtitle="Simulated feeds — do not represent actual CCTV footage"
        action={
          <div className="flex items-center gap-1 bg-ink-800/40 rounded-lg p-1 border border-ink-700">
            {(Object.keys(layoutConfig) as unknown as GridLayout[]).map((layout) => {
              const cfg = layoutConfig[layout];
              return (
                <button
                  key={layout}
                  onClick={() => {
                    setGridLayout(layout);
                    setGridCameras(monitoringCameras.slice(0, layout));
                  }}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                    gridLayout === layout ? 'bg-[#17365D] text-white' : 'text-gray-500 hover:text-[#263445]',
                  )}
                  title={cfg.label}
                >
                  <cfg.icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        }
      >
        <div className={cn('grid gap-3', layoutConfig[gridLayout].cols)}>
          {gridCameras.map((cam, slot) => (
            <VideoPanel
              key={`${cam.id}-${slot}`}
              cam={cam}
              videoRef={(el) => { videoRefs.current[cam.id] = el; }}
              videoUrl={videoUrls[cam.id] ?? null}
              isPlaying={playing[cam.id] ?? false}
              onUpload={(e) => handleVideoUpload(e, cam.id)}
              onTogglePlay={() => togglePlay(cam.id)}
              onFullscreen={() => setFullscreenCam(cam)}
              onSelect={() => selectCamera(cam)}
              onRemove={() => swapGridCamera(monitoringCameras.find(c => c.id !== cam.id) ?? monitoringCameras[0], slot)}
            />
          ))}
        </div>
      </Panel>

      {/* Camera Detail Panel — Enhanced */}
      {detailCam && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setDetailCam(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-white border border-ink-700 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CameraIcon className="w-5 h-5 text-[#17365D]" />
                  <h3 className="text-sm font-semibold text-[#263445]">Camera Details</h3>
                </div>
                <button onClick={() => setDetailCam(null)} className="text-gray-400 hover:text-[#263445]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Camera ID</p>
                    <p className="text-sm font-mono text-[#263445] mt-0.5">{detailCam.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm text-[#263445] mt-0.5">{detailCam.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm text-[#263445] mt-0.5">{detailCam.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Area</p>
                    <p className="text-sm text-[#263445] mt-0.5">{detailCam.area}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm text-[#263445] mt-0.5">{detailCam.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Resolution</p>
                    <p className="text-sm text-[#263445] mt-0.5">{detailCam.resolution}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <div className="mt-0.5">
                      <Badge variant={cameraStatusBadge(detailCam.status).variant} dot>
                        {cameraStatusBadge(detailCam.status).label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Connection</p>
                    <p className="text-sm text-[#263445] mt-0.5">{formatTime(detailCam.lastActive)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Stream Health</p>
                    <div className="mt-0.5">
                      <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium', healthConfig[detailCam.streamHealth].bg, healthConfig[detailCam.streamHealth].border, healthConfig[detailCam.streamHealth].color)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', healthConfig[detailCam.streamHealth].bg)} />
                        {healthConfig[detailCam.streamHealth].label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Connection Failures</p>
                    <p className="text-sm font-mono text-[#263445] mt-0.5">{detailCam.connectionFailures}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Coordinates</p>
                    <p className="text-xs font-mono text-gray-500 mt-0.5">{detailCam.lat.toFixed(4)}, {detailCam.lng.toFixed(4)}</p>
                  </div>
                </div>

                {/* Associated Incidents */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Associated Incidents</p>
                  {cameraIncidents.filter(ci => ci.cameraId === detailCam.id).length > 0 ? (
                    <div className="space-y-2">
                      {cameraIncidents.filter(ci => ci.cameraId === detailCam.id).map((ci) => (
                        <div key={ci.id} className="p-3 rounded-lg bg-ink-800/40 border border-ink-700/60">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-gray-500">{ci.id}</span>
                            <Badge variant={severityVariant[ci.severity]} dot>{ci.severity}</Badge>
                          </div>
                          <p className="text-sm text-[#263445]">{ci.category}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{ci.description}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant={statusVariantMap[ci.status]} dot>{ci.status}</Badge>
                            <span className="text-[10px] text-gray-400">{formatTime(ci.detectedAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-2">No incidents recorded for this camera.</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => { openInGrid(detailCam); setDetailCam(null); }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#17365D] text-white text-sm font-medium hover:bg-[#2563A6] transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Open Video Feed
                  </button>
                  <button
                    onClick={() => setDetailCam(null)}
                    className="px-4 py-2 rounded-lg border border-ink-700 text-sm text-gray-500 hover:bg-ink-800/40 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fullscreen Video */}
      {fullscreenCam && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setFullscreenCam(null)}>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <VideoPanel
              cam={fullscreenCam}
              videoRef={(el) => { videoRefs.current[fullscreenCam.id] = el; }}
              videoUrl={videoUrls[fullscreenCam.id] ?? null}
              isPlaying={playing[fullscreenCam.id] ?? false}
              onUpload={(e) => handleVideoUpload(e, fullscreenCam.id)}
              onTogglePlay={() => togglePlay(fullscreenCam.id)}
              onFullscreen={() => setFullscreenCam(null)}
              onSelect={() => {}}
              onRemove={() => setFullscreenCam(null)}
              fullscreen
            />
          </div>
        </div>
      )}

      {/* Add Camera Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowAddModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <div className="bg-white border border-ink-700 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CameraIcon className="w-5 h-5 text-[#17365D]" />
                  <h3 className="text-sm font-semibold text-[#263445]">Register New Camera</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-[#263445]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Camera Name</label>
                  <input className="w-full bg-white border border-ink-700 rounded-lg px-3 py-2 text-sm text-[#263445] focus:outline-none focus:border-[#168C8C]" placeholder="e.g. Sector 3 Junction Cam" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Location</label>
                  <input className="w-full bg-white border border-ink-700 rounded-lg px-3 py-2 text-sm text-[#263445] focus:outline-none focus:border-[#168C8C]" placeholder="e.g. Sector 3, Near Park" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Area</label>
                    <select className="w-full bg-white border border-ink-700 rounded-lg px-3 py-2 text-sm text-[#263445] focus:outline-none focus:border-[#168C8C]">
                      {cameraAreas.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Type</label>
                    <select className="w-full bg-white border border-ink-700 rounded-lg px-3 py-2 text-sm text-[#263445] focus:outline-none focus:border-[#168C8C]">
                      <option>Dome</option><option>Bullet</option><option>PTZ</option><option>Thermal</option><option>ANPR</option>
                    </select>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#D99A19]/5 border border-[#D99A19]/20 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#D99A19] shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-[#D99A19]">Note:</span> In production, camera registration connects to the secure video gateway. This form is for demonstration only.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#17365D] text-white text-sm font-medium hover:bg-[#2563A6] transition-colors"
                >
                  Register Camera
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface VideoPanelProps {
  cam: MonitoringCamera;
  videoRef: (el: HTMLVideoElement | null) => void;
  videoUrl: string | null;
  isPlaying: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePlay: () => void;
  onFullscreen: () => void;
  onSelect: () => void;
  onRemove: () => void;
  fullscreen?: boolean;
}

function VideoPanel({ cam, videoRef, videoUrl, isPlaying, onUpload, onTogglePlay, onFullscreen, fullscreen }: VideoPanelProps) {
  const csb = cameraStatusBadge(cam.status);
  const isOnline = cam.status === 'online';
  const hc = healthConfig[cam.streamHealth];

  return (
    <div className={cn('relative aspect-video bg-[#1a1a2e] rounded-lg overflow-hidden border', fullscreen ? 'border-none' : 'border-ink-700')}>
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          autoPlay
          controls={false}
          muted
          loop
        />
      ) : isOnline ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-[#1a1a2e]">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#168C8C]/60 to-transparent animate-scan-line" />
          <Video className="w-7 h-7 text-gray-400 mb-2" />
          <p className="text-xs text-gray-400">Simulated Feed</p>
          <p className="text-[10px] text-gray-500 mt-1 max-w-[140px]">
            Upload a sample video to preview playback
          </p>
          <label className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 border border-white/20 text-[11px] text-gray-300 hover:bg-white/20 cursor-pointer transition-colors">
            <Upload className="w-3 h-3" />
            Upload
            <input type="file" accept="video/*" onChange={onUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-gray-800">
          <WifiOff className="w-7 h-7 text-gray-500 mb-2" />
          <p className="text-xs text-gray-400">Camera Offline</p>
          <p className="text-[10px] text-gray-500 mt-1">No signal available</p>
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 px-2 py-0.5 rounded text-[10px] text-white font-mono">
        {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-[#C83E3E] animate-pulse" />}
        {cam.id}
      </div>
      <div className="absolute top-2 right-2 bg-black/50 px-2 py-0.5 rounded text-[10px] text-gray-300">
        {cam.location.length > 20 ? cam.location.slice(0, 20) + '...' : cam.location}
      </div>

      {videoUrl && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-black/60 px-3 py-1.5">
          <button onClick={onTogglePlay} className="text-white hover:text-gray-300">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <span className="text-[10px] text-gray-400">Sample playback</span>
          <button onClick={onFullscreen} className="ml-auto text-white hover:text-gray-300">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!fullscreen && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          <span className={cn('w-2 h-2 rounded-full border', hc.bg, hc.border)} title={`Stream: ${hc.label}`} />
          <Badge variant={csb.variant} dot size="sm">{csb.label}</Badge>
        </div>
      )}
    </div>
  );
}
