import { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { MonitoringCamera } from '@/types';
import { GANDHIDHAM_CENTER, incidentHeatPoints } from '@/data/monitoringData';
import type { IncidentHeatPoint } from '@/data/monitoringData';
import { cn } from '@/lib/utils';

interface MonitoringMapProps {
  cameras: MonitoringCamera[];
  selectedId: string | null;
  onSelect: (cam: MonitoringCamera) => void;
  height?: string;
  showHeatmap?: boolean;
  showCameras?: boolean;
  fullscreen?: boolean;
}

interface Cluster {
  lat: number;
  lng: number;
  count: number;
  cameras: MonitoringCamera[];
}

const statusColors: Record<string, string> = {
  online: '#2563A6',
  offline: '#94A3B8',
  maintenance: '#D99A19',
  alert: '#C83E3E',
};

const heatColors: Record<string, string> = {
  active: '#C83E3E',
  historical: '#D99A19',
};

function clusterCameras(cameras: MonitoringCamera[], zoom: number): Array<Cluster | MonitoringCamera & { isCluster: false }> {
  const gridSize = zoom >= 15 ? 0.002 : zoom >= 13 ? 0.005 : zoom >= 11 ? 0.01 : 0.03;
  const grid = new Map<string, MonitoringCamera[]>();

  for (const cam of cameras) {
    const key = `${Math.round(cam.lat / gridSize)}_${Math.round(cam.lng / gridSize)}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(cam);
  }

  const result: Array<Cluster | MonitoringCamera & { isCluster: false }> = [];
  for (const cams of grid.values()) {
    if (cams.length > 5) {
      const avgLat = cams.reduce((a, c) => a + c.lat, 0) / cams.length;
      const avgLng = cams.reduce((a, c) => a + c.lng, 0) / cams.length;
      result.push({ lat: avgLat, lng: avgLng, count: cams.length, cameras: cams });
    } else {
      for (const cam of cams) {
        result.push({ ...cam, isCluster: false as const });
      }
    }
  }
  return result;
}

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function FullscreenHandler({ fullscreen }: { fullscreen: boolean }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(timer);
  }, [map, fullscreen]);
  return null;
}

function HeatLayer({ points }: { points: IncidentHeatPoint[] }) {
  return (
    <>
      {points.map((hp) => (
        <Circle
          key={hp.id}
          center={[hp.lat, hp.lng]}
          radius={300 + hp.intensity * 500}
          pathOptions={{
            color: heatColors[hp.type],
            fillColor: heatColors[hp.type],
            fillOpacity: hp.intensity * 0.25,
            weight: 1,
          }}
        >
          <Tooltip>
            <div>
              <strong>{hp.location}</strong>
              <br />
              {hp.incidentCount} incidents · {hp.type === 'active' ? 'Active hotspot' : 'Historical'}
            </div>
          </Tooltip>
        </Circle>
      ))}
    </>
  );
}

export function MonitoringMap({
  cameras,
  selectedId,
  onSelect,
  height = '420px',
  showHeatmap = false,
  showCameras = true,
  fullscreen = false,
}: MonitoringMapProps) {
  const zoom = 14;
  const items = useMemo(() => clusterCameras(cameras, zoom), [cameras]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [fullscreen]);

  return (
    <div
      ref={containerRef}
      className={cn('rounded-lg overflow-hidden border border-ink-700', fullscreen && 'fixed inset-0 z-[60] border-none rounded-none')}
      style={{ height: fullscreen ? '100vh' : height }}
    >
      <MapContainer
        center={GANDHIDHAM_CENTER}
        zoom={zoom}
        style={{ height: '100%', width: '100%', background: '#E2E8F0' }}
        scrollWheelZoom
      >
        <MapResizeHandler />
        <FullscreenHandler fullscreen={fullscreen} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {showHeatmap && <HeatLayer points={incidentHeatPoints} />}

        {showCameras && items.map((item, i) => {
          if ('count' in item) {
            const radius = Math.min(Math.max(item.count / 10, 12), 28);
            return (
              <CircleMarker
                key={`cluster-${i}`}
                center={[item.lat, item.lng]}
                radius={radius}
                pathOptions={{ color: '#17365D', fillColor: '#17365D', fillOpacity: 0.25, weight: 2 }}
              >
                <Tooltip>
                  <div>
                    <strong>{item.count} cameras</strong>
                    <br />
                    Zoom in to view individual cameras
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          }

          const color = item.hasAlert ? statusColors.alert : statusColors[item.status];
          const isSelected = selectedId === item.id;

          return (
            <CircleMarker
              key={item.id}
              center={[item.lat, item.lng]}
              radius={isSelected ? 8 : 5}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: isSelected ? 3 : 2 }}
              eventHandlers={{ click: () => onSelect(item) }}
            >
              <Tooltip>
                <div>
                  <strong>{item.id}</strong>
                  <br />
                  {item.location}
                  <br />
                  {item.status} · {item.type}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export { L };
