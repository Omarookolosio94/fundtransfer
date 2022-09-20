import { z } from "zod";
import {CURRENCY} from "../../const/const";

export const PostTransferRequestSchema = z.object({
    amount: z.number().positive(),
    userId: z.string(),
    recepientAccountId: z.string(),
    currency: z.nativeEnum(CURRENCY)
}).strict();

export type PostTransferRequest = z.infer<typeof PostTransferRequestSchema>;