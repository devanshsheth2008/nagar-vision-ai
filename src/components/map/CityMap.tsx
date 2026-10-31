import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { GANDHIDHAM_CENTER } from '@/data/mockData';
import type { Hotspot } from '@/types';
import { cn } from '@/lib/utils';

interface CityMapProps {
  hotspots?: Hotspot[];
  markers?: Array<{ lat: number; lng: number; label: string; color: string; radius?: number }>;
  height?: string;
  showHotspotZones?: boolean;
}

export function CityMap({ hotspots = [], markers = [], height = '400px', showHotspotZones = true }: CityMapProps) {
  const severityColors: Record<string, string> = {
    critical: '#C83E3E',
    high: '#D99A19',
    medium: '#168C8C',
    low: '#218838',
  };

  return (
    <div className={cn('rounded-lg overflow-hidden border border-ink-700')} style={{ height }}>
      <MapContainer
        center={GANDHIDHAM_CENTER}
        zoom={14}
        style={{ height: '100%', width: '100%', background: '#E2E8F0' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {hotspots.map((hs) => {
          const color = severityColors[hs.severity] || '#218838';
          return (
            <div key={hs.id}>
              {showHotspotZones && (
                <Circle
                  center={[hs.lat, hs.lng]}
                  radius={hs.radius}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.12, weight: 1 }}
                />
              )}
              <CircleMarker
                center={[hs.lat, hs.lng]}
                radius={6}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: 2 }}
              >
                <Tooltip>
                  <div>
                    <strong>{hs.location}</strong>
                    <br />
                    {hs.incidentCount} incidents · {hs.severity}
                  </div>
                </Tooltip>
              </CircleMarker>
            </div>
          );
        })}

        {markers.map((m, i) => (
          <CircleMarker
            key={i}
            center={[m.lat, m.lng]}
            radius={m.radius || 5}
            pathOptions={{ color: m.color, fillColor: m.color, fillOpacity: 0.8, weight: 2 }}
          >
            {m.label && (
              <Tooltip>
                <div>{m.label}</div>
              </Tooltip>
            )}
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
