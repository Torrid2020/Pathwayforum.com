import test from 'node:test';
import assert from 'node:assert/strict';
import {createRobotsPolicy,singleFetchClient} from './uganda-single-fetch.mjs';
test('robots policy is shared per hostname and obeys allow/disallow rules',async()=>{
 let calls=0;const check=createRobotsPolicy(async()=>{calls++;return new Response('User-agent: *\nDisallow: /private\nAllow: /private/public')});
 await Promise.all([check('https://official.org/jobs'),check('https://official.org/careers')]);assert.equal(calls,1);await assert.rejects(()=>check('https://official.org/private'),/disallows/);await check('https://official.org/private/public');
});
test('one vacancy-data fetch per new source, descriptive UA, no retries or unchecked redirects',async()=>{
 let calls=0;const io=singleFetchClient(async()=>{},{fetcher:async(url,options)=>{calls++;assert.match(options.headers['User-Agent'],/PathwayForum.*https:\/\/torrid2020.github.io/);assert.equal(options.redirect,'manual');return new Response('{"jobs":[]}')}});assert.deepEqual(await io.json('https://official.org/jobs'),{jobs:[]});await assert.rejects(()=>io.request('https://official.org/details'),/limit reached/);assert.equal(calls,1);assert.equal(io.count,1);
});
test('robots failures prevent vacancy fetches and missing robots files allow public endpoints',async()=>{
 const check=createRobotsPolicy(async()=>new Response('Blocked',{status:503}));let content=0;const io=singleFetchClient(check,{fetcher:async()=>{content++;return new Response('[]')}});await assert.rejects(()=>io.request('https://official.org/jobs'),/robots.txt returned HTTP 503/);assert.equal(content,0);assert.equal(io.count,0);await createRobotsPolicy(async()=>new Response('',{status:404}))('https://official.org/jobs');
});
