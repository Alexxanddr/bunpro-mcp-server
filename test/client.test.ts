import assert from 'node:assert/strict';
import test from 'node:test';
import { BunproClient } from '../src/client.js';

test('sends bearer authentication and query parameters', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), 'https://example.test/reviews?page=2');
    assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer secret');
    return new Response(JSON.stringify({ ok: true }));
  };

  try {
    assert.deepEqual(
      await new BunproClient('secret', 'https://example.test').request('/reviews', { query: { page: 2 } }),
      { ok: true },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('reports API errors without exposing the token', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('unauthorized', { status: 401 });

  try {
    await assert.rejects(
      new BunproClient('secret', 'https://example.test').request('/user'),
      /^Error: Bunpro API 401: unauthorized$/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('search uses the current endpoint and returns compact limited results', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), 'https://example.test/search/reviewables_v1_1');
    assert.deepEqual(JSON.parse(String(init?.body)), {
      query: '日本語',
      options: {
        include_reviews: true,
        include_bookmarks: true,
        include_notes: true,
        only_bookmarks: false,
      },
      is_searching_grammar: true,
      is_searching_vocab: false,
    });
    return new Response(JSON.stringify({
      grammar_points: { data: [
        { attributes: { id: 1, title: '一', meaning: 'one', type_pascal: 'GrammarPoint', heavy: 'drop' } },
        { attributes: { id: 2, title: '二', meaning: 'two', type_pascal: 'GrammarPoint' } },
      ] },
      vocabs: { data: [] },
    }));
  };

  try {
    assert.deepEqual(
      await new BunproClient('secret', 'https://example.test').search('日本語', {
        grammar: true,
        vocab: false,
        limit: 1,
      }),
      {
        grammar_points: [{ id: 1, title: '一', meaning: 'one', type: 'GrammarPoint' }],
        vocabs: [],
        truncated: { grammar: '1/2', vocab: false },
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
