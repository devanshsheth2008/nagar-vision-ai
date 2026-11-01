import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { GANDHIDHAM_CENTER } from '@/data/mockData';

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  height?: string;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({ lat, lng, onChange, height = '350px' }: LocationPickerProps) {
  const [marker, setMarker] = useState<{ lat: number; lng: number }>({ lat, lng });

  const handleClick = (newLat: number, newLng: number) => {
    setMarker({ lat: newLat, lng: newLng });
    onChange(newLat, newLng);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-ink-700" style={{ height }}>
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        style={{ height: '100%', width: '100%', background: '#E2E8F0' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <ClickHandler onClick={handleClick} />
        <CircleMarker
          center={[marker.lat, marker.lng]}
          radius={8}
          pathOptions={{ color: '#168C8C', fillColor: '#168C8C', fillOpacity: 0.8, weight: 2 }}
        >
          <Tooltip permanent>
            {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
          </Tooltip>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
