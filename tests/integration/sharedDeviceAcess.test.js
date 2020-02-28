import faker from 'faker';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '../../src/app';
import SharedDeviceAccess from '../../src/models/sharedDeviceAccess.model';
import { deviceOne, insertDevices } from '../fixtures/device.fixture';
import { accessOne, accessTwo, insertSharedDeviceAccess } from '../fixtures/sharedDeviceAccess.fixture';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import { admin, insertUsers, userOne } from '../fixtures/user.fixture';
import { setupTestDB } from '../utils/setupTestDB';

setupTestDB();

describe('Shared Device Access Routes', () => {
  describe('POST /v1/shared-device-access', () => {
    let newAccess;
    const route = '/v1/shared-device-access';
    const email1 = admin.email;
    beforeEach(async () => {
      const email2 = userOne.email;
      newAccess = {
        deviceId: deviceOne.deviceId,
        email: email2,
      };
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
    });

    it('should return 201 and be able to create  if data is ok', async () => {
      const res = await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        id: expect.anything(),
        isDisabled: false,
        sharedBy: email1,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        ...newAccess,
      });

      const dbSharedDeviceAccess = await SharedDeviceAccess.findById(res.body.id);
      expect(dbSharedDeviceAccess).toBeDefined();
      expect(dbSharedDeviceAccess.isDisabled).toBe(false);
      expect(dbSharedDeviceAccess).toMatchObject({
        deviceId: newAccess.deviceId,
        email: newAccess.email,
        sharedBy: email1,
        isDisabled: false,
      });
    });

    it('should return 401 error if access token is missing', async () => {
      await request(app)
        .post(route)
        .send(newAccess)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if logged in user is not admin', async () => {
      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 400 error if deviceId is invalid', async () => {
      newAccess.deviceId = 'invalid device id';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if user already has aceess to device', async () => {
      await insertSharedDeviceAccess([accessOne]);
      newAccess.deviceId = accessOne.deviceId;
      newAccess.email = accessOne.email;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceId length is less than 16 characters', async () => {
      newAccess.deviceId = faker.random.alphaNumeric(14);

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceId length is greater than 20 characters', async () => {
      newAccess.deviceId = faker.random.alphaNumeric(21);

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceId is not string', async () => {
      newAccess.deviceId = 31231;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.BAD_REQUEST);

      newAccess.deviceId = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceId is missing', async () => {
      delete newAccess.deviceId;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if email is invalid', async () => {
      newAccess.email = 'invalidemail';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if email is not a string', async () => {
      newAccess.email = 3123123;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.BAD_REQUEST);

      newAccess.email = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if email is missing', async () => {
      delete newAccess.email;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /v1/shared-device-access/:id', () => {
    const route = '/v1/shared-device-access';
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
    });

    it('should return 204 if data is ok', async () => {
      await insertSharedDeviceAccess([accessOne]);
      await request(app)
        .delete(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbAccess = await SharedDeviceAccess.findById(accessOne._id);
      expect(dbAccess).toBeNull();
    });

    it('should return 401 error if access token is missing', async () => {
      await request(app)
        .delete(`${route}/${accessOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if user is trying to delete access', async () => {
      await request(app)
        .delete(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 204 if admin is trying to delete access', async () => {
      await insertSharedDeviceAccess([accessTwo]);
      await request(app)
        .delete(`${route}/${accessTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    it('should return 400 error if id is not valid', async () => {
      await request(app)
        .delete(`${route}/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 error if access id is not found', async () => {
      await request(app)
        .delete(`${route}/${accessTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
