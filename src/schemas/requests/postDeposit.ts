import { z } from "zod";
import {CURRENCY} from "../../const/const";

export const PostDepositRequestSchema = z.object({ amount: z.number().positive(), userId: z.string(), currency: z.nativeEnum(CURRENCY) }).strict();

export type PostDepositRequest = z.infer<typeof PostDepositRequestSchema>;