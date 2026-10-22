import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { BunproClient } from './client.js';

const annotations = { readOnlyHint: true, idempotentHint: true, openWorldHint: true };

export function createServer(client: BunproClient): McpServer {
  const server = new McpServer({ name: 'bunpro-mcp-server', version: '0.2.4' });
  const result = async (request: Promise<unknown>) => {
    try {
      const data = await request;
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: error instanceof Error ? error.message : String(error) }],
      };
    }
  };

  const simpleTools = {
    get_user: ['/user', 'Get the current Bunpro user profile'],
    get_user_furigana: ['/user/user_furigana', 'Get the current furigana settings'],
    get_due: ['/user/due', 'Get items currently due for review'],
    get_queue: ['/user/queue', 'Get the current review queue'],
    get_base_stats: ['/user_stats/base_stats', 'Get base study statistics'],
    get_jlpt_progress: ['/user_stats/jlpt_progress_mixed', 'Get JLPT progress'],
    get_daily_forecast: ['/user_stats/forecast_daily', 'Get the daily review forecast'],
    get_hourly_forecast: ['/user_stats/forecast_hourly', 'Get the hourly review forecast'],
    get_srs_overview: ['/user_stats/srs_level_overview', 'Get the SRS level overview'],
  } as const;

  for (const [name, [path, description]] of Object.entries(simpleTools)) {
    server.registerTool(name, { description, annotations }, () => result(client.request(path)));
  }

  server.registerTool('get_quiz_questions', {
    description: 'Get the current read-only Bunpro quiz queue',
    annotations,
  }, () => result(client.getQuizQuestions()));

  server.registerTool('get_review_activity', {
    description: 'Get daily or hourly review activity statistics',
    inputSchema: { period: z.enum(['daily', 'hourly']).default('daily') },
    annotations,
  }, ({ period }) => result(client.getReviewActivity(period)));

  server.registerTool('get_last_session', {
    description: 'Get the accuracy percentage from the last review session',
    annotations,
  }, () => result(client.getLastSession()));

  server.registerTool('get_vocab', {
    description: 'Get a vocabulary item by slug or ID',
    inputSchema: { vocab: z.string().min(1) },
    annotations,
  }, ({ vocab }) => result(client.request(`/reviewables/vocab/${encodeURIComponent(vocab)}`)));

  server.registerTool('get_vocab_notes', {
    description: 'Get notes for a vocabulary item by slug or ID',
    inputSchema: { vocab: z.string().min(1) },
    annotations,
  }, ({ vocab }) => result(client.request(`/reviewables/vocab/${encodeURIComponent(vocab)}/notes`)));

  server.registerTool('get_vocab_neighbors', {
    description: 'Get the previous and next vocabulary items in a deck',
    inputSchema: { vocab_id: z.string().min(1), deck_id: z.number().int().positive() },
    annotations,
  }, ({ vocab_id, deck_id }) => result(client.request(
    `/reviewables/vocab/${encodeURIComponent(vocab_id)}/prev_next_by_deck_id`,
    { query: { deck_id } },
  )));

  server.registerTool('get_learning_content', {
    description: 'Get learning content for a Bunpro deck',
    inputSchema: { deck_id: z.number().int().positive() },
    annotations,
  }, ({ deck_id }) => result(client.request('/learn', { query: { deck_id } })));

  server.registerTool('get_topic_replies', {
    description: 'Get replies for a Bunpro discourse topic',
    inputSchema: { id: z.number().int().positive(), page: z.number().int().min(1).optional() },
    annotations,
  }, ({ id, page }) => result(client.request('/discourse/topic_replies', { query: { id, page } })));

  server.registerTool('get_srs_level_details', {
    description: 'Get paginated details for an SRS level and reviewable type',
    inputSchema: {
      level: z.string().min(1),
      reviewable_type: z.enum(['Vocab', 'Grammar']),
      page: z.number().int().min(1).optional(),
    },
    annotations,
  }, (args) => result(client.request('/user_stats/srs_level_details', { query: args })));

  server.registerTool('get_self_study_srs_details', {
    description: 'Get paginated self-study SRS details',
    inputSchema: {
      reviewable_type: z.enum(['Vocab', 'Grammar']),
      page: z.number().int().min(1).optional(),
    },
    annotations,
  }, (args) => result(client.request('/user_stats/srs_self_study_level_details', { query: args })));

  server.registerTool('get_ghost_srs_details', {
    description: 'Get ghost-review SRS details',
    inputSchema: { reviewable_type: z.enum(['Vocab', 'Grammar']) },
    annotations,
  }, (args) => result(client.request('/user_stats/srs_ghost_level_details', { query: args })));

  server.registerTool('search', {
    description: 'Search Bunpro grammar and vocabulary with compact results',
    inputSchema: {
      query: z.string().min(1),
      grammar: z.boolean().default(true),
      vocab: z.boolean().default(true),
      limit: z.number().int().min(1).max(100).default(20),
    },
    annotations,
  }, ({ query, grammar, vocab, limit }) => result(client.search(query, { grammar, vocab, limit })));

  return server;
}
