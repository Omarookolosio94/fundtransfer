import { Db } from '../db';
import { AppError } from '../error';
import { Account } from '../schemas/models/Account';
import { PostDepositRequest } from '../schemas/requests/postDeposit';
import { PostTransferRequest } from '../schemas/requests/postTransfer';

const createAccount = ({ db}: { db: Db}) => (account: Account) => {
  db.Accounts.push(account);
};

const getAccountByUserId = ({ db}: { db: Db}) =>   (userId: string) => {
    const account = db.Accounts.find(x => x.userId == userId);

    if (!account) throw new AppError("User account not found", 404);

    return account;
  };
  

const makeDeposit = ({ db}: { db: Db}) => ({ userId, amount }: PostDepositRequest) => {
    const account = db.Accounts.find(x => x.userId == userId);

    if (!account) throw new AppError("User account not found", 404);

    account.balance += amount;

    return account;
};

const makeTransfer= ({ db}: { db: Db}) => ({ amount, userId, recepientAccountId }: PostTransferRequest) => {
    const sender = db.Accounts.find(x => x.userId == userId);

    const receipentAccount = db.Accounts.find(x => x.id == recepientAccountId);

    if (!sender) throw new AppError("Sender account not found", 404);

    if (!receipentAccount) throw new AppError("Receipent account not found", 404);

    if (amount > sender.balance) throw new AppError("Insufficient balance", 400);

    sender.balance -= amount;

    receipentAccount.balance += amount;

    return sender;
}

const makeAccount = ({ db }: { db: Db }) => {
    return {
        createAccount: createAccount({ db }),
        makeDeposit: makeDeposit({ db }),
        makeTransfer: makeTransfer({ db }),
        getAccountByUserId: getAccountByUserId({ db })
    }
}

export default makeAccount;
