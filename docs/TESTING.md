# Testing

## Strategy and commands

Deterministic local checks are separate from authenticated live checks. Pull requests and CI use:

```bash
npm ci
npm run check
npm pack --dry-run
```

`npm run check` runs type checking, unit/contract tests, and a production build.

## Unit and contract tests

`test/client.test.ts` replaces global `fetch` and verifies authentication, URL/query construction, errors, request bodies, and response projection.

`test/server.test.ts` connects an MCP client and server through in-memory transport. It checks the published tool inventory, read-only annotations, and representative endpoint delegation. Add or change a tool only with a corresponding inventory/schema or behavior assertion.

Fixtures are inline and deliberately small. They must never contain copied personal data or real credentials.

## Live integration tests

Create an untracked `.env` from `.env.example`, then run:

```bash
npm run test:live
```

The suite calls listed read-only endpoints and skips when `BUNPRO_API_TOKEN` is absent. It detects authentication failure and endpoint drift. Parameterized endpoints needing real deck, topic, or vocabulary identifiers are not exercised live; their routing is covered locally.

Never add a write endpoint to the live suite without a separate safety design and explicit maintainer approval.

## Release verification

1. Run `npm ci` in a clean checkout.
2. Run `npm run check`.
3. Run `npm run test:live` with an authorized test account/token.
4. Inspect `npm pack --dry-run` and confirm only intended files ship.
5. Install the tarball in a clean temporary project and invoke it from an MCP host.
6. Confirm no `.env`, token, personal path, test response, or local artifact is packaged.

There is currently no formatter or linter dependency. TypeScript, tests, and review are proportionate for this small codebase; add tooling only for a concrete enforceable need.
