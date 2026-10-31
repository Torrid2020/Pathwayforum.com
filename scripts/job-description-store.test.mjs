import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {storeDescriptions} from './job-description-store.mjs';
test('separate description files refresh, leave lists small, and disappear with their jobs',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'pf-descriptions-'));
 try{
  let jobs=await storeDescriptions('uganda',[{id:'unsafe:/id',_description:'<p>Original</p>',sourceUrl:'https://example.org/1'},{id:'gone',_description:'<p>Gone</p>'}],{root});
  assert.equal(jobs[0]._description,undefined);assert.match(jobs[0].descriptionPath,/^data\/jobs\/uganda\/[a-f0-9]{32}\.json$/);
  const file=path.join(root,jobs[0].descriptionPath);assert.equal(JSON.parse(await fs.readFile(file)).html,'<p>Original</p>');
  jobs=await storeDescriptions('uganda',[{...jobs[0],_description:'<p>Updated</p>'}],{root});
  assert.equal(JSON.parse(await fs.readFile(file)).html,'<p>Updated</p>');assert.equal((await fs.readdir(path.dirname(file))).length,1);
  await storeDescriptions('uganda',[{...jobs[0],deadline:'2000-01-01'}],{root});assert.equal((await fs.readdir(path.dirname(file))).length,0);
 }finally{assert.equal(path.dirname(root),os.tmpdir());await fs.rm(root,{recursive:true})}
});
test('missing descriptions use fallback; unknown boards cannot select filesystem paths',async()=>{
 await assert.rejects(()=>storeDescriptions('../outside',[]),/Unknown/);
});
