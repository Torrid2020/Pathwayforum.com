import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeHimalayas} from './update-jobs.mjs';
import {trustMarkup} from '../assets/job-trust.mjs';
test('Himalayas preserves API applicationLink exactly and never substitutes employer URLs',()=>{
 const input={title:'Junior Analyst',applicationLink:'https://himalayas.app/job/example?utm_source=api',url:'https://employer.example/direct',guid:'https://himalayas.app/job/example',companyName:'Example',seniority:['Entry-level']};
 assert.equal(normalizeHimalayas(input).applicationUrl,input.applicationLink);
 assert.equal(normalizeHimalayas({...input,applicationLink:null}),null);
 assert.equal(normalizeHimalayas({...input,applicationLink:'javascript:alert(1)'}),null);
});
test('Himalayas attribution is a visible link on shared card and detail trust lines',()=>{
 const html=trustMarkup({source:'Himalayas',title:'Example'});
 assert.match(html,/<a href="https:\/\/himalayas\.app"[^>]*>via Himalayas<\/a>/);
});
test('full Himalayas HTML stays available to the description writer beyond the old 5000-character limit',()=>{
 const description='<p>'+('Full employer text. '.repeat(400))+'</p><ul><li>Final requirement</li></ul>';
 const job=normalizeHimalayas({title:'Junior Analyst',applicationLink:'https://himalayas.app/job/full',description,companyName:'Example',seniority:['Entry-level']});
 assert.equal(job._description,description);assert(job._description.length>5000);assert(job.summary.length<=280);
});
test('remote board remains noindex and has no JobPosting structured data',()=>{
 const html=fs.readFileSync(new URL('../jobs.html',import.meta.url),'utf8');
 assert.match(html,/<meta name="robots" content="noindex, follow">/);
 assert(!/JobPosting|application\/ld\+json/i.test(html));
});
