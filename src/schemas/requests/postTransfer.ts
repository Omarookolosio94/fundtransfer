import { z } from "zod";

export const PostTransferRequestSchema = z.object({
    amount: z.number().positive(),
    userId: z.string(),
    recepientAccountId: z.string()
}).strict();

export type PostTransferRequest = z.infer<typeof PostTransferRequestSchema>;