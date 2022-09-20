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
      usd: 0,
      ngn: 5000,
      gdp: 0,
      yuan: 0,
    },
  },
  {
    id: '02o_H_EQOe093NQmmjVYS',
    balance: 0,
    userId: 'TtR_nNEJCroj80fSOiec5',
    subwallets: {
      usd: 0,
      ngn: 20000,
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

describe('transfer funds to accounts', function () {
  test('should transfer funds successfully', function (done) {
    request(app(mockAccounts, mockUsers))
      .post('/accounts/transfer')
      .send({
        amount: 5000,
        userId: 'TtR_nNEJCroj80fSOiec5',
        recepientAccountId: 'F8n-xMpAB2GpYD4u9u6Z9',
        currency: 'ngn',
      })
      .expect(201)
      .then(function (res) {
        expect(res.body.data.subwallets.ngn).toBe(15000);
        expect(mockAccounts[0].subwallets.ngn).toBe(10000);
        done();
      })
      .catch(done);
  });
  test('throw error if balance is insufficient', function (done) {
    request(app(mockAccounts, mockUsers))
      .post('/accounts/transfer')
      .send({
        amount: 500000,
        userId: 'TtR_nNEJCroj80fSOiec5',
        recepientAccountId: 'F8n-xMpAB2GpYD4u9u6Z9',
        currency: 'ngn',
      })
      .expect(400)
      .then(function (res) {
        expect(res.body.msg).toBe('Insufficient balance');
        done();
      })
      .catch(done);
  });
  test('throw error if sender account not found', function (done) {
    request(app(mockAccounts, mockUsers))
      .post('/accounts/transfer')
      .send({
        amount: 5000,
        userId: 'sasanNEJCroj80fSOiec',
        recepientAccountId: 'F8n-xMpAB2GpYD4u9u6Z9',
        currency: 'ngn',
      })
      .expect(404)
      .then(function (res) {
        expect(res.body.msg).toBe('Sender account not found');
        done();
      })
      .catch(done);
  });
  test('throw error if receipent account not found', function (done) {
    request(app(mockAccounts, mockUsers))
      .post('/accounts/transfer')
      .send({
        amount: 5000,
        userId: 'TtR_nNEJCroj80fSOiec5',
        recepientAccountId: 'MpAB2GpYD4u9u6Z',
        currency: 'ngn',
      })
      .expect(404)
      .then(function (res) {
        expect(res.body.msg).toBe('Receipent account not found');
        done();
      })
      .catch(done);
  });
});
