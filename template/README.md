# __PKG_NAME__

__DESCRIPTION__

## Tools

| Tool | Purpose |
|---|---|
| `echo` | Echo a message back (replace this with your real tools) |

## Prerequisites

- Node.js 18+

## Setup

```bash
npm install
npm run build
```

If your server needs credentials, copy `.env.example` to `.env` and fill it in.

## Test it locally

Use the MCP Inspector to poke at the tools without wiring up a client:

```bash
npm run inspect
```

Then in the inspector UI: list tools, call `echo`, etc.

## Use with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "__BIN_NAME__": {
      "command": "node",
      "args": ["/absolute/path/to/__REPO_NAME__/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop. The tools should appear under the MCP icon.

## Adding a tool

See [CLAUDE.md](CLAUDE.md) for the full conventions. Short version:

1. `src/tools/foo.ts` — handler function
2. `src/schemas.ts` — zod input schema
3. `src/tools/index.ts` — register the tool
4. `.github/expected-tools.json` — add the tool name so CI catches accidental removal

## Publishing

Releases are published to npm via OIDC trusted publishing — no `NPM_TOKEN` required in CI.

**First publish (one-time, manual):**

The npm trusted-publisher settings page only appears for packages that already exist on npmjs.com. So v0.1.0 must be published manually:

```bash
npm login
npm publish --access public
```

`--provenance` is intentionally omitted here. Provenance attestations require a supported OIDC provider (GitHub Actions, etc.) and will fail locally with `Automatic provenance generation not supported for provider: null`. The CI workflow adds `--provenance` automatically.

**After the first publish:**

1. Go to <https://www.npmjs.com/package/__PKG_NAME__> -> Settings -> Trusted Publishers
2. Add a publisher with:
   - Repository owner: `__REPO_OWNER__`
   - Repository name: `__REPO_NAME__`
   - Workflow filename: `publish.yml`

**Subsequent releases (automated):**

```bash
npm version patch   # or minor / major
git push --follow-tags
```

The `Publish to npm` workflow runs on the new `v*` tag, verifies the tag matches `package.json`, builds, and publishes with provenance.

## License

MIT
