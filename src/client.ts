const DEFAULT_BASE_URL = 'https://api.bunpro.jp/api/frontend';

interface SearchOptions {
  grammar?: boolean;
  vocab?: boolean;
  limit?: number;
}

interface SearchSection {
  data?: Array<{ attributes?: Record<string, unknown> }>;
}

interface SearchResponse {
  grammar_points?: SearchSection;
  vocabs?: SearchSection;
}

function compact(attributes: Record<string, unknown> = {}): Record<string, unknown> {
  return Object.fromEntries(Object.entries({
    id: attributes.id,
    title: attributes.title,
    kana: attributes.kana,
    furigana: attributes.furigana,
    slug: attributes.slug,
    level: attributes.level ?? attributes.jlpt_level,
    meaning: attributes.meaning,
    type: attributes.type_pascal,
  }).filter(([, value]) => value !== undefined));
}

export class BunproClient {
  constructor(
    private readonly token: string,
    private readonly baseUrl = DEFAULT_BASE_URL,
  ) {}

  async request(
    path: string,
    options: { query?: Record<string, string | number | undefined>; body?: unknown } = {},
  ): Promise<unknown> {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [name, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(name, String(value));
    }

    const response = await fetch(url, {
      method: options.body === undefined ? 'GET' : 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Bunpro API ${response.status}: ${text || response.statusText}`);
    }
    return text ? JSON.parse(text) : null;
  }

  async search(query: string, options: SearchOptions = {}): Promise<unknown> {
    const grammar = options.grammar ?? true;
    const vocab = options.vocab ?? true;
    const limit = options.limit ?? 20;
    const raw = await this.request('/search/reviewables_v1_1', { body: {
      query,
      options: {
        include_reviews: true,
        include_bookmarks: true,
        include_notes: true,
        only_bookmarks: false,
      },
      is_searching_grammar: grammar,
      is_searching_vocab: vocab,
    } }) as SearchResponse;
    const project = (section?: SearchSection) =>
      (section?.data ?? []).slice(0, limit).map(({ attributes }) => compact(attributes));
    const grammarCount = raw.grammar_points?.data?.length ?? 0;
    const vocabCount = raw.vocabs?.data?.length ?? 0;
    return {
      grammar_points: project(raw.grammar_points),
      vocabs: project(raw.vocabs),
      truncated: {
        grammar: grammarCount > limit ? `${limit}/${grammarCount}` : false,
        vocab: vocabCount > limit ? `${limit}/${vocabCount}` : false,
      },
    };
  }

  getReviewActivity(period: 'daily' | 'hourly'): Promise<unknown> {
    return this.request(`/user_stats/activity_${period}`);
  }

  getQuizQuestions(): Promise<unknown> {
    return this.request('/reviews/quiz_index');
  }

  async getLastSession(): Promise<unknown> {
    const stats = await this.request('/user_stats/base_stats') as {
      facts?: { last_session?: unknown };
    };
    return { last_session: stats.facts?.last_session ?? null };
  }
}
