"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express3 = __toESM(require("express"));
var import_helmet = __toESM(require("helmet"));
var import_compression = __toESM(require("compression"));
var import_cors = __toESM(require("cors"));
var import_swagger_ui_express = __toESM(require("swagger-ui-express"));
var import_yamljs = __toESM(require("yamljs"));

// src/handlers/user.ts
var import_express = require("express");

// src/schemas/requests/createUser.ts
var import_zod = require("zod");
var CreateUserRequestSchema = import_zod.z.object({ name: import_zod.z.string(), id: import_zod.z.string() }).strict();

// src/utils.ts
var import_nanoid = require("nanoid");
var generateId = () => {
  return (0, import_nanoid.nanoid)();
};
var rates = { usd: 1, ngn: 415, gdp: 0.86, yuan: 6.89 };
var TransferFund = (senderAccount, amount, currency) => {
  const account = senderAccount;
  if (account.subwallets[currency] >= amount) {
    account.subwallets[currency] = account.subwallets[currency] - amount;
    return { account, balance: 0 };
  }
  const tempWallets = {
    ngn: convertToUsd({ currency: "ngn", amount: account.subwallets.ngn }).amount,
    gdp: convertToUsd({ currency: "gdp", amount: account.subwallets.gdp }).amount,
    yuan: convertToUsd({ currency: "yuan", amount: account.subwallets.yuan }).amount,
    usd: convertToUsd({ currency: "usd", amount: account.subwallets.usd }).amount
  };
  const amountInUsd = convertToUsd({ amount, currency }).amount;
  let balance = amountInUsd - tempWallets[currency];
  tempWallets[currency] = 0;
  for (const key in tempWallets) {
    if (key === currency)
      continue;
    if (tempWallets[key] >= balance) {
      tempWallets[key] -= balance;
      balance = 0;
      break;
    }
    balance -= tempWallets[key];
    tempWallets[key] = 0;
  }
  if (balance > 0) {
    return { account, balance };
  } else {
    account.subwallets.gdp = convertFromUsd({
      amount: tempWallets.gdp,
      currency: "gdp"
    }).amount;
    account.subwallets.usd = convertFromUsd({
      amount: tempWallets.usd,
      currency: "usd"
    }).amount;
    account.subwallets.yuan = convertFromUsd({
      amount: tempWallets.yuan,
      currency: "yuan"
    }).amount;
    account.subwallets.ngn = convertFromUsd({
      amount: tempWallets.ngn,
      currency: "ngn"
    }).amount;
    return { account, balance: 0 };
  }
};
var convertToUsd = (to) => {
  return {
    currency: "usd",
    amount: Number((to.amount / rates[to.currency]).toFixed(2))
  };
};
var convertFromUsd = (from) => {
  return {
    currency: from.currency,
    amount: Number((from.amount * rates[from.currency]).toFixed(2))
  };
};

// src/handlers/user.ts
var makeUser = ({ repo }) => {
  const router = (0, import_express.Router)();
  router.post("/", (req, res) => {
    const user = { ...req.body, id: generateId() };
    try {
      CreateUserRequestSchema.parse(user);
    } catch (err) {
      return res.status(400).send({ validationError: err.issues });
    }
    repo.user.addUser(user);
    repo.account.createAccount({ id: generateId(), userId: user.id, balance: 0, subwallets: { usd: 0, ngn: 0, gdp: 0, yuan: 0 } });
    res.send({ data: user });
  });
  return router;
};
var user_default = makeUser;

// src/handlers/account.ts
var import_express2 = require("express");

// src/schemas/requests/getBalance.ts
var import_zod2 = require("zod");
var GetBalanceRequestSchema = import_zod2.z.object({
  userId: import_zod2.z.string()
}).strict();

// src/schemas/requests/postDeposit.ts
var import_zod3 = require("zod");

// src/const/const.ts
var CURRENCY = { USD: "usd", NGN: "ngn", GBP: "gdp", YUAN: "yuan" };

// src/schemas/requests/postDeposit.ts
var PostDepositRequestSchema = import_zod3.z.object({ amount: import_zod3.z.number().positive(), userId: import_zod3.z.string(), currency: import_zod3.z.nativeEnum(CURRENCY) }).strict();

// src/schemas/requests/postTransfer.ts
var import_zod4 = require("zod");
var PostTransferRequestSchema = import_zod4.z.object({
  amount: import_zod4.z.number().positive(),
  userId: import_zod4.z.string(),
  recepientAccountId: import_zod4.z.string(),
  currency: import_zod4.z.nativeEnum(CURRENCY)
}).strict();

