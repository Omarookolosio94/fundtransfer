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
  },
  {
    id: '02o_H_EQOe093NQmmjVYS',
    balance: 20000,
    userId: 'TtR_nNEJCroj80fSOiec5',
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

const app = (mockAccounts : Account[], mockUsers: User[]) => makeApp({
  repo: makeRepo({
    db: {
      Accounts: mockAccounts,
      Users: mockUsers
    },
  }),
});

describe('deposit fund to account', function () {
  test('should deposit funds successfully', function (done) {
    request(app(mockAccounts, mockUsers))
      .post('/accounts/deposit')
      .send({amount: 5000, userId: "GNY6TSN0u5RSadLscJjDd"})
      .expect(201)
      .then(function (res) {
        expect(res.body.data.balance).toBe(10000);
        done();
      })
      .catch(done);
  });
  test('throw error if user account not found', function (done) {
    request(app(mockAccounts, mockUsers))
      .post('/accounts/deposit')
      .send({amount: 5000, userId: "GNY6TSN0u5RSadLsDd" })
      .expect(404)
      .then(function (res) {
        expect(res.body.msg).toBe("User not found");
        done();
      })
      .catch(done);
  });
});
