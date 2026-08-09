import * as Astronomy from "astronomy-engine";

export const SUPPORTED_BODIES = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;

export type SupportedBodyName = (typeof SUPPORTED_BODIES)[number];

export type PlanetaryLongitude = {
  body: SupportedBodyName;
  longitude: number;
};

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function bodyEnum(name: SupportedBodyName): Astronomy.Body {
  return Astronomy.Body[name];
}

export function getEclipticLongitude(body: SupportedBodyName, utcDate: Date): number {
  const vector = Astronomy.GeoVector(bodyEnum(body), utcDate, true);
  const ecliptic = Astronomy.Ecliptic(vector);
  return normalizeDegrees(ecliptic.elon);
}

export function getPlanetaryLongitudes(utcDate: Date): PlanetaryLongitude[] {
  return SUPPORTED_BODIES.map((body) => ({
    body,
    longitude: getEclipticLongitude(body, utcDate),
  }));
}
