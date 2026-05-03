# @instacodeio/create-mcp-server

Scaffold a new MCP (Model Context Protocol) server with the conventions used in InstaCode's MCP repos.

## Usage

```bash
npm create @instacodeio/mcp-server my-mcp-server
```

You'll be prompted for package name, bin name, GitHub owner/repo, and author. Then:

```bash
cd my-mcp-server
npm install
npm run build
npm run inspect   # poke at the example "echo" tool in MCP Inspector
```

Non-interactive form (for CI or scripted use):

```bash
npm create @instacodeio/mcp-server my-mcp-server -- \
  --bin my-mcp-server \
  --description "MCP server for X" \
  --repo-owner InstaCode \
  --no-prompt
```

## What it gives you

```
my-mcp-server/
├── package.json          # @instacodeio scope, OIDC publish ready
├── tsconfig.json         # strict TS, ES2022, NodeNext
├── README.md             # setup, MCP Inspector, Claude Desktop, publishing
├── LICENSE
├── SECURITY.md
├── CHANGELOG.md
├── CLAUDE.md             # conventions for AI agents adding tools
├── .env.example
├── .gitignore
├── .github/
│   ├── workflows/
│   │   ├── ci.yml        # typecheck + build + tools/list smoke test
│   │   └── publish.yml   # OIDC trusted publish on v* tags
│   └── expected-tools.json
└── src/
    ├── index.ts          # bootstrap (stdio, McpServer, registerTools)
    ├── env.ts            # getRequiredEnv helper
    ├── result.ts         # ok / fail / wrap — handlers stay short
    ├── schemas.ts        # zod input schemas, .strict() + .describe()
    └── tools/
        ├── index.ts      # registerTools(server)
        └── echo.ts       # example tool — replace with yours
```

## Why this template

Both `icloud-drive-mcp-server` and `icloud-calendar-mcp-server` ended up with the same skeleton — same tsconfig, same scripts, same OIDC publish flow, same env-validation pattern. They each reinvented `ok` / `fail` / `wrap` slightly differently. This template promotes the better version of each pattern and gives Claude a `CLAUDE.md` that documents the conventions, so a generated tool lands in the right shape on the first try.

The CI smoke test reads `.github/expected-tools.json` instead of hard-coding tool names — adding a new tool means one JSON line, not a workflow edit.

## License

MIT
