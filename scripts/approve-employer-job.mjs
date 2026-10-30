// Run only AFTER independently reviewing the employer and vacancy.
import fs from 'node:fs/promises';
const input=process.argv.indexOf('--input');
if(input<0||!process.argv.includes('--approve')){console.error('Usage: node scripts/approve-employer-job.mjs --input PATH_TO_REVIEWED_JSON --approve');process.exit(1)}
const entry=JSON.parse(await fs.readFile(process.argv[input+1],'utf8'));
for(const field of ['id','title','employer','location','closesAt','summary','sourceUrl','applicationUrl'])if(!entry[field]||typeof entry[field]!=='string')throw Error('Missing public vacancy field: '+field);
if(!/\buganda\b/i.test(entry.location))throw Error('The reviewed duty station must explicitly include Uganda');
if(!Number.isFinite(Date.parse(entry.closesAt))||Date.parse(entry.closesAt)<=Date.now())throw Error('A future closing date is required');
for(const field of ['sourceUrl','applicationUrl']){const u=new URL(entry[field]);if(u.protocol!=='https:'||u.username||u.password)throw Error('Public HTTPS links required')}
const file=new URL('../data/employer-jobs-approved.json',import.meta.url),data=JSON.parse(await fs.readFile(file,'utf8'));
const allowed=['id','title','employer','location','employmentType','experience','closesAt','summary','sourceUrl','applicationUrl','sector'];
const job=Object.fromEntries(allowed.filter(k=>entry[k]).map(k=>[k,entry[k]]));
job.status='approved';job.approvedBy='James Ocora';job.approvedAt=new Date().toISOString();
data.jobs=[...(data.jobs||[]).filter(x=>x.id!==job.id),job];
await fs.writeFile(file,JSON.stringify(data,null,2)+'\n');
console.log('Approved public record saved. Recruiter contact fields were excluded. Run node scripts/sync-uganda-jobs.mjs, review the feed, then commit and push.');
