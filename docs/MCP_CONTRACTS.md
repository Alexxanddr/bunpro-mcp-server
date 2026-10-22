# MCP contracts

## Common behavior

The server exposes tools only; there are no MCP resources or prompts. Every tool has `readOnlyHint`, `idempotentHint`, and `openWorldHint` set to `true`.

Successful calls return one text content item containing indented JSON. Upstream, network, or JSON failures return one text content item with `isError: true`. Invalid inputs are protocol validation errors. Unless a local output is described below, the JSON shape is the Bunpro frontend API response and may change upstream.

## Tools without inputs

| Tool | Purpose | Bunpro request |
| --- | --- | --- |
| `get_user` | Current user profile. | `GET /user` |
| `get_user_furigana` | Furigana settings. | `GET /user/user_furigana` |
| `get_due` | Items currently due. | `GET /user/due` |
| `get_queue` | Current review queue. | `GET /user/queue` |
| `get_base_stats` | Base study statistics. | `GET /user_stats/base_stats` |
| `get_jlpt_progress` | Mixed JLPT progress. | `GET /user_stats/jlpt_progress_mixed` |
| `get_daily_forecast` | Daily review forecast. | `GET /user_stats/forecast_daily` |
| `get_hourly_forecast` | Hourly review forecast. | `GET /user_stats/forecast_hourly` |
| `get_srs_overview` | SRS level overview. | `GET /user_stats/srs_level_overview` |
| `get_quiz_questions` | Current read-only quiz queue. | `GET /reviews/quiz_index` |
| `get_last_session` | Last-session accuracy. | `GET /user_stats/base_stats`, projected to `{ "last_session": value | null }`. |

```json
{ "name": "get_due", "arguments": {} }
```

## Parameterized tools

### `get_review_activity`

Optional `period`: enum `"daily" | "hourly"`, default `"daily"`. Calls `GET /user_stats/activity_<period>`.

```json
{ "name": "get_review_activity", "arguments": { "period": "hourly" } }
```

### `get_weak_items`

Optional integer `limit`, from 1 to 100 and defaulting to `20`, is applied separately to grammar and vocabulary. The tool loads regular SRS items from every level through `GET /user_stats/srs_level_details`, follows all result pages, and returns compact `grammar` and `vocab` rankings. `estimated_misses` is calculated as `round(times_studied × (100 − accuracy) / 100)` and sorted descending, with lower accuracy breaking ties. The upstream `review_misses` value is retained but not used for ranking because Bunpro reports it as zero for vocabulary with low historical accuracy. Self-study and ghost queues are excluded to avoid duplicate items.

```json
{ "name": "get_weak_items", "arguments": { "limit": 10 } }
```

### `get_vocab` and `get_vocab_notes`

Required non-empty string `vocab`, interpreted as a slug or ID and URL-encoded. Requests are `GET /reviewables/vocab/{vocab}` and `GET /reviewables/vocab/{vocab}/notes`.

```json
{ "name": "get_vocab", "arguments": { "vocab": "食べる" } }
```

### `get_vocab_neighbors`

Required non-empty string `vocab_id`; required positive integer `deck_id`. Calls `GET /reviewables/vocab/{vocab_id}/prev_next_by_deck_id?deck_id=…`.

### `get_learning_content`

Required positive integer `deck_id`. Calls `GET /learn?deck_id=…`.

### `get_topic_replies`

Required positive integer `id`; optional integer `page >= 1`. Calls `GET /discourse/topic_replies?id=…&page=…`.

### `get_srs_level_details`

Required non-empty string `level`; required `reviewable_type` enum `"Vocab" | "Grammar"`; optional integer `page >= 1`. Calls `GET /user_stats/srs_level_details` with those query parameters.

### `get_self_study_srs_details`

Required `reviewable_type` enum `"Vocab" | "Grammar"`; optional integer `page >= 1`. Calls `GET /user_stats/srs_self_study_level_details`.

### `get_ghost_srs_details`

Required `reviewable_type` enum `"Vocab" | "Grammar"`. Calls `GET /user_stats/srs_ghost_level_details`.

### `search`

Uses `POST /search/reviewables_v1_1`.

| Input | Required | Constraint/default |
| --- | --- | --- |
| `query` | Yes | Non-empty string. |
| `grammar` | No | Boolean, default `true`. |
| `vocab` | No | Boolean, default `true`. |
| `limit` | No | Integer 1–100, default `20`, applied separately to grammar and vocab. |

The local output is:

```json
{
  "grammar_points": [{ "id": 1, "title": "…", "meaning": "…", "type": "GrammarPoint" }],
  "vocabs": [],
  "truncated": { "grammar": "20/42", "vocab": false }
}
```

Results include only available fields from `id`, `title`, `kana`, `furigana`, `slug`, `level`, `meaning`, and `type`. A `truncated` value is `false` or a `"returned/available"` string.

```json
{ "name": "search", "arguments": { "query": "日本語", "grammar": true, "vocab": false, "limit": 10 } }
```

## Errors and compatibility

Failures include missing or expired authentication (`401`/`403`), changed endpoints (`404`/`5xx`), network errors, non-JSON responses, and schema validation errors. Bunpro status and response text are included in upstream HTTP errors.

Tool names, inputs, defaults, annotations, and local output projections are public contracts. Additive optional inputs are normally compatible. Renames, removals, stricter validation, changed defaults, or changed projections require a major release or documented migration. Pass-through Bunpro output cannot be guaranteed stable by this project.
