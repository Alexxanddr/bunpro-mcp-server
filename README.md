# Bunpro MCP

A read-only [Model Context Protocol](https://modelcontextprotocol.io/) server that lets MCP clients work with your Bunpro profile, review queue, forecasts, SRS progress, vocabulary, learning content, and search.

> [!WARNING]
> This project uses Bunpro's unofficial, reverse-engineered frontend API. It may change without notice. This project is not affiliated with or endorsed by Bunpro.

## What you can do

- Ask for your profile, due count, review queue, or current quiz questions.
- Inspect JLPT progress, SRS levels, forecasts, activity, and last-session accuracy.
- Search Bunpro grammar and vocabulary with compact results.
- Retrieve vocabulary details and notes, deck learning content, or topic replies.

The server exposes no account-changing, review-submission, or deletion tools.

## Requirements

- A Bunpro account and a current frontend bearer token.
- Node.js 18 or newer when running from source or through `npx`.
- An MCP client that supports local stdio servers.

## Get your Bunpro token

1. Sign in to Bunpro in your browser.
2. Open the browser developer tools and select **Network**.
3. Select a request to `https://api.bunpro.jp/api/frontend/...`.
4. Copy the `Authorization` request header value without the `Bearer ` prefix.

Treat this token like a password. Do not commit it, paste it into issues, or expose it in screenshots.

## Configure an MCP client

The package is not published yet. Install and build this repository, then configure your client with an absolute path:

```json
{
  "mcpServers": {
    "bunpro": {
      "command": "node",
      "args": ["/absolute/path/to/bunpro-mcp-server/dist/index.js"],
      "env": { "BUNPRO_API_TOKEN": "your-token" }
    }
  }
}
```

Restart the MCP client after changing its configuration or rebuilding the server.

## Run locally

```bash
npm ci
npm run build
BUNPRO_API_TOKEN='your-token' node dist/index.js
```

The last command starts an MCP stdio process and waits for protocol messages; it has no interactive prompt. Prefer the MCP client's environment configuration so the token does not enter shell history.

## Example requests

- “Show my Bunpro profile.”
- “How many reviews are due?”
- “Show my hourly review forecast.”
- “Search Bunpro vocabulary for 日本語.”
- “What was my last review-session accuracy?”

## Available tools

| Tool | Purpose |
| --- | --- |
| `get_user` | Get the current user profile. |
| `get_user_furigana` | Get furigana settings. |
| `get_due` | Get items currently due. |
| `get_queue` | Get the current review queue. |
| `get_quiz_questions` | Get the current read-only quiz queue. |
| `get_base_stats` | Get base study statistics. |
| `get_jlpt_progress` | Get mixed JLPT progress. |
| `get_daily_forecast` | Get the daily review forecast. |
| `get_hourly_forecast` | Get the hourly review forecast. |
| `get_srs_overview` | Get the SRS level overview. |
| `get_review_activity` | Get daily or hourly review activity. |
| `get_last_session` | Get last-session accuracy. |
| `get_vocab` | Get vocabulary by slug or ID. |
| `get_vocab_notes` | Get notes for vocabulary. |
| `get_vocab_neighbors` | Get adjacent vocabulary in a deck. |
| `get_learning_content` | Get learning content for a deck. |
| `get_topic_replies` | Get replies for a Bunpro discussion topic. |
| `get_srs_level_details` | Get paginated SRS-level details. |
| `get_self_study_srs_details` | Get paginated self-study SRS details. |
| `get_ghost_srs_details` | Get ghost-review SRS details. |
| `search` | Search grammar and vocabulary with compact results. |

Exact inputs, outputs, defaults, and errors are in [MCP contracts](docs/MCP_CONTRACTS.md).

## Configuration

| Variable | Required | Description |
| --- | --- | --- |
| `BUNPRO_API_TOKEN` | Yes | Frontend bearer token without the `Bearer ` prefix. |
| `BUNPRO_API_BASE_URL` | No | API override mainly for tests. It receives the token; use only a trusted URL. |

## Development

```bash
npm ci
npm run check
```

Authenticated live checks are separate:

```bash
cp .env.example .env
# Edit .env locally, then:
npm run test:live
```

The live suite is read-only and `.env` is ignored. See [Testing](docs/TESTING.md) and [Contributing](CONTRIBUTING.md).

## Troubleshooting

- **`BUNPRO_API_TOKEN is required`:** provide it in the MCP client configuration and restart the client.
- **`Bunpro API 401` or `403`:** obtain a fresh token and omit the `Bearer ` prefix.
- **Tool list did not change after rebuilding:** restart the MCP client.
- **`404` or `5xx` from Bunpro:** the unofficial endpoint may have changed; run live tests and open a sanitized issue.
- **No output when launched in a terminal:** expected; stdio is waiting for an MCP host.

## Architecture and limitations

The server is a local stdio package using the official TypeScript MCP SDK. Most outputs pass through Bunpro's JSON, so upstream shape changes are possible. It currently provides tools only—no resources, prompts, hosted HTTP endpoint, browser login, or OAuth flow.

Read [Architecture](docs/ARCHITECTURE.md), [Technical security](docs/SECURITY.md), and the [community API reference](https://github.com/cbullard-dev/bunpro-community-api).

## Releases and distribution

The npm package name is `bunpro-mcp-server`. Once published, it can be launched with `npx -y bunpro-mcp-server`. Until then, use the local absolute-path configuration above.

Releases should use Semantic Versioning, update [CHANGELOG.md](CHANGELOG.md), follow [Publishing](docs/PUBLISHING.md), and inspect `npm pack --dry-run` before publication.

A future hosted streamable-HTTP server could reduce installation friction, but it first needs secure per-user authentication and token storage. Local stdio keeps the current bearer token on the user's machine.

## Security, contributions, and license

Read [SECURITY.md](SECURITY.md) before reporting a vulnerability. Contributions follow [CONTRIBUTING.md](CONTRIBUTING.md). Never include credentials or personal Bunpro responses in a report.

Licensed under the existing [MIT License](LICENSE). Downstream users must also comply with Bunpro's applicable terms and policies.
