import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeEmploymentType,normalizeJobMetadata} from './job-normalizer.mjs';
test('employment types normalize feed variants to the seven public labels',()=>{
 for(const s of ['Full time','FullTime','FULL_TIME','full-time',' Full-time ']) assert.equal(normalizeEmploymentType(s),'Full-time');
 for(const [input,expected] of [['PART_TIME','Part-time'],['contractor','Contract'],['CONTRACT','Contract'],['intern','Internship'],['TEMPORARY','Temporary'],['volunteering','Volunteer'],['See official listing','See official listing']]) assert.equal(normalizeEmploymentType(input),expected);
});
test('unknown, empty and conflicting employment types use the official-listing fallback',()=>{
 for(const s of ['OTHER','','not stated','new unknown value',null,undefined,42,{},[],['full-time','part-time']]) assert.equal(normalizeEmploymentType(s),'See official listing');
 assert.equal(normalizeEmploymentType(['full_time']),'Full-time');
});
test('shared metadata normalizer preserves collector fields and remains idempotent',()=>{
 const job={id:'source:123',employmentType:'FullTime',applicationUrl:'https://example.org/apply',verification:{status:'official-source'},_description:'Full description'};
 const normalized=normalizeJobMetadata(job);
 assert.deepEqual(normalized,{...job,employmentType:'Full-time'});assert.deepEqual(normalizeJobMetadata(normalized),normalized);assert.equal(job.employmentType,'FullTime');
});
