import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { simulation, type SimulationSnapshot } from "@/mock/simulation";
import { IS_MOCK_MODE, ENDPOINTS, apiGet } from "@/services/api";
import {
  getAlerts,
  getMissionHistory,
  getMissionStatus,
  getRiskData,
  getRoverStatus,
} from "@/services";
import type { AsyncState, AlertItem, Detection, Mission, RiskData, RoverTelemetry } from "@/types";

interface RescueWaveContextValue {
  state: SimulationSnapshot;
  actions: typeof simulation;
  mockMode: boolean;
}

const RescueWaveContext = createContext<RescueWaveContextValue | null>(null);

export function RescueWaveProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimulationSnapshot>(() => simulation.getSnapshot());

  useEffect(() => {
    // When no VITE_API_BASE_URL is set, run on local simulation
    if (IS_MOCK_MODE) {
      return simulation.subscribe(setState);
    }

    // When backend origin is provided, poll live REST endpoints
    let isMounted = true;

    async function fetchLiveData() {
      try {
        const [roverRes, detRes, alertsRes, missionRes, riskRes, eventsRes] = await Promise.allSettled([
          getRoverStatus(),
          apiGet<Detection[] | Detection | null>(ENDPOINTS.detectionLatest, []),
          getAlerts(),
          getMissionStatus(),
          getRiskData(),
          getMissionHistory(),
        ]);

        if (!isMounted) return;

        setState((prev) => {
          let updatedDetections = prev.detections;
          if (detRes.status === "fulfilled" && detRes.value) {
            updatedDetections = Array.isArray(detRes.value) ? detRes.value : [detRes.value];
          }

          const isLive = roverRes.status === "fulfilled";

          return {
            ...prev,
            connection: isLive ? "CONNECTED" : "OFFLINE",
            lastTelemetryAt: Date.now(),
            rover: roverRes.status === "fulfilled" ? roverRes.value : prev.rover,
            detections: updatedDetections,
            alerts: alertsRes.status === "fulfilled" ? alertsRes.value : prev.alerts,
            mission: missionRes.status === "fulfilled" ? missionRes.value : prev.mission,
            risk: riskRes.status === "fulfilled" ? riskRes.value : prev.risk,
            events: eventsRes.status === "fulfilled" ? eventsRes.value : prev.events,
          };
        });
      } catch {
        if (!isMounted) return;
        setState((prev) => ({
          ...prev,
          connection: "OFFLINE",
        }));
      }
    }

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const value = useMemo(
    () => ({ state, actions: simulation, mockMode: IS_MOCK_MODE }),
    [state]
  );

  return <RescueWaveContext.Provider value={value}>{children}</RescueWaveContext.Provider>;
}

export function useRescueWave() {
  const ctx = useContext(RescueWaveContext);
  if (!ctx) throw new Error("useRescueWave must be used inside RescueWaveProvider");
  return ctx;
}

function wrap<T>(data: T, connected: boolean, lastUpdated: number): AsyncState<T> {
  return { data, loading: false, error: null, connected, lastUpdated };
}

export function useRoverTelemetry(): AsyncState<RoverTelemetry> {
  const { state } = useRescueWave();
  return wrap(state.rover, state.connection === "CONNECTED", state.lastTelemetryAt);
}

export function useDetection(): AsyncState<Detection[]> {
  const { state } = useRescueWave();
  return wrap(state.detections, state.connection === "CONNECTED", state.lastTelemetryAt);
}

export function useAlerts(): AsyncState<AlertItem[]> {
  const { state } = useRescueWave();
  return wrap(state.alerts, state.connection === "CONNECTED", state.lastTelemetryAt);
}

export function useMission(): AsyncState<Mission> {
  const { state } = useRescueWave();
  return wrap(state.mission, state.connection === "CONNECTED", state.lastTelemetryAt);
}

export function useRiskData(): AsyncState<RiskData> {
  const { state } = useRescueWave();
  return wrap(state.risk, state.connection === "CONNECTED", state.risk.timestamp);
}
