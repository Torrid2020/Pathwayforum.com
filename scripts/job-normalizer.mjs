// Shared final metadata normalization for every Uganda and remote collector.
const types = new Map([
 ['fulltime','Full-time'], ['parttime','Part-time'],
 ['contract','Contract'], ['contractor','Contract'], ['freelance','Contract'], ['fixedtermcontract','Contract'],
 ['internship','Internship'], ['intern','Internship'], ['trainee','Internship'],
 ['temporary','Temporary'], ['temp','Temporary'], ['volunteer','Volunteer'], ['volunteering','Volunteer'],
 ['seeofficiallisting','See official listing']
]);
export function normalizeEmploymentType(value) {
 if (Array.isArray(value)) {
  const normalized = [...new Set(value.map(normalizeEmploymentType))];
  return normalized.length === 1 ? normalized[0] : 'See official listing';
 }
 if (typeof value !== 'string') return 'See official listing';
 return types.get(value.trim().toLowerCase().replace(/[\s_-]+/g,'')) || 'See official listing';
}
export function normalizeJobMetadata(job) {
 return {...job, employmentType: normalizeEmploymentType(job.employmentType)};
}
