import test from 'node:test';
import assert from 'node:assert/strict';
import {parseUcaaList,parseUcaaDetail} from './uganda-auto-adapters.mjs';
import {employerSources} from './uganda-source-registry.mjs';
const strip=s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const base='https://caa.go.ug/available-vacancies/';
test('UCAA reads only linked vacancy headings and rejects changed markup',()=>{
 const jobs=parseUcaaList('<h4 class="pt-cv-title"><a href="/trainee/">AIR TRAFFIC MANAGEMENT OFFICER – TRAINEE</a></h4><a href="/about/">About UCAA</a>',base,strip);
 assert.equal(jobs.length,1);assert.equal(jobs[0].url,'https://caa.go.ug/trainee/');
 assert.throws(()=>parseUcaaList('<h1>Access denied</h1>',base,strip),/manual review/);
});
test('UCAA parses superscript ordinal dates and explicit dates from application instructions',()=>{
 const link={url:'https://caa.go.ug/trainee/',label:'Trainee'};
 for(const instruction of ['Applications are to be received not later than 5:00pm, 8<sup>th</sup> June, 2026.','before close of business – 30<sup>th</sup> September 2026.']){
  const j=parseUcaaDetail('<div class="swm-post-content-block">'+instruction+'<a href="https://recruitment.caa.co.ug/">Apply</a>UCAA Head Office',link,strip);
  assert.equal(j.location,'Uganda');assert.match(j.deadline,/^2026-(?:06-08|09-30)/);assert.equal(j.applicationUrl,'https://recruitment.caa.co.ug/');
 }
 assert.throws(()=>parseUcaaDetail('<div class="swm-post-content-block">Read more UCAA Head Office',link,strip),/closing date/);
});
test('Diageo and PATH use the existing official Workday adapter',()=>{
 for(const id of ['diageo','path']){const s=employerSources.find(s=>s.id===id);assert.equal(s.method,'workday');assert.match(s.adapter,/myworkdayjobs\.com\//)}
 assert.equal(employerSources.find(s=>s.id==='ucaa').method,'ucaa');
});
