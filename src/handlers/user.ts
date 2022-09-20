import { Router } from 'express';
import { ZodError } from 'zod';
import { Repo } from '../repo';
import { CreateUserRequestSchema } from '../schemas/requests/createUser';
import { Response } from '../types';
import { generateId } from '../utils';

const makeUser = ({ repo }: { repo: Repo }) => {
  const router = Router();

  router.post<{}, Response>('/', (req, res) => {
    const user = { ...req.body, id: generateId() };

    try {
      CreateUserRequestSchema.parse(user);
    } catch (err) {
      return res
        .status(400)
        .send({ validationError: (err as ZodError).issues });
    }

    repo.user.addUser(user);

    repo.account.createAccount({ id: generateId(), userId: user.id, balance: 0, subwallets: { usd: 0, ngn: 0, gdp: 0, yuan: 0} });

    res.send({ data: user });
  });

  return router;
};

export default makeUser;