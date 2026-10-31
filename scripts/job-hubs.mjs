import fs from 'node:fs/promises';
import path from 'node:path';
import {JOB_HUBS,hubPath} from '../assets/job-hubs.mjs';
import {shell,escapeHtml as e,deadlineText} from './job-page-template.mjs';
export async function generateJobHubs(jobs,{root,now=Date.now()}){
 const prefix='../../../../',parts=await shell(root,prefix),counts={};
 for(const hub of JOB_HUBS){const rows=jobs.filter(hub.match);counts[hub.name]=rows.length;const file=path.join(root,hubPath(hub),'index.html');await fs.mkdir(path.dirname(file),{recursive:true});
 await fs.writeFile(file,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(hub.name)} jobs in Uganda | Pathway Forum</title><link rel="stylesheet" href="${prefix}assets/site-shell.css"><link rel="stylesheet" href="${prefix}assets/job-pages.css"><link rel="icon" href="${prefix}assets/favicon.svg"></head><body>${parts.header}<main class="job-page"><nav class="job-breadcrumb" aria-label="Breadcrumb"><a href="${prefix}uganda-jobs.html">Jobs in Uganda</a> › ${e(hub.name)}</nav><h1>${e(hub.name)} jobs in Uganda</h1><p class="job-hub-intro">${e(hub.intro)}</p><p id="hub-count">${rows.length} open ${rows.length===1?'job':'jobs'}</p><ul class="job-hub-list">${rows.map(j=>`<li data-job-id="${e(j.id)}"><h2><a href="${prefix+j.pagePath}">${e(j.title)}</a></h2><p>${e(j.employer)} · ${e(j.location)} · ${e(j.level)}</p><p>${e(deadlineText(j,now))}</p></li>`).join('')}</ul>${rows.length?'':'<p>No open roles in this category right now. Check the full Uganda board for other opportunities.</p>'}<p><a href="${prefix}uganda-jobs.html">See all jobs in Uganda →</a></p></main>${parts.footer}<script src="${prefix}assets/site-shell.js"></script></body></html>`);
 }return counts;
}
