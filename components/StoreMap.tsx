"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Store {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  address: string;
}

interface MapProps {
  stores: Store[];
  onSelectStore: (store: Store) => void;
  center?: [number, number];
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export default function StoreMap({ stores, onSelectStore, center = [28.6139, 77.2090] }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-full w-full bg-surface-low animate-pulse" />;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border/10">
      <MapContainer 
        center={center} 
        zoom={13} 
        className="h-full w-full"
        style={{ background: '#0a0a0a' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <ChangeView center={center} />
        {stores.map((store) => (
          <Marker 
            key={store.id} 
            position={[Number(store.latitude), Number(store.longitude)]}
            eventHandlers={{
              click: () => onSelectStore(store),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2">
                <h3 className="font-bold text-foreground">{store.name}</h3>
                <p className="text-xs text-muted-foreground">{store.address}</p>
                <button 
                  onClick={() => onSelectStore(store)}
                  className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                >
                  Book Now
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
