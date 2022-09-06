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
    repo.account.createAccount({ id: generateId(), userId: user.id, balance: 0 });
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
var PostDepositRequestSchema = import_zod3.z.object({ amount: import_zod3.z.number().positive(), userId: import_zod3.z.string() }).strict();

// src/schemas/requests/postTransfer.ts
var import_zod4 = require("zod");
var PostTransferRequestSchema = import_zod4.z.object({
  amount: import_zod4.z.number().positive(),
  userId: import_zod4.z.string(),
  recepientAccountId: import_zod4.z.string()
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
var makeDeposit = ({ db: db2 }) => ({ userId, amount }) => {
  const account = db2.Accounts.find((x) => x.userId == userId);
  if (!account)
    throw new AppError("User account not found", 404);
  account.balance += amount;
  return account;
};
var makeTransfer = ({ db: db2 }) => ({ amount, userId, recepientAccountId }) => {
  const sender = db2.Accounts.find((x) => x.userId == userId);
  const receipentAccount = db2.Accounts.find((x) => x.id == recepientAccountId);
  if (!sender)
    throw new AppError("Sender account not found", 404);
  if (!receipentAccount)
    throw new AppError("Receipent account not found", 404);
  if (amount > sender.balance)
    throw new AppError("Insufficient balance", 400);
  sender.balance -= amount;
  receipentAccount.balance += amount;
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