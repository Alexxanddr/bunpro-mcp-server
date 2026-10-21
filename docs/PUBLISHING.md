# Publishing and releases

## Current status

The selected npm package name is `bunpro-mcp-server`; it was available when checked on 2026-10-21. The previous candidate `bunpro-mcp` was already occupied at version `1.0.0`.

Availability is not a reservation. Verify `bunpro-mcp-server` again immediately before the first publication. The repository metadata points to `Alexxanddr/bunpro-mcp-server`; add final installation examples after publishing.

## Recommended first distribution

Use npm plus GitHub Releases for the current local stdio server:

- npm supplies the executable to Node-based MCP hosts.
- Git tags and GitHub Releases provide source history, notes, and checksums/artifacts if desired.
- The MCP Registry can be evaluated after the package name and public repository URL are stable.
- Docker adds little value to a stdio process that must receive a local user token, so no image is prepared.
- A hosted streamable-HTTP edition is a separate architecture requiring per-user authentication and secure token storage.

## Versioning

Use Semantic Versioning and tags of the form `vX.Y.Z`. Until `1.0.0`, document any breaking MCP contract change prominently. Tool removals/renames, stricter schemas, changed defaults, and changed local output projections are breaking changes.

## Pre-release checklist

1. Reverify the npm package name and public repository URL.
2. Verify repository/homepage/bugs metadata and add final installation examples.
3. Update `CHANGELOG.md` and the package version.
4. Run the complete checklist in [TESTING.md](TESTING.md), including live read-only tests and clean tarball installation.
5. Review dependencies, license, Bunpro disclaimer, security contact, and MCP contracts.
6. Create the signed/annotated Git tag and release notes.
7. Publish only with explicit maintainer authorization and npm provenance/2FA where available.

No automated publish workflow is included yet: credentials, package identity, repository URL, and release policy are unresolved, so automation would be premature.
