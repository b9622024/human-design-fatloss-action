export const RAVE_GATE_SEQUENCE = [
  41, 19, 13, 49, 30, 55, 37, 63,
  22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35,
  45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64,
  47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5,
  26, 11, 10, 58, 38, 54, 61, 60,
] as const;

export const RAVE_GATE_WIDTH = 360 / 64; // 5.625°
export const RAVE_LINE_WIDTH = RAVE_GATE_WIDTH / 6; // 0.9375°
export const RAVE_MANDALA_ORIGIN = 302; // Gate 41.1 starts at 2° Aquarius tropical.

export type GateLine = {
  gate: number;
  line: number;
  longitude: number;
  gateStartLongitude: number;
  offsetWithinGate: number;
};

export function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function longitudeToGateLine(longitude: number): GateLine {
  const lon = normalizeDegrees(longitude);
  const offsetFromOrigin = normalizeDegrees(lon - RAVE_MANDALA_ORIGIN);
  const gateIndex = Math.floor(offsetFromOrigin / RAVE_GATE_WIDTH) % 64;
  const gate = RAVE_GATE_SEQUENCE[gateIndex];
  const gateOffset = offsetFromOrigin - gateIndex * RAVE_GATE_WIDTH;
  const line = Math.min(6, Math.floor(gateOffset / RAVE_LINE_WIDTH) + 1);
  const gateStartLongitude = normalizeDegrees(
    RAVE_MANDALA_ORIGIN + gateIndex * RAVE_GATE_WIDTH,
  );

  return {
    gate,
    line,
    longitude: lon,
    gateStartLongitude,
    offsetWithinGate: gateOffset,
  };
}
