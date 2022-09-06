import { z } from "zod";

export const PostDepositRequestSchema = z.object({ amount: z.number().positive(), userId: z.string() }).strict();

export type PostDepositRequest = z.infer<typeof PostDepositRequestSchema>;