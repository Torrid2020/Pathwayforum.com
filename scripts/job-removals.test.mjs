import test from 'node:test';
import assert from 'node:assert/strict';
import {isRemoved} from './job-removals.mjs';
test('requested removals persist by exact job ID without removing other adverts sharing a career URL',()=>{
 const job={id:'one',sourceUrl:'https://example.org/careers'};
 assert(isRemoved(job,[{id:'one'}]));assert(!isRemoved({...job,id:'two'},[{id:'one',sourceUrl:job.sourceUrl}]));
 assert(isRemoved(job,[{sourceUrl:job.sourceUrl}]));
});
