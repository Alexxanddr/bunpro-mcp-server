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

test('weak items include paginated grammar and vocab ranked by estimated misses', async () => {
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    requests.push(url.search);
    const type = url.searchParams.get('reviewable_type');
    const level = url.searchParams.get('level');
    const page = Number(url.searchParams.get('page'));
    if (level !== 'beginner') {
      return new Response(JSON.stringify({ reviews: { data: [], included: [] }, pagy: { pages: 1 } }));
    }
    const grammar = type === 'Grammar';
    const id = `${grammar ? 'g' : 'v'}${page}`;
    const misses = grammar ? (page === 1 ? 2 : 5) : 3;
    const accuracy = grammar ? (page === 1 ? 20 : 90) : (page === 1 ? 80 : 10);
    return new Response(JSON.stringify({
      reviews: {
        data: [{
          attributes: { review_misses: misses, accuracy, times_studied: 10, streak: page },
          relationships: { reviewable: { data: { id } } },
        }],
        included: [{ id, attributes: { id: page, title: id, type_pascal: grammar ? 'GrammarPoint' : 'Vocab' } }],
      },
      pagy: { pages: 2 },
    }));
  };

  try {
    const result = await new BunproClient('secret', 'https://example.test').getWeakItems(1) as {
      grammar: Array<Record<string, unknown>>;
      vocab: Array<Record<string, unknown>>;
    };
    assert.equal(result.grammar[0]?.title, 'g1');
    assert.equal(result.vocab[0]?.title, 'v2');
    assert.ok(requests.includes('?level=beginner&reviewable_type=Grammar&page=2'));
    assert.ok(requests.includes('?level=beginner&reviewable_type=Vocab&page=2'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
