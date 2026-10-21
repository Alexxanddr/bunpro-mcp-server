# Contributing

Thank you for improving Bunpro MCP. This project wraps an unofficial API, so small, well-tested, backward-compatible changes are preferred.

## Setup

Requirements: Node.js 18 or newer and npm.

```bash
npm ci
npm run check
```

Copy `.env.example` to `.env` only if you need opt-in live tests. Never commit or share that file.

## Development conventions

- Keep Bunpro HTTP behavior in `src/client.ts` and MCP registration in `src/server.ts`.
- Keep the server read-only unless a proposal explicitly addresses write safety.
- Use existing packages and patterns before adding dependencies or abstractions.
- Treat MCP tool names, schemas, defaults, and projected outputs as public API.
- Include focused tests and update user/contract documentation with behavior changes.

The complete rules are in [AGENTS.md](AGENTS.md). The reusable [add-tool workflow](.agents/skills/add-mcp-tool/SKILL.md) applies equally to human contributions.

## Proposing a change

Open an issue for breaking contracts, write operations, authentication changes, large dependency additions, or a new deployment model. For a focused bug fix or compatible read-only endpoint, a pull request may be sufficient.

A pull request should explain the user-visible behavior, API evidence, compatibility impact, tests run, and remaining limitations. Keep unrelated formatting or refactoring out of the change.

## Validation

```bash
npm run check
npm pack --dry-run
```

For a verified read-only endpoint, optionally run `npm run test:live` using an authorized local token. Never use another person's account data in fixtures or review output.

## Issues and security

Include reproducible steps, Node version, MCP host, and sanitized errors in normal bug reports. Do not include bearer tokens or personal Bunpro data. Report vulnerabilities using [SECURITY.md](SECURITY.md), not a public issue.
