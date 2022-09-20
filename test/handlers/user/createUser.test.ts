import { send } from 'process';
import request from 'supertest';
import { makeApp } from '../../../src/app';
import makeRepo from '../../../src/repo';
import { Account } from '../../../src/schemas/models/Account';
import { User } from '../../../src/schemas/models/User';

const mockAccounts = [
  {
    id: 'F8n-xMpAB2GpYD4u9u6Z9',
    balance: 5000,
    userId: 'GNY6TSN0u5RSadLscJjDd',
    subwallets: {
      "usd": 0,
      "ngn": 0,
      "gdp": 0,
      "yuan": 0,
    },
  },
  {
    id: '02o_H_EQOe093NQmmjVYS',
    balance: 20000,
    userId: 'TtR_nNEJCroj80fSOiec5',
    subwallets: {
      "usd": 0,
      "ngn": 0,
      "gdp": 0,
      "yuan": 0,
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

describe('create new user account', function () {
  test('should return newly user successfully', function (done) {
    request(app(mockAccounts, mockUsers))
      .post('/users')
      .send({ name: 'Fred' })
      .expect(200)
      .then(function (res) {
        expect(res.body.data.name).toBe('Fred');
        expect(mockAccounts.length).toBe(3);
        expect(mockUsers.length).toBe(3);
        done();
      })
      .catch(done);
  });
});
