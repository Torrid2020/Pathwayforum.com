import {normalizeDeadline} from './uganda-data.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function checkedDate(value) {
 const date=new Date(value);
 return value && Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(date) : 'Not recorded';
}
export function trustMarkup(job) {
 const deadline=normalizeDeadline(job.deadline||job.expiresAt);
 const checked=job.lastCheckedAt||job.lastSeenAt||job.verification?.checkedAt;
 const source=job.source==='Himalayas'?'<a href="https://himalayas.app" target="_blank" rel="noopener">via Himalayas</a>':esc(job.source);
 return `<div class="job-trust"><p><span class="job-source">Source: ${source}</span> · Last checked ${esc(checkedDate(checked))} · ${deadline?'Deadline: '+esc(checkedDate(deadline)):'Check the official deadline'}</p><p>Pathway Forum never charges fees. Never pay to apply.</p><a class="report-job" href="mailto:james.torrid1805@gmail.com?subject=${esc(encodeURIComponent('Report job: '+job.title))}">Report this job</a></div>`;
}
