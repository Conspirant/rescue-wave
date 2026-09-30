import type { DisasterType, RiskLayer, RiskZone } from "@/types";

export interface DisasterProfile {
  type: DisasterType;
  missionName: string;
  zone: string;
  location: string;
  origin: [number, number];
  headline: string;
  layers: Omit<RiskLayer, "enabled">[];
  zones: RiskZone[];
  terrain: string;
}

export const DISASTER_PROFILES: Record<DisasterType, DisasterProfile> = {
  EARTHQUAKE: {
    type: "EARTHQUAKE",
    missionName: "EARTHQUAKE RESPONSE",
    zone: "ZONE B",
    location: "Bengaluru Sector 4",
    origin: [12.9716, 77.5946],
    headline: "Structural instability",
    terrain: "Collapsed mid-rise block, debris field",
    layers: [
      { id: "structural", label: "Structural instability", level: "HIGH", value: 74, unit: "%" },
      { id: "debris", label: "Debris density", level: "CRITICAL", value: 88, unit: "%" },
      { id: "aftershock", label: "Aftershock risk", level: "MODERATE", value: 46, unit: "%" },
    ],
    zones: [
      {
        id: "A",
        name: "ZONE A",
        probability: 82,
        level: "CRITICAL",
        factors: ["Historical instability", "Soft-storey structures"],
        center: [12.9726, 77.5932],
        radius: 120,
      },
      {
        id: "B",
        name: "ZONE B",
        probability: 67,
        level: "HIGH",
        factors: ["Debris field", "Partial collapse"],
        center: [12.9712, 77.5951],
        radius: 100,
      },
      {
        id: "C",
        name: "ZONE C",
        probability: 31,
        level: "MODERATE",
        factors: ["Citizen reports"],
        center: [12.9701, 77.5968],
        radius: 90,
      },
    ],
  },
  FLOOD: {
    type: "FLOOD",
    missionName: "FLOOD RESPONSE",
    zone: "ZONE C",
    location: "Riverside District 2",
    origin: [12.9695, 77.5975],
    headline: "Water depth / current",
    terrain: "Submerged roads, 1.4 m standing water",
    layers: [
      { id: "depth", label: "Water depth", level: "HIGH", value: 1.4, unit: "m" },
      { id: "current", label: "Current velocity", level: "MODERATE", value: 0.9, unit: "m/s" },
      { id: "level", label: "Flood level", level: "HIGH", value: 71, unit: "%" },
      { id: "route", label: "Safe route availability", level: "MODERATE", value: 52, unit: "%" },
    ],
    zones: [
      {
        id: "C",
        name: "ZONE C",
        probability: 78,
        level: "CRITICAL",
        factors: ["Heavy rainfall", "Drain overflow"],
        center: [12.9691, 77.5981],
        radius: 130,
      },
      {
        id: "D",
        name: "ZONE D",
        probability: 54,
        level: "HIGH",
        factors: ["Low-lying terrain"],
        center: [12.9708, 77.5992],
        radius: 100,
      },
      {
        id: "E",
        name: "ZONE E",
        probability: 26,
        level: "LOW",
        factors: ["Elevated ground"],
        center: [12.9679, 77.5959],
        radius: 80,
      },
    ],
  },
  LANDSLIDE: {
    type: "LANDSLIDE",
    missionName: "LANDSLIDE RESPONSE",
    zone: "ZONE A",
    location: "Hill Road Corridor",
    origin: [12.9752, 77.5901],
    headline: "Terrain instability",
    terrain: "Loose slope, 34° gradient, debris runout",
    layers: [
      { id: "terrain", label: "Terrain instability", level: "CRITICAL", value: 84, unit: "%" },
      { id: "slope", label: "Slope", level: "HIGH", value: 34, unit: "°" },
      { id: "debris", label: "Debris zone", level: "HIGH", value: 69, unit: "%" },
      { id: "secondary", label: "Secondary slide risk", level: "MODERATE", value: 48, unit: "%" },
    ],
    zones: [
      {
        id: "A",
        name: "ZONE A",
        probability: 85,
        level: "CRITICAL",
        factors: ["Saturated soil", "Historical slides"],
        center: [12.9758, 77.5895],
        radius: 110,
      },
      {
        id: "B",
        name: "ZONE B",
        probability: 49,
        level: "MODERATE",
        factors: ["Slope gradient"],
        center: [12.9741, 77.5912],
        radius: 95,
      },
      {
        id: "F",
        name: "ZONE F",
        probability: 22,
        level: "LOW",
        factors: ["Stabilised terrace"],
        center: [12.9766, 77.5921],
        radius: 80,
      },
    ],
  },
  AVALANCHE: {
    type: "AVALANCHE",
    missionName: "AVALANCHE RESPONSE",
    zone: "ZONE D",
    location: "North Ridge Pass",
    origin: [12.9781, 77.5869],
    headline: "Snow / slope risk",
    terrain: "Snowpack 2.1 m, north-facing couloir",
    layers: [
      { id: "snow", label: "Snow depth", level: "HIGH", value: 2.1, unit: "m" },
      { id: "slope", label: "Slope", level: "HIGH", value: 38, unit: "°" },
      { id: "probability", label: "Avalanche probability", level: "CRITICAL", value: 76, unit: "%" },
      { id: "corridor", label: "Safe corridor", level: "MODERATE", value: 44, unit: "%" },
    ],
    zones: [
      {
        id: "D",
        name: "ZONE D",
        probability: 76,
        level: "CRITICAL",
        factors: ["Fresh snow load", "Wind slab"],
        center: [12.9787, 77.5862],
        radius: 140,
      },
      {
        id: "G",
        name: "ZONE G",
        probability: 51,
        level: "HIGH",
        factors: ["Steep couloir"],
        center: [12.9772, 77.5881],
        radius: 100,
      },
      {
        id: "H",
        name: "ZONE H",
        probability: 18,
        level: "LOW",
        factors: ["Sheltered basin"],
        center: [12.9795, 77.5889],
        radius: 90,
      },
    ],
  },
};

export const DISASTER_TYPES = Object.keys(DISASTER_PROFILES) as DisasterType[];
