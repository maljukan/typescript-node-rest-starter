import * as request from 'supertest';
import * as app from '../src/app';
import { default as UserService } from '../src/services/user.srvc';
import { User } from '../src/models/user';

let JWT: String;

afterAll((done) => {
  UserService.deleteOne('testerchester')
    .then(done);
});

describe('GET /random-url', () => {
  it('should return 401', (done) => {
    request(app).get('/reset')
      .expect(401, done);
  });
});

describe('/auth', () => {
  let user: User;
  const userForm = {
    email: 'tester@chester.com',
    password: 'PASSWORD',
    lname: 'Tester',
    fname: 'Chester',
    role: 'guest',
    username: 'testerchester'
  };

  describe('POST /register', () => {
    const route: string = '/auth/register';

    it('should return 200', (done) => {
      request(app).post(route)
        .send(userForm)
        .then(res => {
          user = res.body;
          expect(res.status).toEqual(200);
          done();
        });
    });

    it('should return 409', (done) => {
      request(app).post(route)
        .send(userForm).expect(409, done);
    });
  });

  describe('GET /activate/:activationToken', () => {
    const route: String = '/auth/activate';
    const BAD_TOKEN: String = '123456789';

    it('should return 400', (done) => {
      request(app).get(`${route}/${BAD_TOKEN}`)
        .expect(400, done);
    });

    it('should return 200', (done) => {
      request(app).get(`${route}/${user.activationToken}`)
        .then(res => {
          JWT = res.body.token;
          expect(res.status).toEqual(200);
          done();
        });
    });
  });

  describe('POST /login', () => {
    const route: string = '/auth/login';

    it ('should return 401, missing password', (done) => {
      request(app).post(route).send({email: 'some@email.com'})
        .expect(401, done);
    });

    it('should return 401, missing email', (done) => {
      request(app).post(route).send({password: 'somepassword'})
        .expect(401, done);
    });

    it('should return 404', (done) => {
      request(app).post(route).send({email: 'none@nowhere.com', password: 'PASSWORD'})
        .expect(404, done);
    });

    it('should return 200', (done) => {
      request(app).post('/auth/login').send({email: 'tester@chester.com', password: 'PASSWORD'})
        .expect(200, done);
    });
  });
});

describe('GET /users', () => {
  const route: string = '/users';

  it('should return 401', (done) => {
    request(app).get(route)
      .expect(401, done());
  });

  it('should return 200', (done) => {
    request(app).get(route)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200, done);
  });
});