// src/handlers/account.ts
var makeAccount = ({ repo }) => {
  const router = (0, import_express2.Router)();
  router.post("/deposit", (req, res) => {
    try {
      PostDepositRequestSchema.parse(req.body);
    } catch (err) {
      return res.status(400).send({ validationError: err.issues });
    }
    const user = repo.user.getUserById(req.body.userId);
    if (!user) {
      return res.status(404).send({
        msg: "User not found"
      });
    }
    try {
      const accocunt = repo.account.makeDeposit(req.body);
      res.status(201).send({ data: accocunt });
      return;
    } catch (err) {
      res.status(err.code).send({
        msg: err.msg
      });
    }
  });
  router.post("/transfer", (req, res) => {
    try {
      PostTransferRequestSchema.parse(req.body);
    } catch (err) {
      return res.status(400).send({ validationError: err.issues });
    }
    try {
      const account = repo.account.makeTransfer(req.body);
      res.status(201).send({ data: account, msg: "Transfer successful" });
    } catch (err) {
      res.status(err.code).send({
        msg: err.msg
      });
    }
  });
  router.get("/balance/:userId", (req, res) => {
    try {
      GetBalanceRequestSchema.parse(req.params);
    } catch (err) {
      return res.status(400).send({ validationError: err.issues });
    }
    try {
      const account = repo.account.getAccountByUserId(req.params.userId);
      res.status(200).send({ data: account });
    } catch (err) {
      res.status(err.code).send({
        msg: err.msg
      });
    }
  });
  return router;
};
var account_default = makeAccount;

// src/app.ts
var makeApp = ({ repo }) => {
  const app2 = (0, import_express3.default)();
  app2.use((0, import_compression.default)());
  app2.use((0, import_helmet.default)());
  app2.use(import_express3.default.json());
  app2.use((0, import_cors.default)({ origin: "*" }));
  app2.use(
    "/reference",
    import_swagger_ui_express.default.serve,
    import_swagger_ui_express.default.setup(import_yamljs.default.load(process.cwd() + "/docs/swagger.yml"))
  );
  app2.get("/", (req, res) => {
    res.send({
      msg: "Welcome to waficode"
    });
  });
  app2.use("/users", user_default({ repo }));
  app2.use("/accounts", account_default({ repo }));
  return app2;
};

// src/error.ts
var AppError = class extends Error {
  msg;
  code;
  constructor(msg, code) {
    super(msg);
    this.msg = msg;
    this.code = code;
  }
};

// src/repo/account.ts
var createAccount = ({ db: db2 }) => (account) => {
  db2.Accounts.push(account);
};
var getAccountByUserId = ({ db: db2 }) => (userId) => {
  const account = db2.Accounts.find((x) => x.userId == userId);
  if (!account)
    throw new AppError("User account not found", 404);
  return account;
};
var makeDeposit = ({ db: db2 }) => ({ userId, amount, currency }) => {
  const account = db2.Accounts.find((x) => x.userId == userId);
  if (!account)
    throw new AppError("User account not found", 404);
  var currencies = Object.keys(account.subwallets);
  if (!currencies.includes(currency))
    throw new AppError("Currency not supported", 404);
  account.subwallets[currency] += amount;
  return account;
};
var makeTransfer = ({ db: db2 }) => ({ amount, userId, recepientAccountId, currency }) => {
  let sender = db2.Accounts.find((x) => x.userId == userId);
  const receipentAccount = db2.Accounts.find(
    (x) => x.id == recepientAccountId
  );
  if (!sender)
    throw new AppError("Sender account not found", 404);
  if (!receipentAccount)
    throw new AppError("Receipent account not found", 404);
  var response = TransferFund(sender, amount, currency);
  if (response.balance > 0) {
    throw new AppError("Insufficient balance", 400);
  } else {
    sender = response.account;
    receipentAccount.subwallets[currency] += amount;
  }
  return sender;
};
var makeAccount2 = ({ db: db2 }) => {
  return {
    createAccount: createAccount({ db: db2 }),
    makeDeposit: makeDeposit({ db: db2 }),
    makeTransfer: makeTransfer({ db: db2 }),
    getAccountByUserId: getAccountByUserId({ db: db2 })
  };
};
var account_default2 = makeAccount2;

// src/repo/user.ts
var addUser = ({ db: db2 }) => (user) => {
  db2.Users.push(user);
};
var getUserById = ({ db: db2 }) => (id) => {
  return db2.Users.find((x) => x.id == id);
};
var makeUser2 = ({ db: db2 }) => {
  return {
    addUser: addUser({ db: db2 }),
    getUserById: getUserById({ db: db2 })
  };
};
var user_default2 = makeUser2;

// src/repo/index.ts
var makeRepo = ({ db: db2 }) => {
  return {
    account: account_default2({ db: db2 }),
    user: user_default2({ db: db2 })
  };
};
var repo_default = makeRepo;

// src/db/index.ts
var db = {
  Accounts: [],
  Users: []
};

// src/index.ts
var PORT = 3e3;
var app = makeApp({ repo: repo_default({ db }) });
app.listen(PORT, () => {
  console.log(`App running on Port ${PORT}`);
});
//# sourceMappingURL=index.js.map