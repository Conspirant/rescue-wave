import { useEffect, useMemo } from "react";
import L from "leaflet";
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useRescueWave } from "@/hooks/useRescueWave";
import { agoLabel } from "@/lib/format";
import type { Detection } from "@/types";

export interface MapLayers {
  risk: boolean;
  detection: boolean;
  trail: boolean;
  waypoints: boolean;
  terrain: boolean;
}

const RISK_COLOR: Record<string, string> = {
  LOW: "#2f9e6b",
  MODERATE: "#d6a326",
  HIGH: "#d97a1f",
  CRITICAL: "#c0392b",
};

function roverIcon(heading: number, online: boolean) {
  return L.divIcon({
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `
      <div style="position:relative;width:44px;height:44px;">
        <span class="animate-pulse-ring" style="position:absolute;inset:8px;border-radius:9999px;border:2px solid ${online ? "#2f6fb5" : "#c0392b"};"></span>
        <span style="position:absolute;inset:14px;border-radius:9999px;background:${online ? "#1f3f66" : "#c0392b"};box-shadow:0 0 0 3px #fff;"></span>
        <span style="position:absolute;left:50%;top:50%;width:0;height:0;transform:translate(-50%,-50%) rotate(${heading}deg) translateY(-15px);border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:10px solid ${online ? "#1f3f66" : "#c0392b"};"></span>
      </div>`,
  });
}

function targetIcon(det: Detection) {
  const critical = det.status === "POSSIBLE_SURVIVOR" || det.status === "VERIFIED";
  const color = critical ? "#c0392b" : "#d6a326";
  return L.divIcon({
    className: "",
    iconSize: [80, 34],
    iconAnchor: [12, 12],
    html: `
      <div style="position:relative;">
        ${critical ? `<span class="animate-pulse-ring" style="position:absolute;left:-4px;top:-4px;width:32px;height:32px;border-radius:9999px;border:2px solid ${color};"></span>` : ""}
        <span style="position:absolute;left:0;top:0;width:24px;height:24px;border-radius:4px;background:#fff;border:2px solid ${color};display:flex;align-items:center;justify-content:center;font:700 10px/1 'IBM Plex Mono',monospace;color:${color};">${det.targetId.slice(-2)}</span>
        <span style="position:absolute;left:28px;top:2px;white-space:nowrap;background:#fff;border:1px solid ${color};color:${color};padding:1px 4px;font:600 9px/1.4 'IBM Plex Mono',monospace;letter-spacing:.06em;">${det.confidence}% · ${det.distance.toFixed(1)}m</span>
      </div>`,
  });
}

function waypointIcon(label: string) {
  return L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<span style="display:flex;width:22px;height:22px;align-items:center;justify-content:center;border-radius:3px;background:#1f3f66;color:#fff;font:700 8px/1 'IBM Plex Mono',monospace;">${label.replace("WP-", "")}</span>`,
  });
}

function Recenter({ position, follow }: { position: [number, number]; follow: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (follow) map.panTo(position, { animate: true });
  }, [follow, map, position]);
  return null;
}

function ClickHandler({ onPick }: { onPick?: ((lat: number, lng: number) => void) | undefined }) {
  useMapEvents({
    click(e) {
      onPick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapCanvas({
  layers,
  follow,
  onPickLocation,
  focus,
}: {
  layers: MapLayers;
  follow: boolean;
  onPickLocation?: (lat: number, lng: number) => void;
  focus?: [number, number] | null;
}) {
  const { state, actions } = useRescueWave();
  const rover: [number, number] = [state.rover.latitude, state.rover.longitude];
  const online = state.connection === "CONNECTED";
  const visibleDetections = useMemo(
    () => state.detections.filter((d) => d.status !== "DISMISSED"),
    [state.detections],
  );

  return (
    <MapContainer
      center={rover}
      zoom={17}
      zoomControl
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url={
          layers.terrain
            ? "https://tile.opentopomap.org/{z}/{x}/{y}.png"
            : "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      />
      <Recenter position={focus ?? rover} follow={follow || Boolean(focus)} />
      <ClickHandler onPick={onPickLocation} />

      {layers.risk &&
        state.risk.zones.map((z) => (
          <Circle
            key={z.id}
            center={z.center}
            radius={z.radius}
            pathOptions={{
              color: RISK_COLOR[z.level],
              weight: 1.5,
              fillColor: RISK_COLOR[z.level],
              fillOpacity: 0.1,
              dashArray: "4 4",
            }}
          >
            <Popup>
              <div className="font-mono text-[11px]">
                <div className="font-bold">{z.name}</div>
                <div>Risk {z.level} · {z.probability}%</div>
                <div className="text-muted-foreground">{z.factors.join(", ")}</div>
              </div>
            </Popup>
          </Circle>
        ))}

      {layers.trail && state.trail.length > 1 && (
        <Polyline positions={state.trail} pathOptions={{ color: "#2f6fb5", weight: 2, opacity: 0.75 }} />
      )}

      {layers.detection && (
        <Circle
          center={rover}
          radius={12}
          pathOptions={{ color: "#2f6fb5", weight: 1, fillColor: "#2f6fb5", fillOpacity: 0.07 }}
        />
      )}

      <Marker position={rover} icon={roverIcon(state.rover.heading, online)}>
        <Popup>
          <div className="font-mono text-[11px] leading-relaxed">
            <div className="font-bold">ROVER {state.rover.roverId}</div>
            <div>{state.rover.status} · {state.rover.speed.toFixed(1)} m/s</div>
            <div>{rover[0].toFixed(5)}, {rover[1].toFixed(5)}</div>
            <div>Battery {state.rover.battery.toFixed(0)}% · Signal {state.rover.signal.toFixed(0)}%</div>
          </div>
        </Popup>
      </Marker>

      {layers.detection &&
        visibleDetections.map((det) => (
          <Marker key={det.targetId} position={[det.latitude, det.longitude]} icon={targetIcon(det)}>
            <Popup>
              <div className="min-w-44 font-mono text-[11px] leading-relaxed">
                <div className="font-bold">
                  {det.status === "UNVERIFIED" ? "UNVERIFIED TARGET" : "POSSIBLE SURVIVOR"}
                </div>
                <div>Target: {det.targetId}</div>
                <div>Confidence: {det.confidence}%</div>
                <div>Distance: {det.distance.toFixed(1)} m</div>
                <div>Motion: {det.motion}</div>
                <div>Detected: {agoLabel(det.timestamp)}</div>
                <div>Location: {det.zone}</div>
                <div className="mt-2 flex flex-col gap-1">
                  <button
                    className="border border-current px-2 py-1 text-[10px] font-bold tracking-wider uppercase"
                    onClick={() => actions.verifyTarget(det.targetId)}
                  >
                    Mark verified
                  </button>
                  <button
                    className="border border-current px-2 py-1 text-[10px] font-bold tracking-wider uppercase"
                    onClick={() => actions.addWaypoint(det.latitude, det.longitude)}
                  >
                    Navigate rover
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      {layers.waypoints &&
        state.waypoints.map((wp) => (
          <Marker key={wp.id} position={[wp.latitude, wp.longitude]} icon={waypointIcon(wp.label)}>
            <Popup>
              <div className="font-mono text-[11px]">
                <div className="font-bold">{wp.label}</div>
                <div>{wp.latitude.toFixed(5)}, {wp.longitude.toFixed(5)}</div>
                <button
                  className="mt-1 border border-current px-2 py-1 text-[10px] font-bold tracking-wider uppercase"
                  onClick={() => actions.removeWaypoint(wp.id)}
                >
                  Remove
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
