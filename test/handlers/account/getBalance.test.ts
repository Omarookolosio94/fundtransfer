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
];
const mockUsers = [
  {
    id: 'GNY6TSN0u5RSadLscJjDd',
    name: 'Franklin',
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

describe('get balance of account', function () {
  test('should get Balance successfully', function (done) {
    request(app(mockAccounts, mockUsers))
      .get('/accounts/balance/GNY6TSN0u5RSadLscJjDd')
      .expect(200)
      .then(function (res) {
        expect(res.body.data.balance).toBe(5000);
        done();
      })
      .catch(done);
  });
  test('should throw error if user not found', function (done) {
    request(app(mockAccounts, mockUsers))
      .get('/accounts/balance/GNY6TSN0u5RSadLscJ')
      .expect(404)
      .then(function (res) {
        expect(res.body.msg).toBe('User account not found');
        done();
      })
      .catch(done);
  });
});
