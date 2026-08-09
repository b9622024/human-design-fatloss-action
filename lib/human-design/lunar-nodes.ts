const J2000_EPOCH = 2451545.0;
const DAYS_PER_JULIAN_CENTURY = 36525;
const DEG_TO_RAD = Math.PI / 180;

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function dateToJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export type LunarNodePosition = {
  northNode: number;
  southNode: number;
  method: "true-node-meeus-perturbation-series";
};

export function getTrueNodeLongitudeFromJulianDate(jd: number): number {
  const T = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_CENTURY;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  const D =
    (297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000) *
    DEG_TO_RAD;
  const M =
    (357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000) *
    DEG_TO_RAD;
  const Mprime =
    (134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000) *
    DEG_TO_RAD;
  const F =
    (93.272095 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000) *
    DEG_TO_RAD;

  let omega =
    125.0445479 -
    1934.1362891 * T +
    0.0020754 * T2 +
    T3 / 467441 -
    T4 / 60616000;

  const perturbations =
    -1.4979 * Math.sin(2 * (D - F)) +
    -0.15 * Math.sin(M) +
    -0.1226 * Math.sin(2 * D) +
    0.1176 * Math.sin(2 * F) +
    -0.0801 * Math.sin(2 * (Mprime - F)) +
    0.0943 * Math.sin(2 * (D + F)) +
    0.0582 * Math.sin(2 * D - Mprime) +
    -0.0539 * Math.sin(Mprime - 2 * F) +
    -0.0458 * Math.sin(2 * D - M) +
    0.0327 * Math.sin(2 * D + Mprime) +
    -0.0304 * Math.sin(Mprime + 2 * F) +
    -0.0173 * Math.sin(2 * (D - Mprime)) +
    -0.0168 * Math.sin(M + 2 * F) +
    0.0119 * Math.sin(Mprime) +
    0.0107 * Math.sin(M - 2 * F) +
    -0.0102 * Math.sin(2 * D + M) +
    -0.0081 * Math.sin(2 * Mprime);

  omega += perturbations;
  return normalizeDegrees(omega);
}

export function getTrueLunarNodes(date: Date): LunarNodePosition {
  const northNode = getTrueNodeLongitudeFromJulianDate(dateToJulianDate(date));
  return {
    northNode,
    southNode: normalizeDegrees(northNode + 180),
    method: "true-node-meeus-perturbation-series",
  };
}
