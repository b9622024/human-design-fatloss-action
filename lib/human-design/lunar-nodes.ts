import * as Astronomy from "astronomy-engine";

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

export type LunarNodePosition = {
  northNode: number;
  southNode: number;
  method: "true-node-osculating-orbital-plane";
};

type Vec3 = { x: number; y: number; z: number };

function rotateEqjToTrueEclipticOfDate(vector: Astronomy.Vector, date: Date): Vec3 {
  const rotation = Astronomy.Rotation_EQJ_ECT(date);
  const rotated = Astronomy.RotateVector(rotation, vector);
  return { x: rotated.x, y: rotated.y, z: rotated.z };
}

function moonVectorInCommonEclipticFrame(sampleDate: Date, frameDate: Date): Vec3 {
  // aberration=false keeps this geometric, which is what we want for an
  // instantaneous orbital-plane estimate rather than apparent sky position.
  const eqj = Astronomy.GeoVector(Astronomy.Body.Moon, sampleDate, false);
  return rotateEqjToTrueEclipticOfDate(eqj, frameDate);
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/**
 * Computes the true (osculating) ascending lunar node from the Moon's
 * instantaneous orbital plane. We obtain geocentric Moon vectors slightly
 * before and after the target instant, rotate both into the SAME true
 * ecliptic-of-date frame, estimate velocity by central difference, then use
 * h = r × v. The ascending-node longitude follows from
 * Ω = atan2(h_x, -h_y).
 *
 * This avoids the truncated perturbation series previously used here, which
 * was close enough for most activations but missed a Human Design line
 * boundary in Golden Chart #001.
 */
export function getTrueNodeLongitude(date: Date): number {
  const deltaMs = 30 * 60 * 1000; // 30 minutes on each side
  const before = new Date(date.getTime() - deltaMs);
  const after = new Date(date.getTime() + deltaMs);

  const r = moonVectorInCommonEclipticFrame(date, date);
  const rBefore = moonVectorInCommonEclipticFrame(before, date);
  const rAfter = moonVectorInCommonEclipticFrame(after, date);
  const v = subtract(rAfter, rBefore);
  const h = cross(r, v);

  const longitudeRadians = Math.atan2(h.x, -h.y);
  return normalizeDegrees((longitudeRadians * 180) / Math.PI);
}

export function getTrueLunarNodes(date: Date): LunarNodePosition {
  const northNode = getTrueNodeLongitude(date);
  return {
    northNode,
    southNode: normalizeDegrees(northNode + 180),
    method: "true-node-osculating-orbital-plane",
  };
}
