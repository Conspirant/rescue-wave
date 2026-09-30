import { apiGet, ENDPOINTS } from "./api";
import { simulation } from "@/mock/simulation";

import type {
  AlertItem,
  AnalyticsSummary,
  Detection,
  IncidentKpiSummary,
  Mission,
  MissionEvent,
  RiskData,
  RoverTelemetry,
} from "@/types";

/**
 * Convert backend disaster type into the frontend format.
 */
function normalizeDisasterType(value: string) {
  const type = value.toUpperCase();

  if (
    type === "FLOOD" ||
    type === "LANDSLIDE" ||
    type === "AVALANCHE"
  ) {
    return type;
  }

  return "EARTHQUAKE";
}

/**
 * Get rover status from the RescueWave backend.
 */
export const getRoverStatus = async (): Promise<RoverTelemetry> => {
  const backend = await apiGet<any>(
    ENDPOINTS.roverStatus,
    null
  );

  const location = await apiGet<any>(
    ENDPOINTS.risk,
    null
  );

  const camera = await apiGet<any>(
    ENDPOINTS.camera,
    null
  );

  return {
    roverId: "RW-01",

    status:
      backend.roverStatus === "MOVING"
        ? "MOVING"
        : backend.roverStatus === "STOPPED"
          ? "STOPPED"
          : backend.roverStatus === "SCANNING"
            ? "SCANNING"
            : "IDLE",

    mode: "ASSISTED",

    battery: Number(backend.battery ?? 0),

    signal: 100,

    speed: 0,

    heading: 0,

    latitude: Number(location?.latitude ?? 0),
    longitude: Number(location?.longitude ?? 0),

    gpsStatus: "LOCKED",

    cameraStatus:
      camera?.status === "ONLINE"
        ? "LIVE"
        : camera?.status === "OFFLINE"
          ? "OFFLINE"
          : "STANDBY",

    temperature: 0,

    timestamp: Date.now(),
  };
};

/**
 * Camera status
 */
export const getCameraStatus = async () => {
  const camera = await apiGet<any>(
    ENDPOINTS.camera,
    {
      status: "OFFLINE",
      feedAvailable: false,
      feedType: "NONE",
    }
  );

  return {
    camera:
      camera.status === "ONLINE"
        ? "LIVE"
        : "OFFLINE",
  };
};

/**
 * Detection service.
 *
 * The current backend does not yet have a dedicated
 * /detection/latest endpoint, so the existing frontend
 * simulation remains responsible for detailed detection
 * objects for now.
 */
export const getLatestDetection = () =>
  apiGet<Detection | null>(
    ENDPOINTS.detectionLatest,
    simulation.getSnapshot().detections[0] ?? null
  );

/**
 * Alerts
 *
 * Converts the backend alert format into the format
 * already used by the frontend UI.
 */
export const getAlerts = async (): Promise<AlertItem[]> => {
  const backendAlerts = await apiGet<any[]>(
    ENDPOINTS.alerts,
    []
  );

  const rover = await apiGet<any>(
    ENDPOINTS.roverStatus,
    null
  );

  return backendAlerts.map((alert) => ({
    id: String(alert.id),

    severity:
      alert.severity === "CRITICAL"
        ? "CRITICAL"
        : alert.severity === "WARNING"
          ? "WARNING"
          : "INFO",

    title: String(
      alert.type
        ?.replaceAll("_", " ")
        ?.toUpperCase() ?? "ALERT"
    ),

    message: String(alert.message ?? ""),

    timestamp: new Date(alert.timestamp).getTime(),

    location: String(
      rover?.location ?? "Unknown"
    ),

    source: "RescueWave Backend",

    acknowledged: false,
  }));
};

/**
 * Mission status
 *
 * Your backend currently stores rover status rather than
 * a separate mission table, so we build the frontend
 * mission object from the available rover information.
 */
export const getMissionStatus =
  async (): Promise<Mission> => {
    const backend = await apiGet<any>(
      ENDPOINTS.roverStatus,
      null
    );

    const previousMission =
      simulation.getSnapshot().mission;

    return {
      missionId: previousMission.missionId,

      disasterType: normalizeDisasterType(
        backend.disasterType ?? "Earthquake"
      ),

      location: String(
        backend.location ?? previousMission.location
      ),

      zone: String(
        backend.location ?? previousMission.zone
      ),

      missionStatus: "ACTIVE",

      threatLevel:
        backend.humanDetected &&
        backend.motion === "HIGH"
          ? "CRITICAL"
          : backend.humanDetected
            ? "HIGH"
            : "ELEVATED",

      startedAt: previousMission.startedAt,
    };
  };

/**
 * Mission / detection history
 *
 * Converts the backend history records into the
 * existing MissionEvent format.
 */
