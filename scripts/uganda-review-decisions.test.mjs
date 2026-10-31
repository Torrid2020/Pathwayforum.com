import test from 'node:test';
import assert from 'node:assert/strict';
import {applyReviewDecision,reviewFingerprint} from './uganda-review-decisions.mjs';
const job={id:'m-kopa:1',title:'Office Assistant',sourceUrl:'https://example.org/job/1',applicationUrl:'https://example.org/job/1/apply',summary:'Role requirements',verification:{status:'review',flags:['Review recruitment language'],contentHash:'original'}};
const approval={...job,fingerprint:reviewFingerprint(job),status:'approved',reviewedBy:'James Ocora',reviewedAt:'2026-10-31T00:00:00Z',approvedFlags:['Review recruitment language']};
test('specific reviewed listing publishes with reviewer attribution and retained audit flags',()=>{
 const actual=applyReviewDecision(job,[approval]);assert.equal(actual.verification.status,'official-source');assert.equal(actual.verification.reviewedBy,'James Ocora');assert.deepEqual(actual.verification.reviewedFlags,job.verification.flags);assert.deepEqual(actual.verification.flags,[]);
});
test('approval never covers new jobs, changed content, destinations or additional flags',()=>{
 for(const changed of [{...job,id:'m-kopa:2'},{...job,title:'Other'},{...job,applicationUrl:'https://example.org/other'},{...job,verification:{...job.verification,contentHash:'changed'}},{...job,verification:{...job.verification,flags:[...job.verification.flags,'Expired']}}])assert.equal(applyReviewDecision(changed,[approval]).verification.status,'review');
 assert.equal(applyReviewDecision(job,[]).verification.status,'review');
});
test('human approval does not revive expired roles',()=>assert.equal(applyReviewDecision({...job,deadline:'2000-01-01'},[approval]).verification.status,'review'));
test('explicitly reviewed older snapshots can survive an outage without approving changed snapshots',()=>{
 const old={...job,verification:{status:'review',flags:job.verification.flags}};
 const decision={...approval,snapshotFingerprint:reviewFingerprint(old)};
 assert.equal(applyReviewDecision(old,[decision]).verification.status,'official-source');
 assert.equal(applyReviewDecision({...old,summary:'Changed requirements'},[decision]).verification.status,'review');
});
