import test from 'node:test';
import assert from 'node:assert/strict';
import {parseReliefWebRss,fetchReliefWeb,duplicateJobs,reliefWebDuplicate,RELIEFWEB_RSS} from './uganda-reliefweb.mjs';
const rss='<rss version="2.0"><channel><item><title><![CDATA[Finance &amp; Admin Officer]]></title><link>https://reliefweb.int/job/123/officer</link><pubDate>Fri, 30 Oct 2026 10:00:00 GMT</pubDate><description><![CDATA[<p>Country: Uganda</p><p>Organization: Example &amp; Partners</p><p>Closing date: 30 Nov 2026</p><p>Full body must not be stored.</p>]]></description></item></channel></rss>';
test('RSS parses metadata only, including CDATA and entities',()=>{
 assert.deepEqual(parseReliefWebRss(rss),[{title:'Finance & Admin Officer',organisation:'Example & Partners',location:'Uganda',publishedAt:'2026-10-30T10:00:00.000Z',link:'https://reliefweb.int/job/123/officer'}]);
 assert.throws(()=>parseReliefWebRss('<html>blocked</html>'),/markup/);
 assert.throws(()=>parseReliefWebRss('<rss><channel><item>broken</channel></rss>'),/incomplete/);
 assert.deepEqual(parseReliefWebRss('<rss><channel></channel></rss>'),[]);
});
test('RSS makes exactly one Uganda C240 request, no appname or per-item fetch',async()=>{
 const calls=[];const result=await fetchReliefWeb({fetcher:async(u,o)=>{calls.push([u,o]);return {ok:true,text:async()=>rss}}});
 assert.equal(calls.length,1);assert.equal(calls[0][0],RELIEFWEB_RSS);assert(calls[0][0].includes('C240'));assert(!calls[0][0].includes('C239'));assert.equal(result.records[0].deadline,null);assert.equal(result.records[0].description,undefined);
});
test('configured API replaces RSS and requests only the selected fields with UGA filter',async()=>{
 const calls=[];const result=await fetchReliefWeb({appname:'approved-test',fetcher:async(u,o)=>{calls.push([u,o]);return {ok:true,json:async()=>({data:[{id:1,fields:{title:'Officer',source:[{name:'Example'}],city:[{name:'Kampala'}],date:{closing:'2026-11-20'},url:'https://reliefweb.int/job/1'}}]})}}});
 assert.equal(calls.length,1);assert(calls[0][0].startsWith('https://api.reliefweb.int/'));const payload=JSON.parse(calls[0][1].body);assert.equal(payload.filter.conditions[0].value,'UGA');assert(!payload.fields.include.includes('body'));assert.equal(result.mode,'api');assert.equal(result.records[0].employer,'Example');
});
test('blocked RSS is reported without retries',async()=>{let count=0;await assert.rejects(()=>fetchReliefWeb({fetcher:async()=>{count++;return {ok:false,status:406}}}),/RSS HTTP 406/);assert.equal(count,1)});
test('de-duplication recognises URL and similar employer/title, retaining different levels',()=>{
 const a={employer:'Example & Partners',title:'Finance and Admin Officer',sourceUrl:'https://employer.org/job/1'};
 assert(duplicateJobs(a,{...a,title:'Other',sourceUrl:a.sourceUrl+'?utm_source=rss'}));
 assert(duplicateJobs(a,{...a,title:'Admin & Finance Officer',sourceUrl:'https://reliefweb.int/job/123'}));
 assert(!duplicateJobs(a,{...a,title:'Senior Finance Admin Officer',sourceUrl:'https://reliefweb.int/job/124'}));
 assert(!duplicateJobs(a,{...a,employer:'Different',sourceUrl:'https://reliefweb.int/job/125'}));
});
test('shared employer career URLs do not collapse separate direct-employer adverts',()=>{
 const a={sourceId:'brac-bank',sourceUrl:'https://example.org/careers',employer:'Example',title:'IT Security Officer'};
 const b={...a,title:'IT Service Desk Officer'};
 assert(!reliefWebDuplicate(a,b));
 assert(reliefWebDuplicate(a,{...a,sourceId:'reliefweb'}));
});
