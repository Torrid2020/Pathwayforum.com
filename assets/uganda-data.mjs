export const MAX_DEADLINE_DAYS = 120;

export function normalizeDeadline(value, now = Date.now()) {
  const date = Date.parse(value);
  return Number.isFinite(date) && date <= Number(now) + MAX_DEADLINE_DAYS * 86400000
    ? new Date(date).toISOString() : null;
}
