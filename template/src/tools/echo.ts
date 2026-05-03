import type { EchoArgs } from "../schemas.js";

export async function echo(args: EchoArgs): Promise<{ echoed: string }> {
  return { echoed: args.message };
}
