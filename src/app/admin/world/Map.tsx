"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type PresenceDot = {
  sessionId: string;
  latitude: number;
  longitude: number;
  city: string | null;
  region: string | null;
  country: string | null;
  fallback: boolean;
  lastSeenAt: string;
};

// Auto-fit the map so all the visible dots fit inside the viewport.
// Only triggers when the number/position of dots changes — we don't
// want every 30s poll to reset the user's manual zoom.
function FitToDots({ dots }: { dots: PresenceDot[] }) {
  const map = useMap();
  const sig = useRef("");
  useEffect(() => {
    if (dots.length === 0) return;
    const key = dots.map((d) => `${d.latitude.toFixed(2)},${d.longitude.toFixed(2)}`).sort().join("|");
    if (key === sig.current) return;
    sig.current = key;
    const bounds = dots.map((d): [number, number] => [d.latitude, d.longitude]);
    if (bounds.length === 1) {
      map.setView(bounds[0], 4, { animate: true });
    } else {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6, animate: true });
    }
  }, [dots, map]);
  return null;
}

export function WorldMap({ dots }: { dots: PresenceDot[] }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      maxZoom={12}
      worldCopyJump
      style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
      attributionControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      <FitToDots dots={dots} />
      {dots.map((d) => {
        const label = [d.city, d.region, d.country].filter(Boolean).join(", ") || "Unknown location";
        return (
          <CircleMarker
            key={d.sessionId}
            center={[d.latitude, d.longitude]}
            radius={8}
            pathOptions={{
              color: d.fallback ? "#ffb300" : "#22c55e",
              fillColor: d.fallback ? "#ffb300" : "#22c55e",
              fillOpacity: 0.85,
              weight: 2,
              className: "hx-presence-ping"
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <div style={{ fontSize: 12, lineHeight: 1.35 }}>
                <strong>{label}</strong>
                <div style={{ opacity: 0.7, marginTop: 2 }}>
                  Session {d.sessionId.slice(0, 8)}…
                </div>
                {d.fallback && (
                  <div style={{ opacity: 0.7, marginTop: 2, fontStyle: "italic" }}>
                    Approx. country centre
                  </div>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
