import faker from 'faker';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '../../src/app';
import Device from '../../src/models/device.model';
import SocketId from '../../src/models/socketId.model';
import SubDevice from '../../src/models/subDevice.model';
import SubDeviceParam from '../../src/models/subDeviceParam.model';
import User from '../../src/models/user.model';
import { deviceThree, deviceTwo, insertDevices } from '../fixtures/device.fixture';
import { insertSocketIds, socketIdFive, socketIdFour, socketIdOne, socketIdSix } from '../fixtures/socketId.fixture';
import { insertSubDevices, subDeviceFour, subDeviceThree } from '../fixtures/subDevice.fixture';
import { insertSubDeviceParams, subDeviceParamFive, subDeviceParamFour } from '../fixtures/subDeviceParam.fixture';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import { admin, insertUsers, userOne, userTwo } from '../fixtures/user.fixture';
import { setupTestDB } from '../utils/setupTestDB';

setupTestDB();

describe('User routes', () => {
  describe('POST /v1/users', () => {
    let newUser;

    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
      };
    });

    it('should return 201 and successfully create new user if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({ id: expect.anything(), name: newUser.name, email: newUser.email, role: newUser.role });

      const dbUser = await User.findById(res.body.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({ name: newUser.name, email: newUser.email, role: newUser.role });
    });

    it('should be able to create an admin as well', async () => {
      await insertUsers([admin]);
      newUser.role = 'admin';

      const res = await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body.role).toBe('admin');

      const dbUser = await User.findById(res.body.id);
      expect(dbUser.role).toBe('admin');
    });

    it('should return 401 error is access token is missing', async () => {
      await request(app)
        .post('/v1/users')
        .send(newUser)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if logged in user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 400 error if email is invalid', async () => {
      await insertUsers([admin]);
      newUser.email = 'invalidEmail';

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if email is already used', async () => {
      await insertUsers([admin, userOne]);
      newUser.email = userOne.email;

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if password length is less than 8 characters', async () => {
      await insertUsers([admin]);
      newUser.password = 'passwo1';

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if password does not contain both letters and numbers', async () => {
      await insertUsers([admin]);
      newUser.password = 'password';

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);

      newUser.password = '1111111';

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if role is neither user nor admin', async () => {
      await insertUsers([admin]);
      newUser.role = 'invalid';

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/users', () => {
    it('should return 200 and all users', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toEqual({
        id: userOne._id.toHexString(),
        name: userOne.name,
        email: userOne.email,
        role: userOne.role,
      });
    });

    it('should return 401 if access token is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);

      await request(app)
        .get('/v1/users')
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if a non-admin is trying to access all users', async () => {
      await insertUsers([userOne, userTwo, admin]);

      await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should correctly apply filter on name field', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ name: userOne.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(userOne._id.toHexString());
    });

    it('should correctly apply filter on role field', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ role: 'user' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe(userOne._id.toHexString());
      expect(res.body[1].id).toBe(userTwo._id.toHexString());
    });

    it('should correctly sort returned array if descending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe(userOne._id.toHexString());
    });

    it('should correctly sort returned array if ascending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe(admin._id.toHexString());
    });

    it('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
    });

    it('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(admin._id.toHexString());
    });
  });

  describe('GET /v1/users/:userId', () => {
    it('should return 200 and the user object if data is ok', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: userOne._id.toHexString(),
        email: userOne.email,
        name: userOne.name,
        role: userOne.role,
      });
    });

    it('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app)
        .get(`/v1/users/${userOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if user is trying to get another user', async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .get(`/v1/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 200 and the user object if admin is trying to get another user', async () => {
      await insertUsers([userOne, admin]);

      await request(app)
        .get(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    it('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/v1/users/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 error if user is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/users/:userId', () => {
    it('should return 204 if data is ok', async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeNull();
    });

    it('should return 204 and delete user, all devices, all sub-devices, all sub-device-params and all socket ids of user', async () => {
      await insertUsers([userOne]);
      await insertDevices([deviceTwo, deviceThree]);
      await insertSubDevices([subDeviceThree, subDeviceFour]);
      await insertSubDeviceParams([subDeviceParamFour, subDeviceParamFive]);
      await insertSocketIds([socketIdOne, socketIdFour, socketIdFive, socketIdSix]);
      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeNull();
      const dbDeviceOne = await Device.findById(deviceTwo._id);
      expect(dbDeviceOne).toBeNull();
      const dbDeviceTwo = await Device.findById(deviceThree._id);
      expect(dbDeviceTwo).toBeNull();
      const dbSubDeviceOne = await SubDevice.findById(subDeviceThree._id);
      expect(dbSubDeviceOne).toBeNull();
      const dbSubDeviceTwo = await SubDevice.findById(subDeviceFour._id);
      expect(dbSubDeviceTwo).toBeNull();
      const dbSubDeviceParamOne = await SubDeviceParam.findById(subDeviceParamFour._id);
      expect(dbSubDeviceParamOne).toBeNull();
      const dbSubDeviceParamTwo = await SubDeviceParam.findById(subDeviceParamFive._id);
      expect(dbSubDeviceParamTwo).toBeNull();
      const dbSocketIdOne = await SocketId.findById(socketIdFour._id);
      expect(dbSocketIdOne).toBeNull();
      const dbSocketIdTwo = await SocketId.findById(socketIdFive._id);
      expect(dbSocketIdTwo).toBeNull();
      const dbSocketIdThree = await SocketId.findById(socketIdSix._id);
      expect(dbSocketIdThree).toBeNull();
      const dbSocketFour = await SocketId.findById(socketIdOne._id);
      expect(dbSocketFour).not.toBeNull();
    });

    it('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if user is trying to delete another user', async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .delete(`/v1/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 204 if admin is trying to delete another user', async () => {
      await insertUsers([userOne, admin]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    it('should return 204 admin is trying to delete another user and delete user, all devices, all sub-devices, all sub-device-params and all socket ids of user', async () => {
      await insertUsers([userOne, admin]);
      await insertDevices([deviceTwo, deviceThree]);
      await insertSubDevices([subDeviceThree, subDeviceFour]);
      await insertSubDeviceParams([subDeviceParamFour, subDeviceParamFive]);
      await insertSocketIds([socketIdOne, socketIdFour, socketIdFive, socketIdSix]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeNull();
      const dbDeviceOne = await Device.findById(deviceTwo._id);
      expect(dbDeviceOne).toBeNull();
      const dbDeviceTwo = await Device.findById(deviceThree._id);
      expect(dbDeviceTwo).toBeNull();
      const dbSubDeviceOne = await SubDevice.findById(subDeviceThree._id);
      expect(dbSubDeviceOne).toBeNull();
      const dbSubDeviceTwo = await SubDevice.findById(subDeviceFour._id);
      expect(dbSubDeviceTwo).toBeNull();
      const dbSubDeviceParamOne = await SubDeviceParam.findById(subDeviceParamFour._id);
      expect(dbSubDeviceParamOne).toBeNull();
      const dbSubDeviceParamTwo = await SubDeviceParam.findById(subDeviceParamFive._id);
      expect(dbSubDeviceParamTwo).toBeNull();
      const dbSocketIdOne = await SocketId.findById(socketIdFour._id);
      expect(dbSocketIdOne).toBeNull();
      const dbSocketIdTwo = await SocketId.findById(socketIdFive._id);
      expect(dbSocketIdTwo).toBeNull();
      const dbSocketIdThree = await SocketId.findById(socketIdSix._id);
      expect(dbSocketIdThree).toBeNull();
      const dbSocketFour = await SocketId.findById(socketIdOne._id);
      expect(dbSocketFour).not.toBeNull();
    });

    it('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/v1/users/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 error if user already is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/users/:userId', () => {
    it('should return 200 and successfully update user if data is ok', async () => {
      await insertUsers([userOne]);
      const updateBody = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'newPassword1',
      };

      const res = await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: userOne._id.toHexString(),
        name: updateBody.name,
        email: updateBody.email,
        role: 'user',
      });

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(updateBody.password);
      expect(dbUser).toMatchObject({ name: updateBody.name, email: updateBody.email, role: 'user' });
    });

    it('should return 200 and successfully update user, all devices, all sub-devices, all sub-device-params and all socketIds of user', async () => {
      const updateBody = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'newPassword1',
      };

      await insertUsers([userOne]);
      await insertDevices([deviceTwo, deviceThree]);
      await insertSubDevices([subDeviceThree, subDeviceFour]);
      await insertSubDeviceParams([subDeviceParamFour, subDeviceParamFive]);
      await insertSocketIds([socketIdOne, socketIdFour, socketIdFive, socketIdSix]);

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(updateBody.password);
      expect(dbUser).toMatchObject({ name: updateBody.name, email: updateBody.email, role: 'user' });

      const dbDeviceOne = await Device.findById(deviceTwo._id);
      expect(dbDeviceOne).toBeDefined();
      expect(dbDeviceOne.createdBy).toBe(updateBody.email);
      expect(dbDeviceOne.updatedBy).toBe(updateBody.email);
      expect(dbDeviceOne.deviceOwner).toBe(updateBody.email);

      const dbDeviceTwo = await Device.findById(deviceThree._id);
      expect(dbDeviceTwo).toBeDefined();
      expect(dbDeviceTwo.createdBy).toBe(updateBody.email);
      expect(dbDeviceTwo.updatedBy).toBe(updateBody.email);
      expect(dbDeviceTwo.deviceOwner).toBe(updateBody.email);

      const dbSubDeviceOne = await SubDevice.findById(subDeviceThree._id);
      expect(dbSubDeviceOne).toBeDefined();
      expect(dbSubDeviceOne.createdBy).toBe(updateBody.email);
      expect(dbSubDeviceOne.updatedBy).toBe(updateBody.email);

      const dbSubDeviceTwo = await SubDevice.findById(subDeviceFour._id);
      expect(dbSubDeviceTwo).toBeDefined();
      expect(dbSubDeviceTwo.createdBy).toBe(updateBody.email);
      expect(dbSubDeviceTwo.updatedBy).toBe(updateBody.email);

      const dbSubDeviceParamOne = await SubDeviceParam.findById(subDeviceParamFour._id);
      expect(dbSubDeviceParamOne).toBeDefined();
      expect(dbSubDeviceParamOne.createdBy).toBe(updateBody.email);
      expect(dbSubDeviceParamOne.updatedBy).toBe(updateBody.email);

      const dbSubDeviceParamTwo = await SubDeviceParam.findById(subDeviceParamFive._id);
      expect(dbSubDeviceParamTwo).toBeDefined();
      expect(dbSubDeviceParamTwo.createdBy).toBe(updateBody.email);
      expect(dbSubDeviceParamTwo.updatedBy).toBe(updateBody.email);

      const dbSocketIdOne = await SocketId.findById(socketIdFour._id);
      expect(dbSocketIdOne).toBeDefined();
      expect(dbSocketIdOne.bindedTo).toBe(updateBody.email);

      const dbSocketIdTwo = await SocketId.findById(socketIdFive._id);
      expect(dbSocketIdTwo).toBeDefined();
      expect(dbSocketIdTwo.bindedTo).toBe(updateBody.email);
    });

    it('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if user is updating another user', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 200 and successfully update user if admin is updating another user', async () => {
      await insertUsers([userOne, admin]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    it('should return 200 and successfully update user, all devices, all sub-devices, all sub-device-params and all socketIds of user if admin is updating another user', async () => {
      const updateBody = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'newPassword1',
      };

      await insertUsers([userOne, admin]);
      await insertDevices([deviceTwo, deviceThree]);
      await insertSubDevices([subDeviceThree, subDeviceFour]);
      await insertSubDeviceParams([subDeviceParamFour, subDeviceParamFive]);
      await insertSocketIds([socketIdOne, socketIdFour, socketIdFive, socketIdSix]);

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(updateBody.password);
      expect(dbUser).toMatchObject({ name: updateBody.name, email: updateBody.email, role: 'user' });

      const dbDeviceOne = await Device.findById(deviceTwo._id);
      expect(dbDeviceOne).toBeDefined();
      expect(dbDeviceOne.createdBy).toBe(updateBody.email);
      expect(dbDeviceOne.updatedBy).toBe(updateBody.email);
      expect(dbDeviceOne.deviceOwner).toBe(updateBody.email);

      const dbDeviceTwo = await Device.findById(deviceThree._id);
      expect(dbDeviceTwo).toBeDefined();
      expect(dbDeviceTwo.createdBy).toBe(updateBody.email);
      expect(dbDeviceTwo.updatedBy).toBe(updateBody.email);
      expect(dbDeviceTwo.deviceOwner).toBe(updateBody.email);

      const dbSubDeviceOne = await SubDevice.findById(subDeviceThree._id);
      expect(dbSubDeviceOne).toBeDefined();
      expect(dbSubDeviceOne.createdBy).toBe(updateBody.email);
      expect(dbSubDeviceOne.updatedBy).toBe(updateBody.email);

      const dbSubDeviceTwo = await SubDevice.findById(subDeviceFour._id);
      expect(dbSubDeviceTwo).toBeDefined();
      expect(dbSubDeviceTwo.createdBy).toBe(updateBody.email);
      expect(dbSubDeviceTwo.updatedBy).toBe(updateBody.email);

      const dbSubDeviceParamOne = await SubDeviceParam.findById(subDeviceParamFour._id);
      expect(dbSubDeviceParamOne).toBeDefined();
      expect(dbSubDeviceParamOne.createdBy).toBe(updateBody.email);
      expect(dbSubDeviceParamOne.updatedBy).toBe(updateBody.email);

      const dbSubDeviceParamTwo = await SubDeviceParam.findById(subDeviceParamFive._id);
      expect(dbSubDeviceParamTwo).toBeDefined();
      expect(dbSubDeviceParamTwo.createdBy).toBe(updateBody.email);
      expect(dbSubDeviceParamTwo.updatedBy).toBe(updateBody.email);

      const dbSocketIdOne = await SocketId.findById(socketIdFour._id);
      expect(dbSocketIdOne).toBeDefined();
      expect(dbSocketIdOne.bindedTo).toBe(updateBody.email);

      const dbSocketIdTwo = await SocketId.findById(socketIdFive._id);
      expect(dbSocketIdTwo).toBeDefined();
      expect(dbSocketIdTwo.bindedTo).toBe(updateBody.email);
    });

    it('should return 404 if admin is updating another user that is not found', async () => {
      await insertUsers([admin]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/users/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if email is invalid', async () => {
      await insertUsers([userOne]);
      const updateBody = { email: 'invalidEmail' };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if email is already taken', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { email: userTwo.email };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should not return 400 if email is my email', async () => {
      await insertUsers([userOne]);
      const updateBody = { email: userOne.email };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    it('should return 400 if password length is less than 8 characters', async () => {
      await insertUsers([userOne]);
      const updateBody = { password: 'passwo1' };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if password does not contain both letters and numbers', async () => {
      await insertUsers([userOne]);
      const updateBody = { password: 'password' };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody.password = '11111111';

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
