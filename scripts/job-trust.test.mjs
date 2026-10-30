import test from 'node:test';
import assert from 'node:assert/strict';
import {trustMarkup,checkedDate} from '../assets/job-trust.mjs';
test('trust line includes dated source, capped deadline, fee statement and safe report link',()=>{
 const job={source:'Example',title:'Officer & Analyst',lastCheckedAt:'2026-10-30T12:00:00Z',deadline:'2099-01-01'};
 const html=trustMarkup(job);for(const text of ['Source: Example','Last checked 30 Oct 2026','Check the official deadline','Pathway Forum never charges fees. Never pay to apply.','Report this job'])assert(html.includes(text));
 assert(html.includes(encodeURIComponent('Report job: '+job.title)));assert(!html.includes('2099'));
 assert.equal(checkedDate('invalid'),'Not recorded');
 assert(trustMarkup({...job,source:'<script>'}).includes('&lt;script&gt;'));
});
