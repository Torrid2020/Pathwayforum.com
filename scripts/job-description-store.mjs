import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {sanitizeDescription} from './job-description-sanitizer.mjs';

export const listJob = ({_description,description,...job}) => job;
export async function storeDescriptions(board,jobs,{root=fileURLToPath(new URL('../',import.meta.url)),now=Date.now(),preservePaths=[]}={}) {
 if(!['uganda','remote'].includes(board))throw Error('Unknown job board');
 const dir=path.join(root,'data','jobs',board);
 await fs.mkdir(dir,{recursive:true});
 const keep=new Set(preservePaths.filter(p=>p.startsWith('data/jobs/'+board+'/')&&/^[a-f0-9]{32}\.json$/.test(path.basename(p))).map(p=>path.basename(p))),output=[];
 for(const original of jobs){
  const end=original.deadline||original.expiresAt;
  if(end&&Number.isFinite(Date.parse(end))&&Date.parse(end)<=now)continue;
  const job=listJob(original);
  const name=createHash('sha256').update(String(job.id)).digest('hex').slice(0,32)+'.json';
  const relative='data/jobs/'+board+'/'+name;
  const file=path.join(dir,name);
  let available=false;
  if(Object.hasOwn(original,'_description')||Object.hasOwn(original,'description')){
   const html=sanitizeDescription(original._description??original.description,job.sourceUrl);
   if(html.replace(/<[^>]*>/g,'').trim()){
    await fs.writeFile(file,JSON.stringify({id:job.id,html,sourceUrl:job.sourceUrl,lastCheckedAt:job.lastCheckedAt||job.lastSeenAt})+'\n');
    available=true;
   }
  }else if(job.descriptionPath===relative){
   // An upstream outage retains the existing file and its original check time, like the list record.
   try{await fs.access(file);available=true}catch{}
  }
  if(available){keep.add(name);job.descriptionPath=relative}else delete job.descriptionPath;
  output.push(job);
 }
 for(const entry of await fs.readdir(dir,{withFileTypes:true})){
  if(entry.isFile()&&/^[a-f0-9]{32}\.json$/.test(entry.name)&&!keep.has(entry.name))await fs.unlink(path.join(dir,entry.name));
 }
 return output;
}
