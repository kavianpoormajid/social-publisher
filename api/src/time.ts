const OFFSET_MINUTES = 210;
const OFFSET_MS = OFFSET_MINUTES * 60_000;
const DAY_MS = 86_400_000;

export const OFFSET_LABEL = '+03:30';

function pad(value: number, size = 2): string {
  return String(value).padStart(size, '0');
}

/** Formats an epoch value as an ISO 8601 string in the +03:30 zone. */
export function toIso(epochMs: number): string {
  const shifted = new Date(epochMs + OFFSET_MS);
  const date = `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
  const time = `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}`;
  return `${date}T${time}${OFFSET_LABEL}`;
}

/** The calendar day (YYYY-MM-DD) the instant falls on in the +03:30 zone. */
export function localDateKey(epochMs: number): string {
  const shifted = new Date(epochMs + OFFSET_MS);
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

/** Minutes elapsed since local midnight in the +03:30 zone. */
export function localMinuteOfDay(epochMs: number): number {
  const shifted = new Date(epochMs + OFFSET_MS);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

/** Local midnight (+03:30) of the day the instant falls on. */
export function startOfLocalDay(epochMs: number): number {
  return Math.floor((epochMs + OFFSET_MS) / DAY_MS) * DAY_MS - OFFSET_MS;
}

/** Parses 'HH:mm' into minutes since midnight. */
export function parseClock(value: string): number {
  const [hours, minutes] = value.split(':');
  return Number(hours) * 60 + Number(minutes);
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses a `from`/`to` query value. A bare `YYYY-MM-DD` is read as local
 * midnight in the +03:30 zone; anything else goes through Date parsing.
 */
export function parseBoundary(value: string): number | null {
  if (DATE_ONLY.test(value)) {
    const parsed = Date.parse(`${value}T00:00:00${OFFSET_LABEL}`);
    return Number.isNaN(parsed) ? null : parsed;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}
