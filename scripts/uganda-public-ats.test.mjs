import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAshby,parseWorkable,parseLever,fetchPublicAts} from './uganda-public-ats.mjs';
test('Ashby keeps listed postings and secondary locations with public apply links',()=>{
 const jobs=parseAshby({jobs:[{id:'1',title:'Officer',location:'Nairobi',secondaryLocations:[{location:'Kampala'}],jobUrl:'https://example.org/1',applyUrl:'https://example.org/apply/1'},{isListed:false}]});
 assert.equal(jobs.length,1);assert.equal(jobs[0].location,'Kampala');assert.equal(jobs[0].applicationUrl,'https://example.org/apply/1');assert.throws(()=>parseAshby({error:'failed'}));
});
test('Workable reads public widget locations, identifiers and application URL',()=>{
 const [j]=parseWorkable({jobs:[{shortcode:'X',title:'Officer',locations:[{city:'Kampala',country:'Uganda'}],url:'https://example.org/j',application_url:'https://example.org/apply',telecommuting:false}]});
 assert.equal(j.id,'X');assert.equal(j.location,'Kampala, Uganda');assert.equal(j.applicationUrl,'https://example.org/apply');assert.equal(j.workplace,'On-site');assert.throws(()=>parseWorkable({}));
});
test('Lever adapter supports future key-free boards and handles valid empty feeds',async()=>{
 let url;const jobs=await fetchPublicAts({method:'lever',adapter:'example'},async u=>{url=u;return [{id:'L',text:'Assistant',categories:{location:'Jinja',commitment:'Full-time'},hostedUrl:'https://example.org/L',applyUrl:'https://example.org/L/apply',createdAt:0}]});
 assert.equal(url,'https://api.lever.co/v0/postings/example?mode=json');assert.equal(jobs[0].location,'Jinja');assert.equal(jobs[0].publishedAt,'1970-01-01T00:00:00.000Z');assert.deepEqual(parseLever([]),[]);assert.throws(()=>parseLever({error:'blocked'}));
});
test('Lever full descriptions include responsibilities lists and additional employer information',()=>{
 const [job]=parseLever([{id:'full',text:'Officer',description:'<p>Introduction</p>',lists:[{text:'Responsibilities',content:'<li>Final responsibility</li>'}],additional:'<p>Additional information</p>'}]);
 for(const text of ['Introduction','Responsibilities','Final responsibility','Additional information'])assert(job.description.includes(text));
});
