import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewReport,reconcileReview} from './uganda-review-alert.mjs';
const job={title:'Officer',employer:'Example employer',sourceUrl:'https://example.org/job',verification:{flags:['Review recruitment language']}};
function fake(issues=[]) { const calls=[]; return {calls, gh:(args,body)=>{calls.push({args,body});return args[0]==='issue'&&args[1]==='list'?JSON.stringify(issues):''}}; }
test('review report is stable and lists title employer flags and official link',()=>{
  assert.equal(reviewReport([job,{...job,title:'Analyst'}]),reviewReport([{...job,title:'Analyst'},job]));
  for(const value of [job.title,job.employer,job.sourceUrl,job.verification.flags[0]]) assert(reviewReport([job]).includes(value));
});
test('creates once and remains quiet for an unchanged queue',()=>{
  let f=fake();assert.equal(reconcileReview([job],f.gh),'created');assert.equal(f.calls.filter(c=>c.args[1]==='create'&&c.args[0]==='issue').length,1);
  f=fake([{number:1,title:'Uganda jobs held for review',body:reviewReport([job]),state:'OPEN'}]);
  assert.equal(reconcileReview([job],f.gh),'unchanged');assert.equal(f.calls.filter(c=>['edit','comment','create'].includes(c.args[1])&&c.args[0]==='issue').length,0);
});
test('changes update the issue and comment once; empty queue closes it',()=>{
  const issue={number:1,title:'Uganda jobs held for review',body:reviewReport([job]),state:'OPEN'};
  let f=fake([issue]);assert.equal(reconcileReview([{...job,title:'Changed'}],f.gh),'updated');assert.equal(f.calls.filter(c=>c.args[1]==='comment').length,1);
  f=fake([issue]);assert.equal(reconcileReview([],f.gh),'empty');assert.equal(f.calls.filter(c=>c.args[1]==='close').length,1);
  f=fake([{...issue,state:'CLOSED'}]);reconcileReview([],f.gh);assert.equal(f.calls.filter(c=>c.args[1]==='close').length,0);
});
test('new queue reuses a closed issue instead of creating a second one',()=>{
  const f=fake([{number:1,title:'Uganda jobs held for review',body:reviewReport([job]),state:'CLOSED'}]);
  reconcileReview([job],f.gh);assert.equal(f.calls.filter(c=>c.args[1]==='reopen').length,1);assert.equal(f.calls.filter(c=>c.args[0]==='issue'&&c.args[1]==='create').length,0);
});
