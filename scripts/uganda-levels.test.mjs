import test from 'node:test';
import assert from 'node:assert/strict';
import {inferLevel, compareUgandaJobs, ugandaExamples} from '../assets/uganda-levels.mjs';

test('level inference uses title, experience and summary with senior title precedence', () => {
  for (const [job, level] of [
    [{title:'Graduate Trainee'}, 'Internship / trainee'],
    [{title:'Junior Analyst'}, 'Entry level'],
    [{title:'Analyst', summary:'Minimum three years of relevant experience'}, 'Mid level'],
    [{title:'Analyst', experience:'2 years requested'}, 'Entry level'],
    [{title:'Analyst', summary:'At least 6 years’ experience'}, 'Senior / management'],
    [{title:'Assistant Manager', experience:'1 year'}, 'Senior / management'],
    [{title:'Head, Internal Control'}, 'Senior / management'],
    [{title:'Engineering Team Leader'}, 'Senior / management'],
    [{title:'Officer', summary:'Reports to the senior manager'}, 'Not stated'],
    [{title:'Officer'}, 'Not stated']
  ]) assert.equal(inferLevel(job), level);
});

test('deadline order groups senior last and undated last within each group', () => {
  const jobs = [
    {title:'Director', deadline:'2030-01-01'},
    {title:'Junior Analyst'},
    {title:'Officer', deadline:'2030-02-01'},
    {title:'Intern', deadline:'2030-01-02'},
    {title:'Senior Officer'}
  ].sort(compareUgandaJobs);
  assert.deepEqual(jobs.map(j=>j.title), ['Intern','Officer','Junior Analyst','Director','Senior Officer']);
});

test('homepage examples exclude trainees, senior and unstated roles without changing total', () => {
  const jobs = ['Intern','Director','Officer','Junior Analyst','Analyst'].map(title=>({title, ...(title==='Analyst'?{experience:'4 years'}:{})}));
  assert.deepEqual(ugandaExamples(jobs).map(j=>j.title), ['Analyst','Junior Analyst']);
  assert.equal(jobs.length, 5);
});
