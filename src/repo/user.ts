import { Db } from "../db";
import { User } from "../schemas/models/User";

const addUser = ({db}: {db: Db}) => (user: User) => {
    db.Users.push(user);
}

const getUserById = ({db}: {db: Db}) =>(id: string) => {
    return db.Users.find(x => x.id == id)
}

const makeUser = ({ db }: { db: Db }) => {
    return {
        addUser: addUser({ db }),
        getUserById: getUserById({ db }),
    }
}

export default makeUser