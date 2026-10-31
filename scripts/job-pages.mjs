import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {renderJobPage} from './job-page-template.mjs';
export const SITE_URL='https://torrid2020.github.io/Pathwayforum.com/';
export function jobSlug(job){return [job.title,job.employer||job.company].join(' ').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,110).replace(/-$/,'')||'job';}
export function pageFile(root,board,slug){if(!['uganda','remote'].includes(board)||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error('Invalid generated job page path');return path.join(root,'jobs',board,slug,'index.html');}
export async function generateJobPages(board,jobs,{root=fileURLToPath(new URL('../',import.meta.url)),now=Date.now()}={}){
 const manifestFile=path.join(root,'data','job-pages-'+board+'.json');
 let previous={entries:[]};try{previous=JSON.parse(await fs.readFile(manifestFile,'utf8'))}catch(error){if(error.code!=='ENOENT')throw error}
 const used=new Set(previous.entries.map(e=>e.slug));
 const entries=jobs.map(job=>{
  const old=previous.entries.find(e=>e.id===job.id);let slug=old?.slug||jobSlug(job);
  if(!old&&used.has(slug))slug+='-'+createHash('sha256').update(job.id).digest('hex').slice(0,8);
  used.add(slug);return {id:job.id,slug,job:{...job,pagePath:'jobs/'+board+'/'+slug+'/'}};
 });
 for(let index=0;index<entries.length;index++){
  const entry=entries[index],file=pageFile(root,board,entry.slug);await fs.mkdir(path.dirname(file),{recursive:true});
  await fs.writeFile(file,await renderJobPage({board,job:entry.job,jobs:entries.map(e=>e.job),index,root,now}));
 }
 for(const old of previous.entries)if(!entries.some(e=>e.id===old.id)){const file=pageFile(root,board,old.slug);try{await fs.unlink(file);await fs.rmdir(path.dirname(file))}catch(error){if(!['ENOENT','ENOTEMPTY'].includes(error.code))throw error}}
 await fs.mkdir(path.dirname(manifestFile),{recursive:true});await fs.writeFile(manifestFile,JSON.stringify({version:1,updatedAt:new Date(now).toISOString(),entries},null,2)+'\n');
 return entries.map(e=>e.job);
}
