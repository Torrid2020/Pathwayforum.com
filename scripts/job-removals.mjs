import fs from 'node:fs/promises';
export async function loadRemovals(){return JSON.parse(await fs.readFile(new URL('../data/job-removals.json',import.meta.url),'utf8')).jobs||[];}
export function isRemoved(job,removals){return removals.some(entry=>entry.id?entry.id===job.id:Boolean(entry.sourceUrl&&entry.sourceUrl===job.sourceUrl));}
