# Technical security model

## Trust boundaries

The MCP host, this local process, and Bunpro are separate trust boundaries. Tool arguments are untrusted, Bunpro responses are external data, and the bearer token grants access to private account data.

## Authentication and configuration

`BUNPRO_API_TOKEN` is read at startup and sent only in the `Authorization: Bearer …` header to the configured API base URL. The project has no login, refresh, storage, or token-rotation mechanism. `BUNPRO_API_BASE_URL` should only point to a trusted service because it receives the token.

- Configure the token in the MCP host's secret/environment settings.
- Keep local `.env` files untracked and restrict their filesystem permissions.
- Never paste tokens into issues, logs, screenshots, fixtures, or command history.
- Revoke or replace the token in Bunpro if exposure is suspected.

## Input, output, and logging

MCP inputs use Zod constraints. Path values are encoded with `encodeURIComponent`; query values use `URLSearchParams`. The client parses responses as JSON and reports non-success HTTP responses as tool errors.

Outputs may contain study history, account metadata, notes, and other personal data. The server does not persist or intentionally log responses. stdout is reserved for MCP transport. The token is not included in application error messages. Upstream error bodies are forwarded to the caller and may contain Bunpro-provided details; hosts should avoid persisting them unnecessarily.

## Dependencies

Dependencies are locked by `package-lock.json`. CI installs with `npm ci`, runs tests, builds the bundle, and inspects package contents. Dependency updates require review of release notes and the lockfile.

## Known risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Unofficial API changes | Unit/contract tests and opt-in live endpoint tests. |
| Bearer token exposure | Environment-only configuration, ignored `.env`, no token logging. |
| Custom base URL receives token | Use `BUNPRO_API_BASE_URL` only for trusted test/deployment targets. |
| Personal data reaches a host/model | Read-only scope and no local persistence; users secure their chosen host. |
| Unexpected upstream behavior | Only observed read operations are exposed; live tests remain non-mutating. |

For vulnerability reporting, see the repository-level [security policy](../SECURITY.md).
