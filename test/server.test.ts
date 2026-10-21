import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { BunproClient } from '../src/client.js';
import { createServer } from '../src/server.js';

const publishedReadTools = [
  'get_base_stats',
  'get_daily_forecast',
  'get_due',
  'get_ghost_srs_details',
  'get_hourly_forecast',
  'get_jlpt_progress',
  'get_last_session',
  'get_learning_content',
  'get_queue',
  'get_quiz_questions',
  'get_review_activity',
  'get_self_study_srs_details',
  'get_srs_level_details',
  'get_srs_overview',
  'get_topic_replies',
  'get_user',
  'get_user_furigana',
  'get_vocab',
  'get_vocab_neighbors',
  'get_vocab_notes',
  'search',
];

test('exposes every read-only operation in the published API', async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createServer(new BunproClient('test', 'https://example.test'));
  const client = new Client({ name: 'test', version: '1.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  try {
    assert.equal(client.getServerVersion()?.name, 'bunpro-mcp-server');
    assert.equal(client.getServerVersion()?.version, '0.2.2');
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(({ name }) => name).sort(), publishedReadTools);
    assert.ok(tools.every(({ annotations }) => annotations?.readOnlyHint));
  } finally {
    await Promise.all([client.close(), server.close()]);
  }
});

test('activity, quiz and last session use the endpoints observed in Bunpro', async () => {
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = async (input) => {
    const url = String(input);
    requests.push(url);
    if (url.endsWith('/user_stats/base_stats')) {
      return new Response(JSON.stringify({ facts: { last_session: 87 } }));
    }
    return new Response(JSON.stringify({ ok: true }));
  };
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createServer(new BunproClient('test', 'https://example.test'));
  const client = new Client({ name: 'test', version: '1.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  try {
    await client.callTool({ name: 'get_review_activity', arguments: { period: 'hourly' } });
    await client.callTool({ name: 'get_quiz_questions', arguments: {} });
    const last = await client.callTool({ name: 'get_last_session', arguments: {} });
    assert.deepEqual(requests, [
      'https://example.test/user_stats/activity_hourly',
      'https://example.test/reviews/quiz_index',
      'https://example.test/user_stats/base_stats',
    ]);
    assert.match((last.content[0] as { text: string }).text, /"last_session": 87/);
  } finally {
    globalThis.fetch = originalFetch;
    await Promise.all([client.close(), server.close()]);
  }
});
