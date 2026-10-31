import test from 'node:test';
import assert from 'node:assert/strict';
import {similarJobs} from '../assets/job-suggestions.mjs';
test('suggestions rank level before category before district, excluding self and expired jobs',()=>{
 const active={id:'self',category:'Finance',district:'Kampala',level:'Entry level'};
 const jobs=[active,{id:'level',level:active.level},{id:'district',district:active.district},{id:'category',category:active.category},{id:'best',category:active.category,district:active.district},{id:'expired',category:active.category,district:active.district,level:active.level,deadline:'2000-01-01'}];
 assert.deepEqual(similarJobs(active,jobs).map(j=>j.id),['level','best','category']);
});
test('missing category/district does not count as a match and ties keep existing order',()=>{
 assert.deepEqual(similarJobs({id:'self',level:'Entry'},[{id:'first'},{id:'matched',level:'Entry'},{id:'last'}]).map(j=>j.id),['matched','first','last']);
});

test('entry, trainee and mid-level jobs suppress senior suggestions when three alternatives exist',()=>{
 for(const level of ['Internship / trainee','Entry level','Mid level']){const active={id:'self',level,category:'Finance'};const jobs=[{id:'senior',category:'Finance',level:'Senior / management'},...['a','b','c'].map(id=>({id,level:'Not stated'}))];assert(!similarJobs(active,jobs,Date.now(),6).some(j=>j.id==='senior'));assert(similarJobs(active,jobs.slice(0,3)).some(j=>j.id==='senior'));}
});
