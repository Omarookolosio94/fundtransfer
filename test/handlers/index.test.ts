import request from 'supertest';
import { makeApp } from '../../src/app';

// @ts-ignore
const app = makeApp({repo: { user: {}, account: {} } });

describe('index', function () {
  test('App is working', function (done) {
    request(app)
      .get('/')
      .expect(200)
      .then(function (res) {
        expect(res.body.msg).toBe('Welcome to waficode');
        done();
      })
      .catch(done);
    /*
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.msg).toBe('Welcome to waficodew');
        done();
      });*/
  });
});
