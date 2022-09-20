import { z } from "zod";
import { Subwallet } from './Subwallet';

export const Account = z.object({ id: z.string(), userId: z.string(), balance: z.number(), subwallets : Subwallet }).strict();

export type Account = z.infer<typeof Account>;