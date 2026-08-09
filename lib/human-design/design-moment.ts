import { getEclipticLongitude } from "./astronomy";

export type DesignMomentResult = {
  utcDateTime: string;
  birthSunLongitude: number;
  designSunLongitude: number;
  backwardSolarArc: number;
  iterations: number;
  timeErrorSeconds: number;
};

const DAY_MS = 86_400_000;

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function backwardArcDegrees(birthSunLongitude: number, candidateSunLongitude: number): number {
  return normalizeDegrees(birthSunLongitude - candidateSunLongitude);
}

export function solveDesignMoment(birthUtc: Date, targetArc = 88): DesignMomentResult {
  if (Number.isNaN(birthUtc.getTime())) {
    throw new Error("Invalid birth UTC datetime");
  }

  const birthSun = getEclipticLongitude("Sun", birthUtc);
  let earlier = new Date(birthUtc.getTime() - 110 * DAY_MS);
  let later = new Date(birthUtc.getTime() - 60 * DAY_MS);

  let earlierArc = backwardArcDegrees(birthSun, getEclipticLongitude("Sun", earlier));
  let laterArc = backwardArcDegrees(birthSun, getEclipticLongitude("Sun", later));

  if (!(earlierArc >= targetArc && laterArc <= targetArc)) {
    throw new Error(`Unable to bracket Design Moment: arcs ${earlierArc.toFixed(6)} / ${laterArc.toFixed(6)}`);
  }

  let iterations = 0;
  while (later.getTime() - earlier.getTime() > 1000 && iterations < 80) {
    const midpoint = new Date((earlier.getTime() + later.getTime()) / 2);
    const midpointSun = getEclipticLongitude("Sun", midpoint);
    const midpointArc = backwardArcDegrees(birthSun, midpointSun);

    if (midpointArc > targetArc) {
      earlier = midpoint;
      earlierArc = midpointArc;
    } else {
      later = midpoint;
      laterArc = midpointArc;
    }
    iterations += 1;
  }

  const designUtc = new Date((earlier.getTime() + later.getTime()) / 2);
  const designSun = getEclipticLongitude("Sun", designUtc);
  const finalArc = backwardArcDegrees(birthSun, designSun);

  return {
    utcDateTime: designUtc.toISOString(),
    birthSunLongitude: birthSun,
    designSunLongitude: designSun,
    backwardSolarArc: finalArc,
    iterations,
    timeErrorSeconds: (later.getTime() - earlier.getTime()) / 1000,
  };
}
