import { z } from "zod";

export const User = z.object({ id: z.string(), name: z.string() }).strict();

export type User = z.infer<typeof User>;