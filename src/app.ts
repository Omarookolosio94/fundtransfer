import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import makeUser from './handlers/user';
import makeAccount from './handlers/account';
import { Repo } from './repo';

const makeApp = ({ repo }: { repo: Repo }) => {
  const app = express();

  app.use(compression());

  app.use(helmet());

  app.use(express.json());

  app.use(cors({ origin: '*' }));

  app.use(
    '/reference',
    swaggerUi.serve,
    swaggerUi.setup(YAML.load(process.cwd() + '/docs/swagger.yml'))
  );

  app.get('/', (req, res) => {
    res.send({
      msg: 'Welcome to waficode',
    });
  });

  app.use('/users', makeUser({ repo }));

  app.use('/accounts', makeAccount({ repo }));

  return app;
};

export { makeApp };
