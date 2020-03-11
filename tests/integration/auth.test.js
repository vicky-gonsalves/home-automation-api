import request from 'supertest';
import faker from 'faker';
import httpStatus from 'http-status';
import httpMocks from 'node-mocks-http';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import app from '../../src/app';
import config from '../../src/config/config';
import auth from '../../src/middlewares/auth';
import { generateTokenService, saveTokenService } from '../../src/services/token.service';
import emailService, { transportService } from '../../src/services/email.service';
import AppError from '../../src/utils/AppError';
import { setupTestDB } from '../utils/setupTestDB';
import User from '../../src/models/user.model';
import Token from '../../src/models/token.model';
import { roleRights } from '../../src/config/roles';
import { admin, insertUsers, userOne } from '../fixtures/user.fixture';
import { adminAccessToken, userOneAccessToken, userTwoAccessToken } from '../fixtures/token.fixture';

setupTestDB();

describe('Auth routes', () => {
  describe('POST /v1/auth/register', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
      };
    });

    it('should return 201 and successfully register user if request data is ok', async () => {
      const res = await request(app)
        .post('/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).toEqual({ id: expect.anything(), name: newUser.name, email: newUser.email, role: 'user' });

      const dbUser = await User.findById(res.body.user.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({ name: newUser.name, email: newUser.email, role: 'user' });

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
    });

    it('should return 400 error if email is invalid', async () => {
      newUser.email = 'invalidEmail';

      await request(app)
        .post('/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if email is already used', async () => {
      await insertUsers([userOne]);
      newUser.email = userOne.email;

      await request(app)
        .post('/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if password length is less than 8 characters', async () => {
      newUser.password = 'passwo1';

      await request(app)
        .post('/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if password does not contain both letters and numbers', async () => {
      newUser.password = 'password';

      await request(app)
        .post('/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);

      newUser.password = '11111111';

      await request(app)
        .post('/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/login', () => {
    it('should return 200 and login user if email and password match', async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: userOne.password,
      };

      const res = await request(app)
        .post('/v1/auth/login')
        .send(loginCredentials)
        .expect(httpStatus.OK);

      expect(res.body.user).toEqual({
        id: expect.anything(),
        name: userOne.name,
        email: userOne.email,
        role: userOne.role,
      });

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
    });

    it('should return 401 error if there are no users with that email', async () => {
      const loginCredentials = {
        email: userOne.email,
        password: userOne.password,
      };

      const res = await request(app)
        .post('/v1/auth/login')
        .send(loginCredentials)
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({ code: httpStatus.UNAUTHORIZED, message: 'Incorrect email or password' });
    });

    it('should return 401 error if password is wrong', async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: 'wrongPassword1',
      };

      const res = await request(app)
        .post('/v1/auth/login')
        .send(loginCredentials)
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({ code: httpStatus.UNAUTHORIZED, message: 'Incorrect email or password' });
    });
  });

  describe('POST /v1/auth/refresh-tokens', () => {
    it('should return 200 and new auth tokens if refresh token is valid', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = generateTokenService(userOne._id, expires);
      await saveTokenService(refreshToken, userOne._id, expires, 'refresh');

      const res = await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });

      const dbRefreshTokenDoc = await Token.findOne({ token: res.body.refresh.token });
      expect(dbRefreshTokenDoc).toMatchObject({ type: 'refresh', user: userOne._id, blacklisted: false });

      const dbRefreshTokenCount = await Token.countDocuments();
      expect(dbRefreshTokenCount).toBe(1);
    });

    it('should return 400 error if refresh token is missing from request body', async () => {
      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 401 error if refresh token is signed using an invalid secret', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = generateTokenService(userOne._id, expires, 'invalidSecret');
      await saveTokenService(refreshToken, userOne._id, expires, 'refresh');

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 401 error if refresh token is not found in the database', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = generateTokenService(userOne._id, expires);

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 401 error if refresh token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = generateTokenService(userOne._id, expires);
      await saveTokenService(refreshToken, userOne._id, expires, 'refresh', true);

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 401 error if refresh token is expired', async () => {
      await insertUsers([userOne]);
      const expires = moment().subtract(1, 'minutes');
      const refreshToken = generateTokenService(userOne._id, expires);
      await saveTokenService(refreshToken, userOne._id, expires, 'refresh');

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 401 error if user is not found', async () => {
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = generateTokenService(userOne._id, expires);
      await saveTokenService(refreshToken, userOne._id, expires, 'refresh');

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/auth/forgot-password', () => {
    beforeEach(() => {
      jest.spyOn(transportService, 'sendMail').mockResolvedValue();
    });

    it('should return 204 and send reset password email to the user', async () => {
      await insertUsers([userOne]);
      const sendResetPasswordEmailServiceSpy = jest.spyOn(emailService, 'sendResetPasswordEmailService');

      await request(app)
        .post('/v1/auth/forgot-password')
        .send({ email: userOne.email })
        .expect(httpStatus.NO_CONTENT);

      expect(sendResetPasswordEmailServiceSpy).toHaveBeenCalledWith(userOne.email, expect.any(String));
      const resetPasswordToken = sendResetPasswordEmailServiceSpy.mock.calls[0][1];
      const dbResetPasswordTokenDoc = await Token.findOne({ token: resetPasswordToken, user: userOne._id });
      expect(dbResetPasswordTokenDoc).toBeDefined();
    });

    it('should return 400 if email is missing', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/auth/forgot-password')
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 if email does not belong to any user', async () => {
      await request(app)
        .post('/v1/auth/forgot-password')
        .send({ email: userOne.email })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /v1/auth/reset-password', () => {
    it('should return 204 and reset the password', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = generateTokenService(userOne._id, expires);
      await saveTokenService(resetPasswordToken, userOne._id, expires, 'resetPassword');

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      const isPasswordMatch = await bcrypt.compare('password2', dbUser.password);
      expect(isPasswordMatch).toBe(true);

      const dbResetPasswordTokenCount = await Token.countDocuments({ user: userOne._id, type: 'resetPassword' });
      expect(dbResetPasswordTokenCount).toBe(0);
    });

    it('should return 400 if reset password token is missing', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/auth/reset-password')
        .send({ password: 'password2' })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 401 if reset password token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = generateTokenService(userOne._id, expires);
      await saveTokenService(resetPasswordToken, userOne._id, expires, 'resetPassword', true);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 401 if reset password token is expired', async () => {
      await insertUsers([userOne]);
      const expires = moment().subtract(1, 'minutes');
      const resetPasswordToken = generateTokenService(userOne._id, expires);
      await saveTokenService(resetPasswordToken, userOne._id, expires, 'resetPassword');

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 401 if user is not found', async () => {
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = generateTokenService(userOne._id, expires);
      await saveTokenService(resetPasswordToken, userOne._id, expires, 'resetPassword');

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 400 if password is missing or invalid', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = generateTokenService(userOne._id, expires);
      await saveTokenService(resetPasswordToken, userOne._id, expires, 'resetPassword');

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'short1' })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password' })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: '11111111' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/auth/me', () => {
    const route = `/v1/auth/me`;
    beforeEach(() => {
      insertUsers([admin, userOne]);
    });

    it('should return 200 and successfully get data of me for admin role', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toEqual({ id: expect.anything(), name: admin.name, email: admin.email, role: admin.role });
    });

    it('should return 200 and successfully get data of me for user role', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toEqual({ id: expect.anything(), name: userOne.name, email: userOne.email, role: userOne.role });
    });

    it('should return 401 error if access token is invalid', async () => {
      await request(app)
        .get(route)
        .set('Authorization', `Bearer invalid`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 401 error if user does not exists', async () => {
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});

describe('Auth middleware', () => {
  it('should call next with no errors if access token is valid', async () => {
    await insertUsers([userOne]);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userOneAccessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user._id).toEqual(userOne._id);
  });

  it('should call next with unauthorized error if access token is not found in header', async () => {
    await insertUsers([userOne]);
    const req = httpMocks.createRequest();
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  it('should call next with unauthorized error if access token is not a valid jwt token', async () => {
    await insertUsers([userOne]);
    const req = httpMocks.createRequest({ headers: { Authorization: 'Bearer randomToken' } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  it('should call next with unauthorized error if access token is generated with an invalid secret', async () => {
    await insertUsers([userOne]);
    const tokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = generateTokenService(userOne._id, tokenExpires, 'invalidSecret');
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  it('should call next with unauthorized error if access token is expired', async () => {
    await insertUsers([userOne]);
    const tokenExpires = moment().subtract(1, 'minutes');
    const accessToken = generateTokenService(userOne._id, tokenExpires);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  it('should call next with unauthorized error if user is not found', async () => {
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userOneAccessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  it('should call next with forbidden error if user does not have required rights and userId is not in params', async () => {
    await insertUsers([userOne]);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userOneAccessToken}` } });
    const next = jest.fn();

    await auth('anyRight')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: httpStatus.FORBIDDEN,
        message: 'Forbidden',
      })
    );
  });

  it('should call next with no errors if user does not have required rights but userId is in params', async () => {
    await insertUsers([userOne]);
    const req = httpMocks.createRequest({
      headers: { Authorization: `Bearer ${userOneAccessToken}` },
      params: { userId: userOne._id.toHexString() },
    });
    const next = jest.fn();

    await auth('anyRight')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should call next with no errors if user has required rights', async () => {
    await insertUsers([admin]);
    const req = httpMocks.createRequest({
      headers: { Authorization: `Bearer ${adminAccessToken}` },
      params: { userId: userOne._id.toHexString() },
    });
    const next = jest.fn();

    await auth(...roleRights.get('admin'))(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });
});
