import { z } from "zod";
import { Account } from "./Account";

export const User = z.object({ id: z.string(), name: z.string() }).strict();

export type User = z.infer<typeof User>;