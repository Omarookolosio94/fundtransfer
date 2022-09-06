import { Account } from "../schemas/models/Account";
import { User } from "../schemas/models/User";

export type Db = {
    Accounts: Account[],
    Users: User[]
}
    
export const db: Db = {
    Accounts: [],
    Users: []
}