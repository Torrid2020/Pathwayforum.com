export const LEVELS = ['Internship / trainee', 'Entry level', 'Mid level', 'Senior / management', 'Not stated'];

// Infer from role requirements, never from incidental mentions of a manager in a summary.
export function inferLevel(job) {
  const title = String(job.title || '');
  const body = [job.experience, job.summary, job.description].filter(Boolean).join(' ');
  if (/\b(senior|manager|director|head\b|chief|lead|leader|principal|vice president)\b/i.test(title)) return LEVELS[3];
  if (/\b(intern(?:ship)?|trainee|apprentice|graduate (?:programme|program|scheme))\b/i.test(title)) return LEVELS[0];
  const normalized = body.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/gi, word => ({one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10})[word.toLowerCase()]);
  const years = [...normalized.matchAll(/\b(\d+)(?:\s*(?:[-–]|to)\s*\d+)?\s*\+?\s*years?['’]?\s*(?:of\s*)?(?:(?:relevant|professional|work|related)\s*)?experience/gi)].map(m => +m[1]);
  // Some feeds supply only a concise experience field.
  const concise = String(job.experience || '').match(/^(?:up to |at least |minimum )?(\d+)\s*years?\b/i);
  if (concise) years.push(+concise[1]);
  const required = years.length ? Math.max(...years) : null;
  if (required !== null && required >= 6) return LEVELS[3];
  if (required !== null && required >= 3) return LEVELS[2];
  if (required !== null || /\b(entry.level|junior|assistant|graduate|receptionist|cashier|data entry)\b/i.test(title) || /\b(entry.level|fresh graduates?|no (?:prior |previous )?experience)\b/i.test(body)) return LEVELS[1];
  if (/\bmid[ -]level\b/i.test(title + ' ' + body)) return LEVELS[2];
  return LEVELS[4];
}

export function compareUgandaJobs(a, b) {
  const senior = job => (job.level || inferLevel(job)) === LEVELS[3];
  const closes = job => Number.isFinite(Date.parse(job.deadline)) ? Date.parse(job.deadline) : Infinity;
  return Number(senior(a)) - Number(senior(b)) || closes(a) - closes(b) || String(a.title).localeCompare(String(b.title));
}

export const ugandaExamples = jobs => jobs.filter(job => [LEVELS[1], LEVELS[2]].includes(job.level || inferLevel(job))).sort(compareUgandaJobs).slice(0, 2);
