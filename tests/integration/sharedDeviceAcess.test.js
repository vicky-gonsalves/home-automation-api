import faker from 'faker';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '../../src/app';
import SharedDeviceAccess from '../../src/models/sharedDeviceAccess.model';
import { deviceOne, deviceTwo, insertDevices } from '../fixtures/device.fixture';
import { accessOne, accessThree, accessTwo, insertSharedDeviceAccess } from '../fixtures/sharedDeviceAccess.fixture';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import { admin, insertUsers, userOne, userTwo } from '../fixtures/user.fixture';
import { setupTestDB } from '../utils/setupTestDB';
import { insertSocketIds, socketIdFive, socketIdFour } from '../fixtures/socketId.fixture';
import NotificationService from '../../src/services/notification.service';

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

    it('should return 201 and be able to create if data is ok', async () => {
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

    it('should return 201 and successfully create new shared-device-access if data is ok and send notification to users', async () => {
      await insertSocketIds([socketIdFour, socketIdFive]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.CREATED);
      expect(spy).toBeCalled();
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

    it('should return 400 error if deviceId length is less than 10 characters', async () => {
      newAccess.deviceId = faker.random.alphaNumeric(9);

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

    it('should return 400 if deviceId and email is already exists', async () => {
      await insertUsers([userTwo]);
      await insertDevices([deviceTwo]);
      await insertSharedDeviceAccess([accessOne]);

      newAccess.deviceId = accessOne.deviceId;
      newAccess.email = accessOne.email;
      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if deviceOwner is trying to add himself in shared device access', async () => {
      newAccess.deviceId = deviceOne.deviceId;
      newAccess.email = deviceOne.deviceOwner;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAccess)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/shared-device-access', () => {
    const route = '/v1/shared-device-access';
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSharedDeviceAccess([accessOne, accessTwo]);
    });

    it('should return 200 and all shared device access', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('createdAt');
      expect(res.body[0]).toHaveProperty('updatedAt');
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('deviceId');
      expect(res.body[0]).toHaveProperty('isDisabled');
      expect(res.body[0]).toHaveProperty('email');
      expect(res.body[0]).toHaveProperty('sharedBy');
    });

    it('should return 401 if access token is missing', async () => {
      await request(app)
        .get(route)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if a non-admin is trying to access all shared device access', async () => {
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should correctly apply filter on deviceId field', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ deviceId: deviceOne.deviceId })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[1].id).toBeDefined();
    });

    it('should correctly apply filter on email field', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ email: accessOne.email })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBeDefined();
    });

    it('should correctly apply filter on isDisabled field', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ isDisabled: false })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[1].id).toBeDefined();
    });

    it('should correctly sort returned array if descending sort param is specified', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'deviceId:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[1].id).toBeDefined();
    });

    it('should correctly sort returned array if ascending sort param is specified', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'deviceId:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[1].id).toBeDefined();
    });

    it('should limit returned array if limit param is specified', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBeDefined();
    });

    it('should return the correct page if page and limit params are specified', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBeDefined();
    });
  });

  describe('GET /v1/shared-device-access/:id', () => {
    const route = '/v1/shared-device-access';
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSharedDeviceAccess([accessOne, accessTwo]);
    });

    it('should return 200 and the device object if data is ok', async () => {
      const res = await request(app)
        .get(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
      expect(res.body).toMatchObject({
        id: accessOne._id.toString(),
        deviceId: accessOne.deviceId,
        email: accessOne.email,
        sharedBy: accessOne.sharedBy,
        isDisabled: false,
      });
    });

    it('should return 401 error if access token is missing', async () => {
      await request(app)
        .get(`${route}/${accessOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if user is trying to get shared device access', async () => {
      await request(app)
        .get(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 200 and the shared device access object if admin is trying to get device', async () => {
      await request(app)
        .get(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    it('should return 400 error if id is not valid', async () => {
      await request(app)
        .get(`${route}/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 error if id is not found', async () => {
      await request(app)
        .get(`${route}/${accessThree._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
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

    it('should return 204 and successfully delete shared-device-access if data is ok and send notification to users', async () => {
      await insertSocketIds([socketIdFour, socketIdFive]);
      await insertSharedDeviceAccess([accessOne]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      await request(app)
        .delete(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
      expect(spy).toBeCalled();
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

  describe('PATCH /v1/shared-device-access/:id', () => {
    let updateBody;
    const route = '/v1/shared-device-access';
    beforeEach(async () => {
      const email = faker.internet.email().toLowerCase();
      updateBody = {
        deviceId: faker.random.alphaNumeric(10),
        email,
        isDisabled: true,
      };
      await insertUsers([admin, userOne, userTwo]);
      await insertDevices([deviceOne]);
      await insertSharedDeviceAccess([accessOne, accessTwo]);
    });

    it('should return 200 and successfully update shared device access if data is ok', async () => {
      const res = await request(app)
        .patch(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('sharedBy');
      expect(res.body).toMatchObject({
        deviceId: updateBody.deviceId,
        email: updateBody.email,
        sharedBy: accessOne.sharedBy,
        isDisabled: true,
      });

      const dbAccess = await SharedDeviceAccess.findOne({ deviceId: updateBody.deviceId });
      expect(dbAccess).toBeDefined();
      expect(dbAccess).toMatchObject({
        deviceId: updateBody.deviceId,
        email: updateBody.email,
        sharedBy: accessOne.sharedBy,
        isDisabled: true,
      });
    });

    it('should return 401 error if access token is missing', async () => {
      await request(app)
        .patch(`${route}/${accessOne._id}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if user is updating shared device access', async () => {
      await request(app)
        .patch(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 200 and successfully update device if admin is updating shared device access', async () => {
      await request(app)
        .patch(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    it('should return 404 if admin is updating shared device access that is not found', async () => {
      await request(app)
        .patch(`${route}/${accessThree._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 400 error if id is not valid', async () => {
      await request(app)
        .patch(`${route}/invalidid`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if deviceId is invalid', async () => {
      updateBody = { deviceId: 'invalid' };
      await request(app)
        .patch(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if deviceId and email is already exists', async () => {
      updateBody = { deviceId: accessTwo.deviceId, email: accessTwo.email };

      await request(app)
        .patch(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 200 if isDisabled is updated', async () => {
      updateBody = { isDisabled: true };

      const res = await request(app)
        .patch(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({ isDisabled: true });
    });

    it('should not return 400 if deviceId and email is my deviceId and email', async () => {
      updateBody = { deviceId: accessOne.deviceId, email: accessOne.email };

      await request(app)
        .patch(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    it('should return 400 if deviceId length is less than 10 characters', async () => {
      updateBody = { deviceId: faker.random.alphaNumeric(9) };

      await request(app)
        .patch(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceId length is greater than 20 characters', async () => {
      updateBody = { deviceId: faker.random.alphaNumeric(21) };

      await request(app)
        .patch(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceId is not string', async () => {
      updateBody = { deviceId: 31231 };

      await request(app)
        .patch(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody = { deviceId: {} };

      await request(app)
        .patch(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if email is invalid', async () => {
      updateBody = { email: 'invalid' };

      await request(app)
        .patch(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if deviceOwner is trying to add himself in shared device access', async () => {
      updateBody = { deviceId: deviceOne.deviceId, email: deviceOne.deviceOwner };

      await request(app)
        .patch(`${route}/${accessOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
