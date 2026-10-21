# Bunpro MCP agent instructions

## Project overview

Bunpro MCP is a read-only TypeScript MCP server for Bunpro's unofficial frontend API. It uses the official `@modelcontextprotocol/sdk`, Zod schemas, Node.js 18+, and stdio transport.

- `src/client.ts`: HTTP integration and response projection.
- `src/server.ts`: MCP tool registration and protocol-facing validation.
- `src/index.ts`: environment configuration and stdio startup.
- `test/`: unit, MCP contract, and opt-in live API tests.
- `docs/`: architecture, contracts, security, and testing references.

Read `docs/ARCHITECTURE.md` before changing boundaries and `docs/MCP_CONTRACTS.md` before changing a public tool.

## Architecture rules

- Keep Bunpro HTTP details in `BunproClient`; keep MCP registration in `createServer`.
- Reuse `BunproClient.request` and the shared MCP result/error conversion.
- Keep the server read-only unless a separately reviewed change explicitly adds writes.
- Prefer small functions and existing dependencies. Do not add layers or packages without a concrete need.
- Use ESM imports with `.js` suffixes, matching the current TypeScript configuration.

## MCP development rules

- Use stable `snake_case` tool names and action-oriented descriptions.
- Define every external input with the narrowest practical Zod schema and encode path segments.
- Return JSON as text content consistently; return expected failures with `isError: true`.
- Treat tool names, inputs, output shape, and semantics as public contracts. Avoid breaking changes; document intentional ones.
- New or changed tools require contract tests and updates to `docs/MCP_CONTRACTS.md` and the README tool table.
- Add resources or prompts only for a demonstrated host/user workflow, and document and test their contracts.

## Security rules

- Read credentials only from `BUNPRO_API_TOKEN`; never commit, print, snapshot, or echo real tokens.
- Treat `.env`, Bunpro responses, and error bodies as sensitive user data.
- Validate all tool input at the MCP boundary and URL-encode user-controlled path values.
- Keep logging on stderr and never write diagnostics to stdout, which is reserved for MCP stdio.
- Use the least-privileged available credential and preserve read-only behavior.

## Development workflow

1. Inspect relevant callers, tests, and documentation before editing.
2. Make the smallest focused change and preserve unrelated work.
3. Do not add dependencies unless the standard library and existing packages are insufficient.
4. Update tests and documentation whenever behavior, configuration, or contracts change.
5. Never publish, deploy, create a release, or push without explicit authorization.

## Testing and validation

- Run `npm run check` for type checking, unit/contract tests, and a production build.
- Run `npm run test:live` only with an authorized local token; it calls Bunpro but must remain read-only.
- Run `npm pack --dry-run` before a release to inspect package contents.
- Do not publish until the repository metadata and release checklist in `docs/PUBLISHING.md` are resolved.
- For security-sensitive changes, verify that errors, logs, fixtures, and generated files contain no credentials.

## Completion checklist

- Public MCP contracts remain compatible or the change is explicitly documented.
- Relevant tests pass, documentation is current, and package output is valid.
- No secret or personal data was added to tracked files or logs.
- The final summary states changes, validation performed, and remaining limitations.
