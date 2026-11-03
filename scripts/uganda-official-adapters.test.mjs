import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parsePinpoint,parseRssAdverts,parsePdfAdverts,parseKakira,parseEadb,parseKcca,parseNssfList,parseOfficialList} from './uganda-official-adapters.mjs';
import {fetchAutomatic} from './uganda-auto-adapters.mjs';
const fixture=name=>fs.readFileSync(new URL('./fixtures/uganda-expansion/'+name,import.meta.url),'utf8');
const now=Date.parse('2026-11-03T12:00:00Z'),hsc={id:'hsc',url:'https://hsc.go.ug/jobs.php'};
test('saved Pinpoint response keeps Uganda locations and all full-description sections',()=>{
 const data=JSON.parse(fixture('pinpoint.json')),records=parsePinpoint(data);
 assert.equal(records.recordsRead,2);assert.equal(records.length,1);assert.equal(records[0].title,'Fraud Analyst, Uganda');assert.match(records[0].location,/Kampala/);assert.match(records[0].description,/Investigate and collect/);assert.match(records[0].description,/Bachelor/);assert.match(records[0].description,/What Sun King Offers/);assert.equal(records[0].employmentType,'Full-time');assert.throws(()=>parsePinpoint({error:'changed'}),/missing/);
});
test('saved government RSS responses do not turn warnings, shortlists or interviews into jobs',()=>{
 for(const id of ['esc','jsc']){const jobs=parseRssAdverts(fixture(id+'.xml'),{url:'https://'+id+'.go.ug/feed/'},{now});assert.equal(jobs.length,0);assert(jobs.recordsRead>0)}
});
test('RSS advert parser accepts recent official adverts and rejects expiry, old notices, duplicates and foreign links',()=>{
 const item=(title,url='https://esc.go.ug/advert',date='Mon, 02 Nov 2026 10:00:00 GMT',body='Closing date: 16 November 2026')=>`<item><title>${title}</title><link>${url}</link><pubDate>${date}</pubDate><description>${body}</description></item>`;
 const xml='<rss><channel>'+item('External vacancy advert')+item('External vacancy advert')+item('Vacancy – closed','https://esc.go.ug/closed',undefined,'Deadline: 1 November 2026')+item('Vacancy – old','https://esc.go.ug/old','Sun, 01 Mar 2026 10:00:00 GMT')+item('Vacancy – another site','https://other.org/advert')+item('FRAUD ALERT: fake advertisement')+item('Advertised posts – shortlist')+'</channel></rss>';
 const records=parseRssAdverts(xml,{url:'https://esc.go.ug/feed/'},{now});assert.equal(records.length,1);assert.equal(records.recordsRead,7);assert.equal(records[0].deadline,'2026-11-16T20:59:59.000Z');assert.equal(records[0].fullDescription,null);
 assert.throws(()=>parseRssAdverts('<html>Blocked</html>',hsc),/not recognised/);assert.throws(()=>parseRssAdverts('<!DOCTYPE rss><rss/>',hsc),/invalid/);
});
test('saved HSC PDF adverts group summary and complete copies, keep internal/external distinct, and exclude expired rounds',()=>{
 const records=parsePdfAdverts(fixture('hsc.html'),hsc,{now});assert.equal(records.length,2);assert.equal(records.recordsRead,4);assert(records.every(j=>j.title.endsWith('multiple posts')&&j.sourceUrl.endsWith('.pdf')&&j.deadline==='2026-11-16T20:59:59.000Z'));assert.match(records.find(j=>/External/.test(j.title)).sourceUrl,/COMPLETE/);assert.equal(parsePdfAdverts(fixture('hsc.html'),hsc,{now:Date.parse('2026-11-17')}).length,0);
});
test('PDF adverts never publish result PDFs, undated adverts, unsafe URLs or commented archived links',()=>{
 const html='<h1>Recruitment</h1><p><a href="/result.pdf">Successful candidates</a> Expires:2026-11-16</p><p><a href="/advert.pdf">HSC External Advert No. 1 of November 2026</a></p><!--<p><a href="/hidden.pdf">HSC External Advert No. 2 of November 2026</a>Expires:2026-11-16</p>-->';
 assert.equal(parsePdfAdverts(html,hsc,{now}).length,0);
});
test('Kakira saved cards preserve all levels, upgrade official PDF links and read five closing dates',()=>{
 const records=parseKakira(fixture('kakira.html'),{url:'https://kakirasugar.com/jobs-listing/'},{now});assert.equal(records.length,5);assert.equal(records[0].title,'Executive Assistant to Project Director');assert.equal(records[0].deadline,'2026-11-06T20:59:59.000Z');assert(records.every(j=>j.sourceUrl.startsWith('https:')));assert.equal(parseKakira(fixture('kakira.html'),{url:'https://kakirasugar.com/jobs-listing/'},{now:Date.parse('2026-11-13')}).length,0);
});
test('EADB saved table rejects Mauritius consultancy and keeps the dated Kampala role',()=>{
 const records=parseEadb(fixture('eadb.html'),{url:'https://eadb.org/vacancies/'},{now});assert.equal(records.recordsRead,2);assert.equal(records.length,1);assert.equal(records[0].title,'Manager Procurement');assert.equal(records[0].deadline,'2026-11-10T20:59:59.000Z');assert.match(records[0].location,/Uganda/);
});
test('KCCA rejects the expired 2025 advert even though the page is still online',()=>{
 const html='<h1>Employment Opportunities</h1>POST : REVENUE DATA ASSISTANTS REF : DAHR/2025 DUTY STATION : KAMPALA, UGANDA TERM : SHORT TERM Deadline for Submission: 21st November, 2025';
 assert.equal(parseKcca(html,{url:'https://www.kcca.go.ug/employment-opportunities'},{now}).length,0);
});
test('NSSF listing is reported as manual review when deadlines cannot be checked in one response',()=>{
 const records=parseNssfList('<h2>Featured Jobs</h2><a href="/specials/featured-jobs/manager/">Senior Manager</a>',{url:'https://www.nssfug.org/opportunities/careers/'});assert.equal(records.recordsRead,1);assert.equal(records.length,0);assert.equal(records.manualReview,true);
});
test('an explicit empty careers page is connected; unknown markup requires review',()=>{
 assert.equal(parseOfficialList('<h1>No Open Positions Right Now</h1>',{}).length,0);assert.throws(()=>parseOfficialList('<h1>Careers</h1>',{}),/not reliably/);
});
test('new Oracle source reuses the adapter without fetching individual descriptions',async()=>{
 let calls=0;const jobs=await fetchAutomatic({method:'oracle',singleFetch:true,adapter:'oracle.example/CX_1001'},{json:async()=>{calls++;return {items:[{TotalJobsCount:2,requisitionList:[{Id:'1',Title:'Senior Finance Officer',PrimaryLocationCountry:'UG',PrimaryLocation:'Kampala'},{Id:'2',Title:'Officer',PrimaryLocationCountry:'KE',PrimaryLocation:'Nairobi'}]}]}}});assert.equal(calls,1);assert.equal(jobs.length,1);assert.equal(jobs[0].title,'Senior Finance Officer');assert.equal(jobs[0].location,'Kampala, Uganda');
});
