import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {renderJobPage} from './job-page-template.mjs';
import {storeDescriptions} from './job-description-store.mjs';
import {isRemoved} from './job-removals.mjs';
export const SITE_URL='https://torrid2020.github.io/Pathwayforum.com/';
export function jobSlug(job){return [job.title,job.employer||job.company].join(' ').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,110).replace(/-$/,'')||'job'}
export function pageFile(root,board,slug){if(!['uganda','remote'].includes(board)||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error('Invalid generated job page path');return path.join(root,'jobs',board,slug,'index.html')}
export async function generateJobPages(board,jobs,{root=fileURLToPath(new URL('../',import.meta.url)),now=Date.now()}={}){
 const manifestFile=path.join(root,'data','job-pages-'+board+'.json');let previous={entries:[]},removals=[];
 try{previous=JSON.parse(await fs.readFile(manifestFile,'utf8'))}catch(error){if(error.code!=='ENOENT')throw error}
 try{removals=JSON.parse(await fs.readFile(path.join(root,'data/job-removals.json'),'utf8')).jobs||[]}catch(error){if(error.code!=='ENOENT')throw error}
 jobs=jobs.filter(j=>!isRemoved(j,removals)&&(!(j.deadline||j.expiresAt)||!Number.isFinite(Date.parse(j.deadline||j.expiresAt))||Date.parse(j.deadline||j.expiresAt)>now));
 const archives=previous.entries.filter(old=>!jobs.some(j=>j.id===old.id)&&!isRemoved(old.job,removals)).map(old=>{const end=Date.parse(old.job.deadline||old.job.expiresAt);return {...old,closedAt:old.closedAt||new Date(Number.isFinite(end)&&end<now?end:now).toISOString()}}).filter(old=>now-Date.parse(old.closedAt)<30*86400000);
 jobs=await storeDescriptions(board,jobs,{root,now,preservePaths:archives.map(e=>e.job.descriptionPath).filter(Boolean)});
 const used=new Set(previous.entries.map(e=>e.slug));
 const active=jobs.map(job=>{const old=previous.entries.find(e=>e.id===job.id);let slug=old?.slug||jobSlug(job);if(!old&&used.has(slug))slug+='-'+createHash('sha256').update(job.id).digest('hex').slice(0,8);used.add(slug);return {id:job.id,slug,closedAt:null,job:{...job,pagePath:'jobs/'+board+'/'+slug+'/'}}});
 const entries=[...active,...archives],open=active.map(e=>e.job);
 for(const entry of entries){const file=pageFile(root,board,entry.slug);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,await renderJobPage({board,job:entry.job,jobs:open,index:open.findIndex(j=>j.id===entry.id),root,now,closedAt:entry.closedAt}))}
 for(const old of previous.entries)if(!entries.some(e=>e.id===old.id)){const file=pageFile(root,board,old.slug);try{await fs.unlink(file);await fs.rmdir(path.dirname(file))}catch(error){if(!['ENOENT','ENOTEMPTY'].includes(error.code))throw error}}
 await fs.mkdir(path.dirname(manifestFile),{recursive:true});await fs.writeFile(manifestFile,JSON.stringify({version:1,updatedAt:new Date(now).toISOString(),entries},null,2)+'\n');
 return open;
}
