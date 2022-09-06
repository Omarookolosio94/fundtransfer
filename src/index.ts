import { makeApp } from "./app";
import makeRepo from "./repo";
import { db } from './db';

const PORT = 3000;

const app = makeApp({ repo: makeRepo({ db }) });

app.listen(PORT, () => {
  console.log(`App running on Port ${PORT}`);
});
