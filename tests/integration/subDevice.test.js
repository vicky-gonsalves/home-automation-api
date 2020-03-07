import faker from 'faker';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '../../src/app';
import { subDeviceType } from '../../src/config/device';
import SubDevice from '../../src/models/subDevice.model';
import SubDeviceParam from '../../src/models/subDeviceParam.model';
import { deviceOne, deviceTwo, insertDevices } from '../fixtures/device.fixture';
import { insertSubDevices, subDeviceFour, subDeviceOne, subDeviceThree, subDeviceTwo } from '../fixtures/subDevice.fixture';
import {
  insertSubDeviceParams,
  subDeviceParamFive,
  subDeviceParamFour,
  subDeviceParamOne,
  subDeviceParamThree,
} from '../fixtures/subDeviceParam.fixture';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import { admin, insertUsers, userOne } from '../fixtures/user.fixture';
import { setupTestDB } from '../utils/setupTestDB';
import { accessOne, insertSharedDeviceAccess } from '../fixtures/sharedDeviceAccess.fixture';
import { insertSocketIds, socketIdFour, socketIdTwo } from '../fixtures/socketId.fixture';
import NotificationService from '../../src/services/notification.service';

setupTestDB();

describe('Sub-Device Routes', () => {
  let route;
  describe('POST /v1/devices/:deviceId/sub-devices', () => {
    let subDevice;
    beforeEach(async () => {
      subDevice = {
        subDeviceId: faker.random.alphaNumeric(16),
        name: faker.name.firstName(),
        type: faker.random.arrayElement(subDeviceType),
      };
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices`;
    });

    it('should return 201 and successfully create new sub-device if data is ok', async () => {
      const res = await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('deviceId');
      expect(res.body).toMatchObject({
        id: expect.anything(),
        isDisabled: false,
        deviceId: deviceOne.deviceId,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        ...subDevice,
      });

      const dbSubDevice = await SubDevice.findById(res.body.id);
      expect(dbSubDevice).toBeDefined();
      expect(dbSubDevice.isDisabled).toBe(false);
      expect(dbSubDevice).toMatchObject({
        name: subDevice.name,
        deviceId: deviceOne.deviceId,
        subDeviceId: subDevice.subDeviceId,
        type: subDevice.type,
        isDisabled: false,
        createdBy: admin.email,
      });
    });

    it('should return 201 and successfully create new sub-device if data is ok and send notification to users', async () => {
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const _subDevice = {
        subDeviceId: subDeviceOne.subDeviceId,
        name: subDeviceOne.name,
        type: subDeviceOne.type,
      };
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_subDevice)
        .expect(httpStatus.CREATED);
      expect(spy).toBeCalled();
    });

    it('should return 401 error is access token is missing', async () => {
      await request(app)
        .post(route)
        .send(subDevice)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if logged in user is not admin', async () => {
      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 400 error if subDeviceId is invalid', async () => {
      subDevice.subDeviceId = 'invalid device id';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if subDeviceId is already used', async () => {
      await insertSubDevices([subDeviceOne]);
      subDevice.subDeviceId = subDeviceOne.subDeviceId;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if subDeviceId length is less than 16 characters', async () => {
      subDevice.subDeviceId = faker.random.alphaNumeric(14);

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if subDeviceId length is greater than 20 characters', async () => {
      subDevice.subDeviceId = faker.random.alphaNumeric(21);

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if subDeviceId is not string', async () => {
      subDevice.subDeviceId = 31231;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);

      subDevice.subDeviceId = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if subDeviceId is missing', async () => {
      delete subDevice.subDeviceId;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name is invalid', async () => {
      subDevice.name = 'invalid@name';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name is not string', async () => {
      subDevice.name = 1231;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);

      subDevice.name = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name is missing', async () => {
      delete subDevice.name;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name length is less than 1', async () => {
      subDevice.name = '';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name length is greater than 20', async () => {
      subDevice.name = faker.random.alphaNumeric(21);

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if type is invalid', async () => {
      subDevice.type = 'invalid';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if type is not a string', async () => {
      subDevice.type = 23123;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);

      subDevice.type = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if type is missing', async () => {
      delete subDevice.type;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if createdBy is invalid', async () => {
      subDevice.createdBy = 'invalid';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if createdBy is not a string', async () => {
      subDevice.createdBy = 3123123;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);

      subDevice.createdBy = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if updatedBy is invalid', async () => {
      subDevice.updatedBy = 'invalid';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if updatedBy is not a string', async () => {
      subDevice.updatedBy = 3123123;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);

      subDevice.updatedBy = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/devices/:deviceId/sub-devices', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne, deviceTwo]);
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices`;
    });

    it('should return 200 and all sub-devices', async () => {
      await insertSubDevices([subDeviceOne, subDeviceTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('createdAt');
      expect(res.body[0]).toHaveProperty('updatedAt');
      expect(res.body[0]).toMatchObject({
        id: subDeviceOne._id.toHexString(),
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        name: subDeviceOne.name,
        type: subDeviceOne.type,
        isDisabled: false,
        createdBy: subDeviceOne.createdBy,
      });
    });

    it('should return 401 if access token is missing', async () => {
      await insertSubDevices([subDeviceOne, subDeviceTwo]);

      await request(app)
        .get(route)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if a non-admin is trying to access all sub-devices', async () => {
      await insertSubDevices([subDeviceOne, subDeviceTwo]);

      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should correctly apply filter on subDeviceId field', async () => {
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ subDeviceId: subDeviceOne.subDeviceId })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(subDeviceOne._id.toHexString());
    });

    it('should correctly apply filter on name field', async () => {
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ name: subDeviceOne.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(subDeviceOne._id.toHexString());
    });

    it('should correctly apply filter on type field', async () => {
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ type: subDeviceOne.type })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe(subDeviceOne._id.toHexString());
    });

    it('should correctly apply filter on isDisabled field', async () => {
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ isDisabled: subDeviceOne.isDisabled })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe(subDeviceOne._id.toHexString());
    });

    it('should correctly sort returned array if descending sort param is specified', async () => {
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'name:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[1].id).toBe(subDeviceOne._id.toHexString());
    });

    it('should correctly sort returned array if ascending sort param is specified', async () => {
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'name:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe(subDeviceOne._id.toHexString());
    });

    it('should limit returned array if limit param is specified', async () => {
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
    });

    it('should return the correct page if page and limit params are specified', async () => {
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(subDeviceTwo._id.toHexString());
    });
  });

  describe('GET /v1/devices/:deviceId/sub-devices/:subDeviceId', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne]);
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}`;
    });

    it('should return 200 and the sub-device object if data is ok', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('deviceId');
      expect(res.body).toHaveProperty('subDeviceId');
      expect(res.body).toMatchObject({
        id: subDeviceOne._id.toHexString(),
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        name: subDeviceOne.name,
        type: subDeviceOne.type,
        isDisabled: false,
        createdBy: deviceOne.createdBy,
        updatedBy: deviceOne.updatedBy,
      });
    });

    it('should return 401 error if access token is missing', async () => {
      await request(app)
        .get(route)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if user is trying to get sub-device', async () => {
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 200 and the sub-device object if admin is trying to get sub-device', async () => {
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    it('should return 400 error if subDeviceId is not valid', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/invalid`;
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 error if device is not found', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceTwo.subDeviceId}`;
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/devices/:deviceId/sub-devices/:subDeviceId', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne]);
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}`;
    });

    it('should return 204 if data is ok', async () => {
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbSubDevice = await SubDevice.findById(subDeviceOne._id);
      expect(dbSubDevice).toBeNull();
    });

    it('should return 204 and successfully delete sub-device and send notification to users', async () => {
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
      expect(spy).toBeCalled();
    });

    it('should return 204 and delete sub-device and all sub-device-params of a device', async () => {
      await insertDevices([deviceTwo]);
      await insertSubDevices([subDeviceThree]);
      await insertSubDeviceParams([subDeviceParamFour, subDeviceParamFive]);

      route = `/v1/devices/${deviceTwo.deviceId}/sub-devices/${subDeviceThree.subDeviceId}`;
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbSubDeviceParamOne = await SubDeviceParam.findById(subDeviceParamFour._id);
      expect(dbSubDeviceParamOne).toBeNull();
      const dbSubDeviceParamTwo = await SubDeviceParam.findById(subDeviceParamFive._id);
      expect(dbSubDeviceParamTwo).toBeNull();
    });

    it('should return 401 error if access token is missing', async () => {
      await request(app)
        .delete(route)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if user is trying to delete sub-device', async () => {
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 204 if admin is trying to delete sub-device', async () => {
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    it('should return 400 error if subDeviceId is not valid', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/invalid`;
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 error if device is not found', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceTwo.subDeviceId}`;
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/devices/:deviceId/sub-devices/:subDeviceId', () => {
    let updateBody;
    beforeEach(async () => {
      updateBody = {
        subDeviceId: faker.random.alphaNumeric(16),
        name: 'someUnique',
        type: subDeviceType[1],
        isDisabled: true,
      };
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne]);
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}`;
    });

    it('should return 200 and successfully update sub-device if data is ok', async () => {
      const res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: updateBody.subDeviceId,
        name: updateBody.name,
        type: updateBody.type,
        isDisabled: true,
      });

      const dbSubDevice = await SubDevice.findOne({
        deviceId: deviceOne.deviceId,
        subDeviceId: updateBody.subDeviceId,
      });
      expect(dbSubDevice).toBeDefined();
      expect(dbSubDevice).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: updateBody.subDeviceId,
        name: updateBody.name,
        type: updateBody.type,
        isDisabled: true,
        updatedBy: admin.email,
      });
    });

    it('should return 200 and successfully update sub-device and send notification to users', async () => {
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
      expect(spy).toBeCalled();
    });

    it('should return 200 and update sub-device and all sub-device-params of a device', async () => {
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamThree]);
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const dbSubDeviceParamOne = await SubDeviceParam.findById(subDeviceParamOne._id);
      expect(dbSubDeviceParamOne).toBeDefined();
      expect(dbSubDeviceParamOne.subDeviceId).toBe(updateBody.subDeviceId);

      const dbSubDeviceParamThree = await SubDeviceParam.findById(subDeviceParamThree._id);
      expect(dbSubDeviceParamThree).toBeDefined();
      expect(dbSubDeviceParamThree.subDeviceId).toBe(updateBody.subDeviceId);
    });

    it('should return 401 error if access token is missing', async () => {
      updateBody = { name: faker.name.firstName() };

      await request(app)
        .patch(route)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if user is updating sub-device', async () => {
      updateBody = { name: faker.name.firstName() };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 200 and successfully update sub-device if admin is updating sub-device', async () => {
      updateBody = { name: faker.name.firstName() };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    it('should return 404 if admin is updating sub-device that is not found', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceTwo.subDeviceId}`;
      updateBody = { name: faker.name.firstName() };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 400 error if subDeviceId is not valid', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/invalid`;
      updateBody = { name: faker.name.firstName() };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if subDeviceId is invalid', async () => {
      updateBody = { subDeviceId: 'invalidId' };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if subDeviceId is already taken', async () => {
      await insertSubDevices([subDeviceTwo]);
      updateBody = { subDeviceId: subDeviceTwo.subDeviceId };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should not return 400 if subDeviceId is my subDeviceId', async () => {
      await insertSubDevices([subDeviceTwo]);
      updateBody = { subDeviceId: subDeviceOne.subDeviceId };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    it('should return 400 if subDeviceId length is less than 16 characters', async () => {
      updateBody = { subDeviceId: faker.random.alphaNumeric(15) };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if subDeviceId length is greater than 20 characters', async () => {
      updateBody = { subDeviceId: faker.random.alphaNumeric(21) };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if subDeviceId is not string', async () => {
      updateBody = { subDeviceId: 31231 };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody = { subDeviceId: {} };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name is invalid', async () => {
      updateBody = { name: 'invalid@name' };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name is not string', async () => {
      updateBody = { name: 1231 };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody = { name: 1231 };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name length is less than 1', async () => {
      updateBody = { name: '' };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name length is greater than 20', async () => {
      updateBody = { name: faker.random.alphaNumeric(21) };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if type is invalid', async () => {
      updateBody = { type: 'invalid' };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if type is not a string', async () => {
      updateBody = { type: 23123 };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody = { type: {} };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
