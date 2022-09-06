import { Router } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../error';
import { Repo } from '../repo';
import {
  GetBalanceRequest,
  GetBalanceRequestSchema,
} from '../schemas/requests/getBalance';
import {
  PostDepositRequest,
  PostDepositRequestSchema,
} from '../schemas/requests/postDeposit';
import {
  PostTransferRequest,
  PostTransferRequestSchema,
} from '../schemas/requests/postTransfer';
import { Response } from '../types';

const makeAccount = ({ repo }: { repo: Repo }) => {
  const router = Router();

  router.post<{}, Response, PostDepositRequest>('/deposit', (req, res) => {
    try {
      PostDepositRequestSchema.parse(req.body);
    } catch (err) {
      return res
        .status(400)
        .send({ validationError: (err as ZodError).issues });
    }

    const user = repo.user.getUserById(req.body.userId);

    if (!user) {
      return res.status(404).send({
        msg: 'User not found',
      });
    }

    try {
      const accocunt = repo.account.makeDeposit(req.body);

      res.status(201).send({ data: accocunt });
      return;
    } catch (err) {
      res.status((err as AppError).code).send({
        msg: (err as AppError).msg,
      });
    }
  });

  router.post<{}, Response, PostTransferRequest>('/transfer', (req, res) => {
    try {
      PostTransferRequestSchema.parse(req.body);
    } catch (err) {
      return res
        .status(400)
        .send({ validationError: (err as ZodError).issues });
    }

    try {
      const account = repo.account.makeTransfer(req.body);
      res.status(201).send({ data: account, msg: 'Transfer successful' });
    } catch (err) {
      res.status((err as AppError).code).send({
        msg: (err as AppError).msg,
      });
    }
  });

  router.get<GetBalanceRequest, Response>('/balance/:userId', (req, res) => {
    try {
      GetBalanceRequestSchema.parse(req.params);
    } catch (err) {
      return res
        .status(400)
        .send({ validationError: (err as ZodError).issues });
    }

    try {
      const account = repo.account.getAccountByUserId(req.params.userId);
      res.status(200).send({ data: account });
    } catch (err) {
      res.status((err as AppError).code).send({
        msg: (err as AppError).msg,
      });
    }
  });

  return router;
};

export default makeAccount;
