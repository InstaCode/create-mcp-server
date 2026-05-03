import { z } from "zod";

export const EchoInput = z
  .object({
    message: z.string().min(1).describe("Message to echo back."),
  })
  .strict();

export type EchoArgs = z.infer<typeof EchoInput>;