export const getMissionHistory =
  async (): Promise<MissionEvent[]> => {
    const history = await apiGet<any[]>(
      ENDPOINTS.missionHistory,
      []
    );

    const rover = await apiGet<any>(
      ENDPOINTS.roverStatus,
      null
    );

    return history.map((item, index) => {
      const detected = Boolean(
        item.humanDetected
      );

      return {
        id: String(item.id ?? index + 1),

        time: new Date(
          `1970-01-01T${item.time}:00`
        ).getTime(),

        event: detected
          ? "HUMAN DETECTED"
          : "ROVER SCAN",

        detail: detected
          ? `Possible human detected at ${item.detectionRange} m`
          : `Motion level: ${item.motion}`,

        roverId: "RW-01",

        location: String(
          rover?.location ?? "Unknown"
        ),

        severity: detected
          ? "WARNING"
          : "INFO",

        status: detected
          ? "UNRESOLVED"
          : "LOGGED",
      };
    });
  };

/**
 * Risk data
 *
 * The backend currently provides the current risk level
 * and rover location. Detailed risk zones/layers continue
 * using the existing frontend disaster profile.
 */
export const getRiskData =
  async (): Promise<RiskData> => {
    const backend = await apiGet<any>(
      ENDPOINTS.risk,
      null
    );

    const currentRisk =
      simulation.getSnapshot().risk;

    const riskLevel =
      backend?.riskLevel === "CRITICAL"
        ? "CRITICAL"
        : backend?.riskLevel === "HIGH"
          ? "HIGH"
          : backend?.riskLevel === "MODERATE"
            ? "MODERATE"
            : "LOW";

    return {
      ...currentRisk,

      riskLevel,

      timestamp: Date.now(),
    };
  };

/**
 * Analytics
 *
 * Detailed analytics are still calculated from the
 * frontend history until a dedicated analytics endpoint
 * is added to the backend.
 */
export function buildAnalytics(): AnalyticsSummary {
  const s = simulation.getSnapshot();

  const severities: AlertItem["severity"][] = [
    "CRITICAL",
    "WARNING",
    "INFO",
  ];

  let distance = 0;

  for (let i = 1; i < s.trail.length; i += 1) {
    const a = s.trail[i - 1];
    const b = s.trail[i];

    if (!a || !b) continue;

    const [aLat = 0, aLon = 0] = a;
    const [bLat = 0, bLon = 0] = b;

    distance += Math.hypot(
      (bLat - aLat) * 111_320,
      (bLon - aLon) * 109_000
    );
  }

  return {
    missionDurationSec: Math.round(
      (Date.now() - s.mission.startedAt) / 1000
    ),

    distanceTravelled: distance,

    batteryConsumed: Number(
      (100 - s.rover.battery).toFixed(1)
    ),

    detections: s.detections.length,

    verifiedTargets: s.detections.filter(
      (d) => d.status === "VERIFIED"
    ).length,

    unverifiedTargets: s.detections.filter(
      (d) => d.status === "UNVERIFIED"
    ).length,

    areaCoverage: Math.min(
      100,
      Math.round(distance / 4)
    ),

    alertsBySeverity: severities.map(
      (severity) => ({
        severity,
        count: s.alerts.filter(
          (a) => a.severity === severity
        ).length,
      })
    ),

    detectionHistory: s.detections
      .slice()
      .reverse()
      .map((d) => ({
        t: new Date(
          d.timestamp
        ).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),

        confidence: d.confidence,
      })),

    batteryHistory: s.history.map((h) => ({
      t: h.t,
      battery: h.battery,
    })),
  };
}

export const getAnalytics = () =>
  apiGet<AnalyticsSummary>(
    ENDPOINTS.analytics,
    buildAnalytics()
  );

/**
 * Incident KPI summary
 */
export function buildIncidentKpiSummary(): IncidentKpiSummary {
  const s = simulation.getSnapshot();

  const highRisk = s.risk.zones.filter(
    (z) =>
      z.level === "HIGH" ||
      z.level === "CRITICAL"
  ).length;

  const modRisk = s.risk.zones.filter(
    (z) => z.level === "MODERATE"
  ).length;

  const safe = s.risk.zones.filter(
    (z) => z.level === "LOW"
  ).length;

  const possibleSurvivors =
    s.detections.filter(
      (d) =>
        d.status === "POSSIBLE_SURVIVOR" ||
        d.humanDetected
    ).length;

  return {
    highRiskZones:
      highRisk > 0 ? highRisk : 12,

    moderateRiskZones:
      modRisk > 0 ? modRisk : 28,

    safeZones:
      safe > 0 ? safe : 14,

    possibleSurvivors:
      possibleSurvivors > 0
        ? possibleSurvivors
        : 3,

    rescueTeamsDeployed: 5,
  };
}

export const getIncidentKpiSummary = () =>
  apiGet<IncidentKpiSummary>(
    ENDPOINTS.missionSummary,
    buildIncidentKpiSummary()
  );