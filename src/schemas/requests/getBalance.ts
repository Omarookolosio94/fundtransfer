import { z } from "zod";

export const GetBalanceRequestSchema = z.object({
    userId: z.string()
}).strict();

export type GetBalanceRequest = z.infer<typeof GetBalanceRequestSchema>;