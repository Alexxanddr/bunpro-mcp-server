---
name: review-mcp-server
description: Review Bunpro MCP for contract correctness, security, integration robustness, compatibility, tests, and documentation.
---

# Review Bunpro MCP

Read `AGENTS.md` and relevant source, tests, package configuration, and docs. Review changed code and callers; do not infer behavior from documentation alone.

Check MCP names, descriptions, annotations, schemas, outputs, errors, and compatibility; token handling, base URL trust, validation, sensitive output, and read-only guarantees; Bunpro methods, queries, parsing, pagination, and drift risk; separation of responsibilities and dependencies; test coverage; documentation accuracy; and backward compatibility.

Run the smallest relevant checks, normally `npm run check`. Use `npm run test:live` only with authorized credentials and read-only endpoints.

Report findings first, ordered by severity:

```text
[critical|high|medium|low] Short title
File: path:line
Impact: concrete user/security/compatibility consequence
Evidence: observed code or failing test
Recommendation: smallest concrete correction
```

Do not report style preferences as defects. If there are no findings, say so and list residual risks or untested areas. End with checks run and documentation discrepancies. A review does not authorize code changes, publishing, deployment, or remote operations.
