import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {generateJobPages,jobSlug,pageFile} from './job-pages.mjs';
test('job page slugs are safe, unique and stable when a title changes',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'pf-pages-'));
 try{let jobs=await generateJobPages('uganda',[{id:'a',title:'Finance Officer',employer:'Educate!',applicationUrl:'https://example.org/a'},{id:'b',title:'Finance Officer',employer:'Educate!',applicationUrl:'https://example.org/b'}],{root});
 assert.equal(jobSlug(jobs[0]),'finance-officer-educate');assert.notEqual(jobs[0].pagePath,jobs[1].pagePath);
 const original=jobs[0].pagePath;jobs=await generateJobPages('uganda',[{...jobs[0],title:'Renamed role'}],{root});assert.equal(jobs[0].pagePath,original);assert(await fs.readFile(path.join(root,original,'index.html'),'utf8'));assert.throws(()=>pageFile(root,'uganda','../escape'));
 }finally{assert.equal(path.dirname(root),os.tmpdir());await fs.rm(root,{recursive:true})}
});

test('closed pages and descriptions survive 30 days without Apply, then are purged',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'pf-archive-')),now=Date.parse('2026-10-31T00:00:00Z');
 try{const [j]=await generateJobPages('uganda',[{id:'archive',title:'Officer',employer:'Example',_description:'<p>Full description</p>',sourceUrl:'https://example.org/1',applicationUrl:'https://example.org/apply'}],{root,now});
 await generateJobPages('uganda',[],{root,now:now+86400000});const file=path.join(root,j.pagePath,'index.html');const html=await fs.readFile(file,'utf8');assert(html.includes('This job has closed'));assert(!/<a[^>]*data-apply/.test(html));assert(await fs.readFile(path.join(root,j.descriptionPath)));
 await generateJobPages('uganda',[],{root,now:now+32*86400000});await assert.rejects(()=>fs.access(file));await assert.rejects(()=>fs.access(path.join(root,j.descriptionPath)));
 }finally{assert.equal(path.dirname(root),os.tmpdir());await fs.rm(root,{recursive:true})}
});

test('embedded job metadata preserves text without allowing script termination',async()=>{const {renderJobPage}=await import('./job-page-template.mjs');const title='</script><img src=x onerror=bad()>';const html=await renderJobPage({board:'uganda',job:{id:'safe',title,employer:'Example',pagePath:'jobs/uganda/safe/'},jobs:[],index:-1,root:os.tmpdir(),now:Date.now()});const json=html.match(/<script type="application\/json" id="job-page-data">([\s\S]*?)<\/script>/)[1];assert.equal(JSON.parse(json).job.title,title);assert(!html.includes('<img src=x'));});

test('explicit removals delete pages immediately rather than retaining them as closed',async()=>{const root=await fs.mkdtemp(path.join(os.tmpdir(),'pf-remove-page-'));try{const[j]=await generateJobPages('uganda',[{id:'remove',title:'Officer',employer:'Example',_description:'<p>Description</p>'}],{root});await fs.writeFile(path.join(root,'data/job-removals.json'),JSON.stringify({jobs:[{id:'remove'}]}));await generateJobPages('uganda',[],{root});await assert.rejects(()=>fs.access(path.join(root,j.pagePath,'index.html')));await assert.rejects(()=>fs.access(path.join(root,j.descriptionPath)));}finally{assert.equal(path.dirname(root),os.tmpdir());await fs.rm(root,{recursive:true})}});
