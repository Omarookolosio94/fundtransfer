import { ZodError } from "zod";

export type Response = {
    msg?: string,
    data: Record<string, any> | any[] 
} | {
    validationError: ZodError["issues"],
    msg?: string
} | { msg: string};
