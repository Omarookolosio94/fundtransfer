import { Db } from '../db';
import { AppError } from '../error';
import { Currency } from '../const/const';
import { Account } from '../schemas/models/Account';
import { PostDepositRequest } from '../schemas/requests/postDeposit';
import { PostTransferRequest } from '../schemas/requests/postTransfer';

const rates = { usd: 1, ngn: 415, gdp: 0.86, yuan: 6.89 };

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

    account.subwallets[currency] = amount;

    return account;
  };

const makeTransfer =
  ({ db }: { db: Db }) =>
  ({ amount, userId, recepientAccountId, currency }: PostTransferRequest) => {
    const sender = db.Accounts.find((x) => x.userId == userId);

    const receipentAccount = db.Accounts.find(
      (x) => x.id == recepientAccountId
    );

    if (!sender) throw new AppError('Sender account not found', 404);

    if (!receipentAccount)
      throw new AppError('Receipent account not found', 404);

    //if (amount > sender.balance) throw new AppError("Insufficient balance", 400);

    if (amount < sender.subwallets[currency]) {
      sender.balance -= amount;

      receipentAccount.balance += amount;
    } else {
      // convert balance in each wallet to to currency

        let subbalance = { usd: 0, ngn: 0, gdp: 0, yuan: 0 };

        subbalance[currency] = sender.subwallets[currency]
        
        let totalbalance = sender.subwallets[currency];

      for (const key in subbalance) {
          if (key === currency) continue;

          if (totalbalance >= amount) return;

          // const usdrate = rates[key as Currency] * rates.usd;
           
          // balance.push(converter(amount - totalbalance, key as Currency, currency));
      }

    }

    return sender;
  };

const converter = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
) => {

  if (rates[fromCurrency] < rates[toCurrency]) {
    return amount * rates[toCurrency];
  } else if (rates[fromCurrency] > rates[toCurrency]) {
    return amount / rates[fromCurrency];
  } else {
    return amount;
  }
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
