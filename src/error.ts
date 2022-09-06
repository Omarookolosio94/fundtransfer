export class AppError extends Error {
    msg!: string;
    code!: number;

    constructor(msg: string, code: number) {
        super(msg)

        this.msg = msg;
        this.code = code;
    }
}