import { DateTime } from "luxon";

export type NormalizedBirthTime = {
  localDateTime: string;
  timezone: string;
  utcDateTime: string;
  offsetMinutes: number;
};

export function normalizeBirthTime(localDateTime: string, timezone: string): NormalizedBirthTime {
  const parsed = DateTime.fromISO(localDateTime, { zone: timezone, setZone: true });

  if (!parsed.isValid) {
    throw new Error(`Invalid birth datetime/timezone: ${parsed.invalidExplanation ?? parsed.invalidReason ?? "unknown"}`);
  }

  const utc = parsed.toUTC();

  return {
    localDateTime: parsed.toISO({ suppressMilliseconds: true }) ?? localDateTime,
    timezone,
    utcDateTime: utc.toISO({ suppressMilliseconds: true }) ?? "",
    offsetMinutes: parsed.offset,
  };
}
