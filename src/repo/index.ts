import { Db } from '../db';
import makeAccount from './account';
import makeUser from './user';

const makeRepo = ({ db }: {db: Db }) => {
    return {
        account: makeAccount({ db }),
        user: makeUser({ db })
    }
}

export default makeRepo;

export type Repo = ReturnType<typeof makeRepo>