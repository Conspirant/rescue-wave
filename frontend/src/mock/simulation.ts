import { DISASTER_PROFILES } from "./disasterProfiles";
import type {
  AlertItem,
  ConnectionState,
  Detection,
  DisasterType,
  Mission,
  MissionEvent,
  RiskData,
  RoverMode,
  RoverTelemetry,
  Waypoint,
} from "@/types";

export interface SimulationSnapshot {
  mission: Mission;
  rover: RoverTelemetry;
  detections: Detection[];
  alerts: AlertItem[];
  events: MissionEvent[];
  risk: RiskData;
  waypoints: Waypoint[];
  trail: [number, number][];
  connection: ConnectionState;
  lastTelemetryAt: number;
  bufferedEvents: number;
  lastSyncAt: number;
  demoRunning: boolean;
  demoStep: number;
  history: { t: string; battery: number; speed: number; signal: number }[];
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const nowLabel = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

let idCounter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(idCounter += 1)}`;

function buildRisk(type: DisasterType): RiskData {
  const profile = DISASTER_PROFILES[type];
  return {
    disasterType: type,
    riskLevel: "HIGH",
    layers: profile.layers.map((l) => ({ ...l, enabled: true })),
    zones: profile.zones,
    timestamp: Date.now(),
  };
}

function initialState(type: DisasterType = "EARTHQUAKE"): SimulationSnapshot {
  const profile = DISASTER_PROFILES[type];
  const started = Date.now() - 1000 * 62 * 42;
  return {
    mission: {
      missionId: "RW-042",
      disasterType: type,
      location: profile.location,
      zone: profile.zone,
      missionStatus: "ACTIVE",
      threatLevel: "ELEVATED",
      startedAt: started,
    },
    rover: {
      roverId: "RW-01",
      status: "MOVING",
      mode: "ASSISTED",
      battery: 78,
      signal: 94,
      speed: 0.8,
      heading: 42,
      latitude: profile.origin[0],
      longitude: profile.origin[1],
      gpsStatus: "LOCKED",
      cameraStatus: "LIVE",
      temperature: 31,
      timestamp: Date.now(),
    },
    detections: [],
    alerts: [
      {
        id: uid("alert"),
        severity: "INFO",
        title: "MISSION STARTED",
        message: `${profile.missionName} initiated in ${profile.zone}.`,
        timestamp: started,
        location: profile.zone,
        source: "Mission Control",
        acknowledged: true,
      },
    ],
    events: [
      {
        id: uid("ev"),
        time: started,
        event: "MISSION STARTED",
        roverId: "RW-01",
        location: profile.zone,
        severity: "INFO",
        status: "LOGGED",
        position: profile.origin,
      },
      {
        id: uid("ev"),
        time: started + 1000 * 60 * 6,
        event: `ROVER ENTERED ${profile.zone}`,
        roverId: "RW-01",
        location: profile.zone,
        severity: "INFO",
        status: "LOGGED",
        position: profile.origin,
      },
    ],
    risk: buildRisk(type),
    waypoints: [],
    trail: [profile.origin],
    connection: "CONNECTED",
    lastTelemetryAt: Date.now(),
    bufferedEvents: 0,
    lastSyncAt: Date.now(),
    demoRunning: false,
    demoStep: 0,
    history: [],
  };
}

type Listener = (s: SimulationSnapshot) => void;

class SimulationEngine {
  private state: SimulationSnapshot = initialState();
  private listeners = new Set<Listener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private demoTimer: ReturnType<typeof setTimeout> | null = null;

  getSnapshot() {
    return this.state;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    this.start();
    return () => {
      this.listeners.delete(fn);
      if (this.listeners.size === 0) this.stop();
    };
  }

  private emit(next: Partial<SimulationSnapshot>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((l) => l(this.state));
  }

  private start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), 1500);
  }

  private stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  // ---- telemetry simulation -------------------------------------------------
  private tick() {
    const s = this.state;
    if (s.connection === "OFFLINE") {
      this.emit({ bufferedEvents: s.bufferedEvents + (Math.random() > 0.6 ? 1 : 0) });
      return;
    }

    const rover = { ...s.rover };
    const moving = rover.status === "MOVING" || rover.status === "RETURNING";
    rover.heading = (rover.heading + (moving ? rnd(-6, 6) : 0) + 360) % 360;
    rover.speed = moving ? clamp(rover.speed + rnd(-0.12, 0.12), 0.2, 2) : 0;
    rover.battery = clamp(rover.battery - (moving ? 0.035 : 0.012), 0, 100);
    rover.signal = clamp(rover.signal + rnd(-3, 3), 55, 100);
    rover.temperature = clamp(rover.temperature + rnd(-0.2, 0.2), 24, 48);
    rover.timestamp = Date.now();

    if (moving) {
      const rad = (rover.heading * Math.PI) / 180;
      const step = (rover.speed * 1.5) / 111_320;
      rover.latitude += Math.cos(rad) * step;
      rover.longitude += (Math.sin(rad) * step) / Math.cos((rover.latitude * Math.PI) / 180);
    }

    const trail = [...s.trail, [rover.latitude, rover.longitude] as [number, number]].slice(-160);
    const history = [
      ...s.history,
      {
        t: nowLabel(rover.timestamp),
        battery: Number(rover.battery.toFixed(1)),
        speed: Number(rover.speed.toFixed(2)),
        signal: Math.round(rover.signal),
      },
    ].slice(-40);

    let alerts = s.alerts;
    if (rover.battery < 80 && !s.alerts.some((a) => a.title === "ROVER BATTERY BELOW 80%")) {
      alerts = [this.makeAlert("WARNING", "ROVER BATTERY BELOW 80%", "RW-01 battery level dropping.", s.mission.zone, "Rover Telemetry"), ...alerts];
    }

    // occasional organic radar contact while not in demo
    let detections = s.detections;
    let events = s.events;
    if (!s.demoRunning && Math.random() > 0.93 && detections.length < 4) {
      const det = this.makeDetection(rover, false);
      detections = [det, ...detections];
      alerts = [
        this.makeAlert("WARNING", "UNVERIFIED RADAR CONTACT", `Radar motion at ${det.distance.toFixed(1)} m, awaiting camera verification.`, det.zone, "Human Detection"),
        ...alerts,
      ];
      events = [
        ...events,
        {
          id: uid("ev"),
          time: Date.now(),
          event: "RADAR CONTACT",
          detail: `${det.targetId} unverified`,
          roverId: rover.roverId,
          location: det.zone,
          severity: "WARNING",
          status: "UNRESOLVED",
          position: [det.latitude, det.longitude],
        },
      ];
    }

    this.emit({ rover, trail, history, alerts, detections, events, lastTelemetryAt: Date.now() });
  }

  private makeAlert(
    severity: AlertItem["severity"],
    title: string,
    message: string,
    location: string,
    source: string,
  ): AlertItem {
    return {
      id: uid("alert"),
      severity,
      title,
      message,
      timestamp: Date.now(),
      location,
      source,
      acknowledged: false,
    };
  }

  private makeDetection(rover: RoverTelemetry, verified: boolean): Detection {
    const bearing = rnd(0, 360);
    const distance = verified ? rnd(2.4, 4.5) : rnd(5, 11);
    const rad = (bearing * Math.PI) / 180;
    const d = distance / 111_320;
    const index = this.state.detections.length + 1;
    return {
      targetId: `TARGET-${String(index).padStart(2, "0")}`,
      humanDetected: verified,
      confidence: verified ? Math.round(rnd(82, 94)) : Math.round(rnd(28, 55)),
      distance,
      motion: verified ? "HIGH" : Math.random() > 0.5 ? "LOW" : "MEDIUM",
      bearing,
      latitude: rover.latitude + Math.cos(rad) * d * 6,
      longitude: rover.longitude + Math.sin(rad) * d * 6,
      radarConfirmed: true,
      cameraConfirmed: verified,
      status: verified ? "POSSIBLE_SURVIVOR" : "UNVERIFIED",
      zone: this.state.mission.zone,
      timestamp: Date.now(),
    };
  }

  // ---- operator actions -----------------------------------------------------
  setDisaster(type: DisasterType) {
    const profile = DISASTER_PROFILES[type];
    this.emit({
      mission: {
        ...this.state.mission,
        disasterType: type,
        zone: profile.zone,
        location: profile.location,
      },
      risk: buildRisk(type),
      rover: { ...this.state.rover, latitude: profile.origin[0], longitude: profile.origin[1] },
      trail: [profile.origin],
      detections: [],
      waypoints: [],
      events: [
        ...this.state.events,
        {
          id: uid("ev"),
          time: Date.now(),
          event: `OPERATION SWITCHED TO ${type}`,
          roverId: this.state.rover.roverId,
          location: profile.zone,
          severity: "INFO",
          status: "LOGGED",
          position: profile.origin,
        },
      ],
      alerts: [
        this.makeAlert("INFO", `ACTIVE OPERATION: ${type}`, `${profile.missionName} context loaded for ${profile.zone}.`, profile.zone, "Mission Control"),
        ...this.state.alerts,
      ],
    });
  }

  setRoverStatus(status: RoverTelemetry["status"]) {
    this.emit({ rover: { ...this.state.rover, status, speed: status === "MOVING" ? 0.8 : 0 } });
  }

  setMode(mode: RoverMode) {
    this.emit({ rover: { ...this.state.rover, mode } });
  }

  setSpeed(speed: number) {
    this.emit({ rover: { ...this.state.rover, speed, status: speed > 0 ? "MOVING" : "STOPPED" } });
  }

  nudge(heading: number) {
    this.emit({ rover: { ...this.state.rover, heading, status: "MOVING" } });
  }

  returnToBase() {
    this.setRoverStatus("RETURNING");
    this.logEvent("RETURN TO BASE COMMANDED", "WARNING");
  }

  addWaypoint(latitude: number, longitude: number) {
    const wp: Waypoint = {
      id: uid("wp"),
      latitude,
      longitude,
      label: `WP-${String(this.state.waypoints.length + 1).padStart(2, "0")}`,
      createdAt: Date.now(),
    };
    this.emit({
      waypoints: [...this.state.waypoints, wp],
      alerts: [this.makeAlert("INFO", "NEW WAYPOINT ASSIGNED", `${wp.label} assigned in ${this.state.mission.zone}.`, this.state.mission.zone, "Mission Control"), ...this.state.alerts],
      events: [
        ...this.state.events,
        {
          id: uid("ev"),
          time: Date.now(),
          event: "WAYPOINT ASSIGNED",
          detail: wp.label,
          roverId: this.state.rover.roverId,
          location: this.state.mission.zone,
          severity: "INFO",
          status: "LOGGED",
          position: [latitude, longitude],
        },
      ],
    });
    return wp;
  }

  removeWaypoint(id: string) {
    this.emit({ waypoints: this.state.waypoints.filter((w) => w.id !== id) });
  }

  acknowledgeAlert(id: string) {
    this.emit({ alerts: this.state.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)) });
  }

  acknowledgeAll() {
    this.emit({ alerts: this.state.alerts.map((a) => ({ ...a, acknowledged: true })) });
  }

  verifyTarget(targetId: string) {
    this.emit({
      detections: this.state.detections.map((d) =>
        d.targetId === targetId ? { ...d, status: "VERIFIED", cameraConfirmed: true, humanDetected: true } : d,
      ),
    });
    this.logEvent(`${targetId} VERIFIED BY OPERATOR`, "INFO");
  }

  dismissTarget(targetId: string) {
    this.emit({
      detections: this.state.detections.map((d) => (d.targetId === targetId ? { ...d, status: "DISMISSED" } : d)),
    });
  }

  toggleRiskLayer(id: string) {
    this.emit({
      risk: {
        ...this.state.risk,
        layers: this.state.risk.layers.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l)),
      },
    });
  }

  setConnection(connection: ConnectionState) {
    if (connection === "CONNECTED" && this.state.bufferedEvents > 0) {
      const count = this.state.bufferedEvents;
      this.emit({
        connection,
        bufferedEvents: 0,
        lastSyncAt: Date.now(),
        alerts: [this.makeAlert("INFO", "BUFFERED DATA SYNCHRONISED", `${count} buffered rover events synchronised.`, this.state.mission.zone, "Telemetry Link"), ...this.state.alerts],
      });
      return;
    }
    if (connection === "OFFLINE") {
      this.emit({
        connection,
        alerts: [this.makeAlert("WARNING", "CONNECTION LOST", "Telemetry link degraded. Showing last known mission state.", this.state.mission.zone, "Telemetry Link"), ...this.state.alerts],
      });
      return;
    }
    this.emit({ connection });
  }

  private logEvent(event: string, severity: AlertItem["severity"], position?: [number, number]) {
    this.emit({
      events: [
        ...this.state.events,
        {
          id: uid("ev"),
          time: Date.now(),
          event,
          roverId: this.state.rover.roverId,
          location: this.state.mission.zone,
          severity,
          status: "LOGGED",
          position: position ?? [this.state.rover.latitude, this.state.rover.longitude],
        },
      ],
    });
  }

  // ---- demo sequence --------------------------------------------------------
  startDemo() {
    if (this.state.demoRunning) return;
    this.emit({ demoRunning: true, demoStep: 0 });
    this.runDemoStep(0);
  }

  stopDemo() {
    if (this.demoTimer) clearTimeout(this.demoTimer);
    this.demoTimer = null;
    this.emit({ demoRunning: false, demoStep: 0 });
  }

  private runDemoStep(step: number) {
    const steps: (() => void)[] = [
      () => {
        this.setRoverStatus("MOVING");
        this.logEvent("ROVER ENTERED SEARCH ZONE", "INFO");
      },
      () => {
        this.setRoverStatus("SCANNING");
        this.logEvent("RADAR SWEEP INITIATED", "INFO");
      },
      () => {
        const det = this.makeDetection(this.state.rover, false);
        this.emit({
          detections: [det, ...this.state.detections],
          alerts: [this.makeAlert("WARNING", "RADAR MOTION DETECTED", `Motion at ${det.distance.toFixed(1)} m. Camera verification pending.`, det.zone, "Human Detection"), ...this.state.alerts],
        });
        this.logEvent("HUMAN MOTION DETECTED", "WARNING");
      },
      () => {
        const [first, ...rest] = this.state.detections;
        if (!first) return;
        const verified: Detection = {
          ...first,
          humanDetected: true,
          cameraConfirmed: true,
          confidence: 87,
          distance: 3.2,
          motion: "HIGH",
          status: "POSSIBLE_SURVIVOR",
        };
        this.emit({
          detections: [verified, ...rest],
          alerts: [this.makeAlert("CRITICAL", "POSSIBLE SURVIVOR DETECTED", `${verified.targetId} — 87% confidence at 3.2 m.`, verified.zone, "Human Detection"), ...this.state.alerts],
        });
        this.logEvent("POSSIBLE SURVIVOR IDENTIFIED", "CRITICAL");
      },
      () => {
        const target = this.state.detections[0];
        if (target) this.addWaypoint(target.latitude, target.longitude);
      },
      () => {
        this.setRoverStatus("MOVING");
        this.logEvent("ROVER APPROACHING TARGET", "INFO");
      },
      () => {
        const target = this.state.detections[0];
        if (target) this.verifyTarget(target.targetId);
        this.emit({ mission: { ...this.state.mission, threatLevel: "HIGH" } });
      },
      () => {
        this.logEvent("POST-MISSION REPORT AVAILABLE", "INFO");
        this.emit({ demoRunning: false, demoStep: 0 });
      },
    ];

    if (step >= steps.length) {
      this.emit({ demoRunning: false, demoStep: 0 });
      return;
    }
    steps[step]?.();
    this.emit({ demoStep: step + 1 });
    this.demoTimer = setTimeout(() => this.runDemoStep(step + 1), 3200);
  }

  reset() {
    this.stopDemo();
    this.state = initialState(this.state.mission.disasterType);
    this.listeners.forEach((l) => l(this.state));
  }
}

export const simulation = new SimulationEngine();
