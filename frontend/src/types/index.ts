// Shared data contracts. Mock data and real backend data MUST use these types.

export type DisasterType = "EARTHQUAKE" | "FLOOD" | "LANDSLIDE" | "AVALANCHE";

export type ConnectionState = "CONNECTED" | "RECONNECTING" | "OFFLINE" | "ERROR";

export type RoverStatus = "IDLE" | "MOVING" | "SCANNING" | "RETURNING" | "STOPPED" | "OFFLINE";

export type RoverMode = "AUTO" | "MANUAL" | "ASSISTED";

export interface RoverTelemetry {
  roverId: string;
  status: RoverStatus;
  mode: RoverMode;
  battery: number;
  signal: number;
  speed: number;
  heading: number;
  latitude: number;
  longitude: number;
  gpsStatus: "LOCKED" | "SEARCHING" | "LOST";
  cameraStatus: "LIVE" | "STANDBY" | "OFFLINE";
  temperature: number;
  timestamp: number;
}

export type MotionLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export type TargetStatus = "UNVERIFIED" | "POSSIBLE_SURVIVOR" | "VERIFIED" | "DISMISSED";

export interface Detection {
  targetId: string;
  humanDetected: boolean;
  confidence: number;
  distance: number;
  motion: MotionLevel;
  bearing: number;
  latitude: number;
  longitude: number;
  radarConfirmed: boolean;
  cameraConfirmed: boolean;
  status: TargetStatus;
  zone: string;
  timestamp: number;
}

export type ThreatLevel = "LOW" | "ELEVATED" | "HIGH" | "CRITICAL";

export interface Mission {
  missionId: string;
  disasterType: DisasterType;
  location: string;
  zone: string;
  missionStatus: "ACTIVE" | "PAUSED" | "COMPLETE";
  threatLevel: ThreatLevel;
  startedAt: number;
}

export type AlertSeverity = "CRITICAL" | "WARNING" | "INFO";

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  location: string;
  source: string;
  acknowledged: boolean;
}

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface RiskLayer {
  id: string;
  label: string;
  level: RiskLevel;
  value: number;
  unit?: string;
  enabled: boolean;
}

export interface RiskZone {
  id: string;
  name: string;
  probability: number;
  level: RiskLevel;
  factors: string[];
  center: [number, number];
  radius: number;
}

export interface RiskData {
  disasterType: DisasterType;
  riskLevel: RiskLevel;
  layers: RiskLayer[];
  zones: RiskZone[];
  timestamp: number;
}

export interface MissionEvent {
  id: string;
  time: number;
  event: string;
  detail?: string;
  roverId: string;
  location: string;
  severity: AlertSeverity;
  status: "RESOLVED" | "UNRESOLVED" | "LOGGED";
  position?: [number, number];
}

export interface Waypoint {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  createdAt: number;
}

export interface AnalyticsSummary {
  missionDurationSec: number;
  distanceTravelled: number;
  batteryConsumed: number;
  detections: number;
  verifiedTargets: number;
  unverifiedTargets: number;
  areaCoverage: number;
  alertsBySeverity: { severity: AlertSeverity; count: number }[];
  detectionHistory: { t: string; confidence: number }[];
  batteryHistory: { t: string; battery: number }[];
}

export interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  connected: boolean;
  lastUpdated: number | null;
}

export interface IncidentKpiSummary {
  highRiskZones: number;
  moderateRiskZones: number;
  safeZones: number;
  possibleSurvivors: number;
  rescueTeamsDeployed: number;
}

