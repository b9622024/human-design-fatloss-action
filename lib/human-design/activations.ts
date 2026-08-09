import { getPlanetaryLongitudes, PlanetaryLongitude } from "@/lib/human-design/astronomy";
import { getTrueLunarNodes } from "@/lib/human-design/lunar-nodes";
import { longitudeToGateLine, normalizeDegrees } from "@/lib/human-design/rave-mandala";

export type ActivationBody =
  | "Sun"
  | "Earth"
  | "Moon"
  | "NorthNode"
  | "SouthNode"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto";

export type HumanDesignActivation = {
  body: ActivationBody;
  longitude: number;
  gate: number;
  line: number;
};

function findLongitude(planets: PlanetaryLongitude[], body: PlanetaryLongitude["body"]): number {
  const item = planets.find((planet) => planet.body === body);
  if (!item) throw new Error(`Missing planetary longitude for ${body}`);
  return item.longitude;
}

function activation(body: ActivationBody, longitude: number): HumanDesignActivation {
  const mapped = longitudeToGateLine(longitude);
  return {
    body,
    longitude: mapped.longitude,
    gate: mapped.gate,
    line: mapped.line,
  };
}

export function buildHumanDesignActivations(date: Date): HumanDesignActivation[] {
  const planets = getPlanetaryLongitudes(date);
  const sunLongitude = findLongitude(planets, "Sun");
  const nodes = getTrueLunarNodes(date);

  const byBody = new Map(planets.map((planet) => [planet.body, planet.longitude]));

  return [
    activation("Sun", sunLongitude),
    activation("Earth", normalizeDegrees(sunLongitude + 180)),
    activation("Moon", byBody.get("Moon")!),
    activation("NorthNode", nodes.northNode),
    activation("Mercury", byBody.get("Mercury")!),
    activation("Venus", byBody.get("Venus")!),
    activation("Mars", byBody.get("Mars")!),
    activation("Jupiter", byBody.get("Jupiter")!),
    activation("Saturn", byBody.get("Saturn")!),
    activation("Uranus", byBody.get("Uranus")!),
    activation("Neptune", byBody.get("Neptune")!),
    activation("Pluto", byBody.get("Pluto")!),
    activation("SouthNode", nodes.southNode),
  ];
}

export function activationsToGateLineRecord(
  activations: HumanDesignActivation[],
): Record<string, [number, number]> {
  return Object.fromEntries(
    activations.map((item) => [item.body, [item.gate, item.line] as [number, number]]),
  );
}
