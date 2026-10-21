# Publishing and releases

## Current status

The package is published as `bunpro-mcp-server`; npm user `alexxanddr0` owns it. Version `0.1.0` was the first public release. The previous candidate `bunpro-mcp` belongs to another project.

The repository metadata points to `Alexxanddr/bunpro-mcp-server`. Every new publication needs a unique version; npm versions cannot be overwritten.

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

1. Verify the npm account, package ownership, and public repository URL.
2. Verify package metadata and installation examples.
3. Update `CHANGELOG.md` and the package version.
4. Run the complete checklist in [TESTING.md](TESTING.md), including live read-only tests and clean tarball installation.
5. Review dependencies, license, Bunpro disclaimer, security contact, and MCP contracts.
6. Create the signed/annotated Git tag and release notes.
7. Publish a GitHub Release whose tag exactly matches `v<package version>`. The `publish.yml` workflow validates, tests, publishes through npm Trusted Publishing, then publishes `server.json` to the official MCP Registry.

## Trusted Publishing setup

The repository includes `.github/workflows/publish.yml` and does not use a long-lived npm token. After pushing that file, configure the package on npm under **Settings → Trusted Publisher → GitHub Actions**:

- Organization or user: `Alexxanddr`
- Repository: `bunpro-mcp-server`
- Workflow filename: `publish.yml`
- Allowed action: `npm publish`

The workflow runs on a GitHub-hosted runner with OIDC permission. npm then issues a short-lived credential and automatically records provenance. A newly configured trusted publisher must complete its first successful publication within npm's configured activation window.

## MCP Registry

`server.json`, `package.json`, and the runtime MCP identity must use the same server name and version. The release workflow authenticates to the official MCP Registry with GitHub OIDC, so no registry token is stored. The npm package is published first because the Registry verifies ownership and availability of the referenced package.

For a manual publication, install `mcp-publisher`, then run:

```bash
mcp-publisher validate server.json
mcp-publisher login github
mcp-publisher publish server.json
```

The official MCP Registry is currently in preview; schema or publication behavior may change before general availability.
