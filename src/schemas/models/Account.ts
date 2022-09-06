import { z } from "zod";

export const Account = z.object({ id: z.string(), userId: z.string(), balance: z.number() }).strict();

export type Account = z.infer<typeof Account>;