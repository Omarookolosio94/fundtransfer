import { nanoid } from 'nanoid';
import { Currency } from './const/const';
import { Account } from './schemas/models/Account';

export const generateId = () => {
  return nanoid();
};

const rates = { usd: 1, ngn: 415, gdp: 0.86, yuan: 6.89 };

export const TransferFund = (
  senderAccount: Account,
  amount: number,
  currency: Currency
) => {
  const account = senderAccount;

  if (account.subwallets[currency] >= amount) {
    account.subwallets[currency] = account.subwallets[currency] - amount;
    return { account: account, balance: 0 };
  }

  // convert all wallet amount to baseline usd

  const tempWallets = {
    ngn: convertToUsd({ currency: 'ngn', amount: account.subwallets.ngn })
      .amount,
    gdp: convertToUsd({ currency: 'gdp', amount: account.subwallets.gdp })
      .amount,
    yuan: convertToUsd({ currency: 'yuan', amount: account.subwallets.yuan })
      .amount,
    usd: convertToUsd({ currency: 'usd', amount: account.subwallets.usd })
      .amount,
  };

  const amountInUsd = convertToUsd({ amount, currency }).amount;

  let balance = amountInUsd - tempWallets[currency];

  tempWallets[currency] = 0;

  for (const key in tempWallets) {
    if (key === currency) continue;

    if (tempWallets[key as Currency] >= balance) {
      tempWallets[key as Currency] -= balance;

      balance = 0;

      break;
    }

    balance -= tempWallets[key as Currency];

    tempWallets[key as Currency] = 0;
  }

  console.log(balance, "balance before final check");

  if (balance > 0) {
    return { account: account, balance: balance };
  } else {
    account.subwallets.gdp = convertFromUsd({
      amount: tempWallets.gdp,
      currency: 'gdp',
    }).amount;
    account.subwallets.usd = convertFromUsd({
      amount: tempWallets.usd,
      currency: 'usd',
    }).amount;
    account.subwallets.yuan = convertFromUsd({
      amount: tempWallets.yuan,
      currency: 'yuan',
    }).amount;
    account.subwallets.ngn = convertFromUsd({
      amount: tempWallets.ngn,
      currency: 'ngn',
    }).amount;

    return { account: account, balance: 0 };
  }
};

const convertToUsd = (to: { amount: number; currency: Currency }) => {
  return {
    currency: 'usd',
    amount: Number((to.amount / rates[to.currency]).toFixed(2)),
  };
};

const convertFromUsd = (from: { amount: number; currency: Currency }) => {
  return {
    currency: from.currency,
    amount: Number((from.amount * rates[from.currency]).toFixed(2)),
  };
};
