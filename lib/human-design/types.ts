export type HumanDesignCalculationStatus = "pending" | "valid" | "invalid";

export interface BirthInput {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface HumanDesignCalculationMeta {
  engine: "self";
  engineVersion: string;
  validationStatus: HumanDesignCalculationStatus;
}

export interface HumanDesignChart {
  calculationMeta: HumanDesignCalculationMeta;
  type: string | null;
  strategy: string | null;
  authority: string | null;
  profile: string | null;
  definition: string | null;
  centers: unknown[];
  channels: unknown[];
  gates: unknown[];
  personalityActivations: unknown[];
  designActivations: unknown[];
}
