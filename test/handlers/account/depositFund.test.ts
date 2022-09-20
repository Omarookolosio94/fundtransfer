import { send } from 'process';
import request from 'supertest';
import { makeApp } from '../../../src/app';
import makeRepo from '../../../src/repo';
import { Account } from '../../../src/schemas/models/Account';
import { User } from '../../../src/schemas/models/User';

const mockAccounts = [
  {
    id: 'F8n-xMpAB2GpYD4u9u6Z9',
    balance: 0,
    userId: 'GNY6TSN0u5RSadLscJjDd',
    subwallets: {
      usd: 5000,
      ngn: 0,
      gdp: 0,
      yuan: 0,
    },
  },
  {
    id: '02o_H_EQOe093NQmmjVYS',
    balance: 0,
    userId: 'TtR_nNEJCroj80fSOiec5',
    subwallets: {
      usd: 20000,
      ngn: 0,
      gdp: 0,
      yuan: 0,
    },
  },
];
const mockUsers = [
  {
    id: 'GNY6TSN0u5RSadLscJjDd',
    name: 'Franklin',
  },
  {
    id: 'TtR_nNEJCroj80fSOiec5',
    name: 'Kane',
  },
];

const app = (mockAccounts: Account[], mockUsers: User[]) =>
  makeApp({
    repo: makeRepo({
      db: {
        Accounts: mockAccounts,
        Users: mockUsers,
      },
    }),
  });

describe('deposit fund to account', function () {
  test('should deposit funds successfully', function (done) {
    request(app(mockAccounts, mockUsers))
      .post('/accounts/deposit')
      .send({ amount: 5000, userId: 'GNY6TSN0u5RSadLscJjDd', currency: 'usd' })
      .expect(201)
      .then(function (res) {
        expect(res.body.data.subwallets.usd).toBe(10000);
        done();
      })
      .catch(done);
  });
  test('throw error if user account not found', function (done) {
    request(app(mockAccounts, mockUsers))
      .post('/accounts/deposit')
      .send({ amount: 5000, userId: 'GNY6TSN0u5RSadLsDd', currency: 'ngn' })
      .expect(404)
      .then(function (res) {
        expect(res.body.msg).toBe('User not found');
        done();
      })
      .catch(done);
  });
});
