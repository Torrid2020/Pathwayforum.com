export const MAX_DEADLINE_DAYS = 120;

export function normalizeDeadline(value, now = Date.now()) {
  const date = Date.parse(value);
  return Number.isFinite(date) && date <= Number(now) + MAX_DEADLINE_DAYS * 86400000
    ? new Date(date).toISOString() : null;
}

export function cleanLocation(value) {
  const seen = new Set();
  return String(value || '').split(/[,;|]+/).map(part => part.trim().replace(/\s+/g, ' '))
    .filter(part => {
      const key = part.toLowerCase();
      if (!part || /^(?:unavailable|n\/?a|not specified|not stated|remote|undefined|null)$/i.test(part) || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).join(', ');
}
