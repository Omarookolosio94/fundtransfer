import { z } from "zod";

export const CreateUserRequestSchema = z.object({ name: z.string(), id: z.string() }).strict();

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;