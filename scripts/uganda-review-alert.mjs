import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const label = 'uganda-jobs-review';
const title = 'Uganda jobs held for review';
const marker = '<!-- pathway-uganda-jobs-review -->';
const safe = value => String(value || 'Not stated').replace(/[\r\n]+/g, ' ').replace(/[\\`*_{}\[\]<>]/g, '\\$&');

export function reviewReport(jobs) {
  const rows = jobs.map(job => ({title:job.title, employer:job.employer,
    flags:[...(job.verification?.flags || [])].sort(), url:job.sourceUrl}));
  rows.sort((a,b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return marker + '\n' + rows.length + ' Uganda vacancies need human review. These listings are not published automatically.\n\n' + rows.map(job => {
    const url = /^https:\/\//i.test(job.url || '') ? '<' + String(job.url).replace(/[<>\r\n]/g, '') + '>' : 'Official link unavailable';
    return '- **' + safe(job.title) + '** — ' + safe(job.employer) + '\n  - Flags: ' + (job.flags.length ? job.flags.map(safe).join('; ') : 'Review required') + '\n  - Official link: ' + url;
  }).join('\n\n') + '\n';
}

// gh is injected so lifecycle and repeat-run behavior can be tested without posting issues.
export function reconcileReview(jobs, gh) {
  gh(['label','create',label,'--color','FBCA04','--description','Uganda vacancies held for human review','--force']);
  const issues = JSON.parse(gh(['issue','list','--label',label,'--state','all','--limit','100','--json','number,title,body,state']));
  const issue = issues.find(issue => issue.title === title && issue.body?.includes(marker));
  if (!jobs.length) {
    if (issue?.state === 'OPEN') gh(['issue','close',String(issue.number),'--comment','The Uganda jobs review queue is empty. Closing this alert automatically.']);
    return 'empty';
  }
  const body = reviewReport(jobs);
  if (!issue) {
    gh(['issue','create','--title',title,'--label',label], body);
    return 'created';
  }
  if (issue.state !== 'OPEN') gh(['issue','reopen',String(issue.number)]);
  if (issue.body.trim() !== body.trim()) {
    gh(['issue','edit',String(issue.number)], body);
    gh(['issue','comment',String(issue.number)], body);
    return 'updated';
  }
  return 'unchanged';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const queue = JSON.parse(fs.readFileSync(new URL('../data/uganda-jobs-review.json',import.meta.url),'utf8'));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(),'uganda-review-'));
  try {
    const gh = (args, body) => {
      if (body !== undefined) {
        const file = path.join(temp,'report.md');
        fs.writeFileSync(file,body);
        args = [...args,'--body-file',file];
      }
      return execFileSync('gh',args,{encoding:'utf8'});
    };
    console.log('Uganda review alert: ' + reconcileReview(queue.jobs || [],gh));
  } finally { fs.rmSync(temp,{recursive:true}); }
}
