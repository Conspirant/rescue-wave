/**
 * Centralised API layer.
 *
 * The frontend UI does not call backend URLs directly.
 * Backend endpoint paths are defined here.
 */

export const API_BASE_URL: string =
  import.meta.env["VITE_API_BASE_URL"] ?? "";

export const DEBUG_MODE: boolean =
  import.meta.env["VITE_DEBUG_MODE"] === "true";

export const IS_MOCK_MODE = API_BASE_URL.length === 0;

/**
 * RescueWave backend endpoints
 */
export const ENDPOINTS = {
  roverStatus: "/api/rover/status",
  alerts: "/api/alerts",
  missionHistory: "/api/rover/history",
  risk: "/api/rover/location",
  camera: "/api/rover/camera",

  // These backend endpoints are not implemented yet.
  // The frontend will keep its existing simulation data for them.
  detectionLatest: "/detection/latest",
  missionStatus: "/mission/status",
  analytics: "/analytics",
  missionSummary: "/mission/summary",
} as const;

export async function apiGet<T>(
  path: string,
  fallback: T
): Promise<T> {
  if (IS_MOCK_MODE) return fallback;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  return (await res.json()) as T;
}

export async function apiPost<
  TBody,
  TResponse = unknown
>(
  path: string,
  body: TBody,
  fallback?: TResponse
): Promise<TResponse> {
  if (IS_MOCK_MODE) {
    return (fallback ?? {}) as TResponse;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`POST ${path} failed (${res.status})`);
  }

  return (await res.json()) as TResponse;
}