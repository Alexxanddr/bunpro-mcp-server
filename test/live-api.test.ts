import assert from 'node:assert/strict';
import test from 'node:test';
import { BunproClient } from '../src/client.js';

const token = process.env.BUNPRO_API_TOKEN;
const live = { skip: token ? false : 'BUNPRO_API_TOKEN is not set' };
const client = new BunproClient(token ?? 'missing');

const publishedEndpoints = [
  '/user',
  '/user/user_furigana',
  '/user/due',
  '/user/queue',
  '/reviews/quiz_index',
  '/user_stats/base_stats',
  '/user_stats/jlpt_progress_mixed',
  '/user_stats/forecast_daily',
  '/user_stats/forecast_hourly',
  '/user_stats/srs_level_overview',
  '/user_stats/activity_daily',
  '/user_stats/activity_hourly',
] as const;

for (const path of publishedEndpoints) {
  test(`live GET ${path}`, live, async () => {
    const response = await client.request(path);
    assert.equal(typeof response, 'object');
    assert.notEqual(response, null);
  });
}

test('live POST /search/reviewables_v1_1', live, async () => {
  const response = await client.search('日本語');
  assert.equal(typeof response, 'object');
  assert.notEqual(response, null);
});
