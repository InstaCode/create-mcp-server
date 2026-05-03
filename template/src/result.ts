export interface CallToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
  [key: string]: unknown;
}

export function ok(payload: unknown): CallToolResult {
  const text = JSON.stringify(payload, null, 2);
  const structured: Record<string, unknown> =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : { value: payload };
  return {
    content: [{ type: "text", text }],
    structuredContent: structured,
  };
}

export function fail(err: unknown): CallToolResult {
  const e = err as { name?: string; message?: string };
  const message = e?.message ?? String(err);
  const name = e?.name ?? "Error";
  return {
    content: [{ type: "text", text: `${name}: ${message}` }],
    isError: true,
  };
}

export function wrap<T>(
  handler: (args: T) => Promise<unknown>,
): (args: T) => Promise<CallToolResult> {
  return async (args: T) => {
    try {
      return ok(await handler(args));
    } catch (err) {
      return fail(err);
    }
  };
}
