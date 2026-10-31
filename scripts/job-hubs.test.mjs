import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {generateJobHubs} from './job-hubs.mjs';
test('eight original category hubs filter without changing list order',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'pf-hubs-'));
 try{const jobs=[{id:'b',title:'Finance Officer',category:'Finance',employer:'Example',pagePath:'jobs/uganda/b/'},{id:'a',title:'Accountant',category:'Finance',employer:'Example',pagePath:'jobs/uganda/a/'}];const counts=await generateJobHubs(jobs,{root});assert.equal(Object.keys(counts).length,8);assert.equal(counts.Finance,2);const html=await fs.readFile(path.join(root,'jobs/uganda/categories/finance/index.html'),'utf8');assert(html.indexOf('Finance Officer')<html.indexOf('Accountant'));assert(!html.includes('JobPosting'));
 }finally{assert.equal(path.dirname(root),os.tmpdir());await fs.rm(root,{recursive:true})}
});
