import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeDeadline} from '../assets/uganda-data.mjs';

test('deadline guard keeps 120-day boundary and expiry but drops distant ATS expiry dates', () => {
  const now = Date.parse('2026-10-30T00:00:00Z');
  assert.equal(normalizeDeadline('2027-09-11', now), null);
  assert.equal(normalizeDeadline(new Date(now + 120 * 86400000).toISOString(), now), '2027-02-27T00:00:00.000Z');
  assert.equal(normalizeDeadline(new Date(now + 120 * 86400000 + 1).toISOString(), now), null);
  assert.equal(normalizeDeadline('2026-10-29', now), '2026-10-29T00:00:00.000Z');
  assert.equal(normalizeDeadline(null, now), null);
  assert.equal(normalizeDeadline('invalid', now), null);
});
