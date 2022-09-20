export const CURRENCY = { USD: 'usd', NGN: 'ngn', GBP: 'gdp', YUAN: 'yuan' } as const;

export type Currency = typeof CURRENCY[keyof typeof CURRENCY]