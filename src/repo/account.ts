import { send } from 'process';
import { Db } from '../db';
import { AppError } from '../error';
import { Account } from '../schemas/models/Account';
import { PostDepositRequest } from '../schemas/requests/postDeposit';
import { PostTransferRequest } from '../schemas/requests/postTransfer';
import { TransferFund } from '../utils';

const createAccount =
  ({ db }: { db: Db }) =>
  (account: Account) => {
    db.Accounts.push(account);
  };

const getAccountByUserId =
  ({ db }: { db: Db }) =>
  (userId: string) => {
    const account = db.Accounts.find((x) => x.userId == userId);

    if (!account) throw new AppError('User account not found', 404);

    return account;
  };

const makeDeposit =
  ({ db }: { db: Db }) =>
  ({ userId, amount, currency }: PostDepositRequest) => {
    const account = db.Accounts.find((x) => x.userId == userId);

    if (!account) throw new AppError('User account not found', 404);

    var currencies = Object.keys(account.subwallets);

    if (!currencies.includes(currency))
      throw new AppError('Currency not supported', 404);

    account.subwallets[currency] += amount;

    return account;
  };

const makeTransfer =
  ({ db }: { db: Db }) =>
  ({ amount, userId, recepientAccountId, currency }: PostTransferRequest) => {
    let sender = db.Accounts.find((x) => x.userId == userId);

    const receipentAccount = db.Accounts.find(
      (x) => x.id == recepientAccountId
    );

    if (!sender) throw new AppError('Sender account not found', 404);

    if (!receipentAccount)
      throw new AppError('Receipent account not found', 404);

    var response = TransferFund(sender, amount, currency);

    if (response.balance > 0) {
      throw new AppError('Insufficient balance', 400);
    } else {
      sender = response.account;

      receipentAccount.subwallets[currency] += amount;
    }

    return sender;
  };

const makeAccount = ({ db }: { db: Db }) => {
  return {
    createAccount: createAccount({ db }),
    makeDeposit: makeDeposit({ db }),
    makeTransfer: makeTransfer({ db }),
    getAccountByUserId: getAccountByUserId({ db }),
  };
};

export default makeAccount;
