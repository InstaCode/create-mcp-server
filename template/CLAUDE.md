# Conventions for this MCP server

This file describes the patterns this codebase follows. When adding or modifying tools, stick to these patterns so the smoke test, type checker, and runtime behavior stay consistent.

## Stdio transport rules

- The server speaks JSON-RPC over **stdout**. Never write to stdout from your code.
- All logging goes to **stderr** via `console.error` or `process.stderr.write`.

## Adding a new tool

1. Create `src/tools/foo.ts` exporting a handler function.
2. Add the input schema to `src/schemas.ts` using `z.object({...}).strict()` and `.describe()` on every field.
3. Register the tool in `src/tools/index.ts` with `server.registerTool(name, meta, wrap(handler))`.
4. Set realistic `annotations`:
   - `readOnlyHint`: tool doesn't modify state
   - `destructiveHint`: tool deletes / overwrites
   - `idempotentHint`: calling twice is the same as calling once
   - `openWorldHint`: tool talks to an external service (vs. pure local computation)
   MCP clients use these for permission prompts.
5. Add the tool name to `.github/expected-tools.json`. CI fails if a registered tool drops out of `tools/list`.

## Result helpers

All tool handlers go through `wrap()` from `src/result.ts`. **Don't try/catch inside handlers** — `wrap` handles error formatting.

```ts
// Good
server.registerTool("foo", meta, wrap(async (args) => {
  return await doTheThing(args);
}));

// Bad — duplicates wrap's error handling
server.registerTool("foo", meta, async (args) => {
  try { return ok(await doTheThing(args)); }
  catch (e) { return fail(e); }
});
```

`ok()` JSON-stringifies the payload and adds `structuredContent` automatically.

## Schemas

- Use `z.object({...}).strict()` so unknown args fail loudly.
- Put `.describe(...)` on every field — descriptions are surfaced to the model and meaningfully change tool-call quality.
- Re-export the inferred TS type with `z.infer<typeof Foo>` for handler signatures.

## Env vars

Read required env via `getRequiredEnv("NAME")` from `src/env.ts`. It exits with a clear "see .env.example" message on missing values, so the user knows what to set.
