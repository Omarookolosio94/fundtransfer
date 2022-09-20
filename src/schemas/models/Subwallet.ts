import { z } from "zod";

export const Subwallet = z.object({ usd: z.number(), ngn: z.number(), gdp: z.number(), yuan: z.number() });

export type Subwallet = z.infer<typeof Subwallet>;