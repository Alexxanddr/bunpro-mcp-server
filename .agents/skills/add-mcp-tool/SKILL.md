---
name: add-mcp-tool
description: Add or change a Bunpro MCP tool while preserving contracts, read-only safety, tests, and documentation.
---

# Add a Bunpro MCP tool

1. Read `AGENTS.md`, `docs/ARCHITECTURE.md`, and `docs/MCP_CONTRACTS.md` completely.
2. Inspect `src/server.ts`, relevant `BunproClient` methods, callers, and tests before editing.
3. Confirm the operation from API documentation or observed browser traffic. Determine whether it is read-only; stop for an explicit safety decision on writes.
4. Choose a stable `snake_case` name and concise description distinct from existing tools. Preserve existing names and semantics.
5. Define the narrowest Zod input schema. Constrain enums/ranges and encode path input.
6. Put reusable HTTP/business behavior in `src/client.ts`; keep MCP formatting and registration in `src/server.ts`. Add no wrapper or dependency without concrete need.
7. Use shared request and error paths. Never log tokens or Bunpro response data.
8. Add a focused client test for request/projection logic and an MCP contract test for inventory, schema, or delegation. Live tests are allowed only for read-only calls needing no personal fixture IDs.
9. Update the README tool table and `docs/MCP_CONTRACTS.md`; update other docs only if their behavior changes.
10. Do not rename/remove a tool, narrow inputs, change defaults, or alter projected output without an explicitly documented breaking release.
11. Run `npm run check`; when authorized and safe, run `npm run test:live`. Run `npm pack --dry-run` when package contents change.
12. Report the contract, files changed, checks run, and upstream uncertainty. Do not publish or push.
