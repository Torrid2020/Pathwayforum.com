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
