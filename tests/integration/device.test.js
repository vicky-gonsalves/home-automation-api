import faker from 'faker';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '../../src/app';
import { deviceType } from '../../src/config/device';
import Device from '../../src/models/device.model';
import SocketId from '../../src/models/socketId.model';
import SubDevice from '../../src/models/subDevice.model';
import SubDeviceParam from '../../src/models/subDeviceParam.model';
import SharedDeviceAccess from '../../src/models/sharedDeviceAccess.model';
import { deviceOne, deviceTwo, insertDevices } from '../fixtures/device.fixture';
import { insertSocketIds, socketIdSix } from '../fixtures/socketId.fixture';
import { insertSubDevices, subDeviceFour, subDeviceThree } from '../fixtures/subDevice.fixture';
import { insertSubDeviceParams, subDeviceParamFive, subDeviceParamFour } from '../fixtures/subDeviceParam.fixture';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import { admin, insertUsers, userOne, userTwo } from '../fixtures/user.fixture';
import { setupTestDB } from '../utils/setupTestDB';
import { accessFour, accessOne, accessThree, insertSharedDeviceAccess } from '../fixtures/sharedDeviceAccess.fixture';

setupTestDB();

describe('Device Routes', () => {
  const route = '/v1/devices';
  describe('POST /v1/devices', () => {
    let newDevice;
    beforeEach(() => {
      const email = faker.internet.email().toLowerCase();
      newDevice = {
        deviceId: faker.random.alphaNumeric(16),
        name: faker.name.firstName(),
        type: faker.random.arrayElement(deviceType),
        deviceOwner: email,
        registeredAt: new Date().toISOString(),
      };
    });

    it('should return 201 and successfully create new device if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        id: expect.anything(),
        isDisabled: false,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        ...newDevice,
      });

      const dbDevice = await Device.findById(res.body.id);
      expect(dbDevice).toBeDefined();
      expect(dbDevice.isDisabled).toBe(false);
      expect(dbDevice).toMatchObject({
        name: newDevice.name,
        deviceId: newDevice.deviceId,
        type: newDevice.type,
        deviceOwner: newDevice.deviceOwner,
        isDisabled: false,
        registeredAt: new Date(newDevice.registeredAt),
        createdBy: admin.email,
      });
    });

    it('should return 401 error is access token is missing', async () => {
      await request(app)
        .post(route)
        .send(newDevice)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if logged in user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 400 error if deviceId is invalid', async () => {
      await insertUsers([admin]);
      newDevice.deviceId = 'invalid device id';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceId is already used', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);
      newDevice.deviceId = deviceOne.deviceId;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceId length is less than 16 characters', async () => {
      await insertUsers([admin]);
      newDevice.deviceId = faker.random.alphaNumeric(14);

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceId length is greater than 20 characters', async () => {
      await insertUsers([admin]);
      newDevice.deviceId = faker.random.alphaNumeric(21);

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceId is not string', async () => {
      await insertUsers([admin]);
      newDevice.deviceId = 31231;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);

      newDevice.deviceId = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceId is missing', async () => {
      await insertUsers([admin]);
      delete newDevice.deviceId;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name is invalid', async () => {
      await insertUsers([admin]);
      newDevice.name = 'invalid@name';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name is not string', async () => {
      await insertUsers([admin]);
      newDevice.name = 1231;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);

      newDevice.name = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name is missing', async () => {
      await insertUsers([admin]);
      delete newDevice.name;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name length is less than 1', async () => {
      await insertUsers([admin]);
      newDevice.name = '';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name length is greater than 20', async () => {
      await insertUsers([admin]);
      newDevice.name = faker.random.alphaNumeric(21);

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if type is invalid', async () => {
      await insertUsers([admin]);
      newDevice.type = 'invalid';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if type is not a string', async () => {
      await insertUsers([admin]);
      newDevice.type = 23123;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);

      newDevice.type = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if type is missing', async () => {
      await insertUsers([admin]);
      delete newDevice.type;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceOwner is invalid', async () => {
      await insertUsers([admin]);
      newDevice.deviceOwner = 'invalid';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceOwner is not a string', async () => {
      await insertUsers([admin]);
      newDevice.deviceOwner = 3123123;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);

      newDevice.deviceOwner = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceOwner is missing', async () => {
      await insertUsers([admin]);
      delete newDevice.deviceOwner;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if registeredAt is invalid', async () => {
      await insertUsers([admin]);
      newDevice.registeredAt = 'invalid';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if createdBy is invalid', async () => {
      await insertUsers([admin]);
      newDevice.createdBy = 'invalid';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if createdBy is not a string', async () => {
      await insertUsers([admin]);
      newDevice.createdBy = 3123123;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);

      newDevice.createdBy = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if updatedBy is invalid', async () => {
      await insertUsers([admin]);
      newDevice.updatedBy = 'invalid';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if updatedBy is not a string', async () => {
      await insertUsers([admin]);
      newDevice.updatedBy = 3123123;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);

      newDevice.updatedBy = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/devices', () => {
    it('should return 200 and all devices', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne, deviceTwo]);

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
        id: deviceOne._id.toHexString(),
        deviceId: deviceOne.deviceId,
        name: deviceOne.name,
        type: deviceOne.type,
        isDisabled: false,
        deviceOwner: deviceOne.deviceOwner,
        registeredAt: deviceOne.registeredAt,
        createdBy: deviceOne.createdBy,
        updatedBy: deviceOne.updatedBy,
      });
    });

    it('should return 401 if access token is missing', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne, deviceTwo]);

      await request(app)
        .get(route)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if a non-admin is trying to access all devices', async () => {
      await insertUsers([userOne]);
      await insertDevices([deviceOne, deviceTwo]);

      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should correctly apply filter on deviceId field', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne, deviceTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ deviceId: deviceOne.deviceId })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(deviceOne._id.toHexString());
    });

    it('should correctly apply filter on name field', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne, deviceTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ name: deviceOne.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(deviceOne._id.toHexString());
    });

    it('should correctly apply filter on type field', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ type: deviceOne.type })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(deviceOne._id.toHexString());
    });

    it('should correctly apply filter on registeredAt field', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne, deviceTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ registeredAt: deviceOne.registeredAt })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(deviceOne._id.toHexString());
    });

    it('should correctly apply filter on isDisabled field', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ isDisabled: deviceOne.isDisabled })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(deviceOne._id.toHexString());
    });

    it('should correctly sort returned array if descending sort param is specified', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne, deviceTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'registeredAt:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe(deviceTwo._id.toHexString());
    });

    it('should correctly sort returned array if ascending sort param is specified', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne, deviceTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'registeredAt:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe(deviceOne._id.toHexString());
    });

    it('should limit returned array if limit param is specified', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne, deviceTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
    });

    it('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne, deviceTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(deviceTwo._id.toHexString());
    });
  });

  describe('GET /v1/devices/get-by-device-owner/:deviceOwner', () => {
    it('should return 200 and all devices', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      const res = await request(app)
        .get(`${route}/get-by-device-owner/${deviceOne.deviceOwner}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('createdAt');
      expect(res.body[0]).toHaveProperty('updatedAt');
      expect(res.body[0]).toMatchObject({
        id: deviceOne._id.toHexString(),
        deviceId: deviceOne.deviceId,
        name: deviceOne.name,
        type: deviceOne.type,
        isDisabled: false,
        deviceOwner: deviceOne.deviceOwner,
        registeredAt: deviceOne.registeredAt,
        createdBy: deviceOne.createdBy,
        updatedBy: deviceOne.updatedBy,
      });
    });

    it('should return 401 if access token is missing', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne, deviceTwo]);

      await request(app)
        .get(`${route}/get-by-device-owner/${deviceOne.deviceOwner}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if a non-admin is trying to access all devices', async () => {
      await insertUsers([userOne]);
      await insertDevices([deviceOne, deviceTwo]);

      await request(app)
        .get(`${route}/get-by-device-owner/${deviceOne.deviceOwner}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return empty array if device is not found', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .get(`${route}/get-by-device-owner/${deviceOne.deviceOwner}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('GET /v1/devices/:deviceId', () => {
    it('should return 200 and the device object if data is ok', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);
      const res = await request(app)
        .get(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        id: deviceOne._id.toHexString(),
        deviceId: deviceOne.deviceId,
        name: deviceOne.name,
        type: deviceOne.type,
        isDisabled: false,
        deviceOwner: deviceOne.deviceOwner,
        registeredAt: deviceOne.registeredAt,
        createdBy: deviceOne.createdBy,
        updatedBy: deviceOne.updatedBy,
      });
    });

    it('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      await insertDevices([deviceOne]);

      await request(app)
        .get(`${route}/${deviceOne.deviceId}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if user is trying to get device', async () => {
      await insertUsers([userOne]);
      await insertDevices([deviceOne]);

      await request(app)
        .get(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 200 and the device object if admin is trying to get device', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      await request(app)
        .get(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    it('should return 400 error if deviceId is not valid', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`${route}/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 error if device is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/devices/:deviceId', () => {
    it('should return 204 if data is ok', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      await request(app)
        .delete(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbDevice = await Device.findById(deviceOne._id);
      expect(dbDevice).toBeNull();
    });

    it('should return 204 and delete device, all sub-devices, all sub-device-params, all shared device access and all socketIds of a device', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceTwo]);
      await insertSubDevices([subDeviceThree, subDeviceFour]);
      await insertSubDeviceParams([subDeviceParamFour, subDeviceParamFive]);
      await insertSocketIds([socketIdSix]);
      await insertSharedDeviceAccess([accessFour]);

      await request(app)
        .delete(`${route}/${deviceTwo.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbDeviceOne = await Device.findById(deviceTwo._id);
      expect(dbDeviceOne).toBeNull();
      const dbSubDeviceOne = await SubDevice.findById(subDeviceThree._id);
      expect(dbSubDeviceOne).toBeNull();
      const dbSubDeviceTwo = await SubDevice.findById(subDeviceFour._id);
      expect(dbSubDeviceTwo).toBeNull();
      const dbSubDeviceParamOne = await SubDeviceParam.findById(subDeviceParamFour._id);
      expect(dbSubDeviceParamOne).toBeNull();
      const dbSubDeviceParamTwo = await SubDeviceParam.findById(subDeviceParamFive._id);
      expect(dbSubDeviceParamTwo).toBeNull();
      const dbSocketIdOne = await SocketId.findById(socketIdSix._id);
      expect(dbSocketIdOne).toBeNull();
      const dbAccessOne = await SharedDeviceAccess.findById(accessFour._id);
      expect(dbAccessOne).toBeNull();
    });

    it('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete(`${route}/${deviceOne.deviceId}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if user is trying to delete device', async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .delete(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 204 if admin is trying to delete device', async () => {
      await insertUsers([userOne, admin]);
      await insertDevices([deviceOne]);

      await request(app)
        .delete(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    it('should return 400 error if deviceId is not valid', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`${route}/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 error if device is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/devices/:deviceId', () => {
    let updateBody;
    beforeEach(() => {
      const email = faker.internet.email().toLowerCase();
      updateBody = {
        deviceId: faker.random.alphaNumeric(16),
        name: faker.name.firstName(),
        type: faker.random.arrayElement(deviceType),
        deviceOwner: email,
        isDisabled: true,
      };
    });

    it('should return 200 and successfully update device if data is ok', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      const res = await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: updateBody.deviceId,
        name: updateBody.name,
        type: updateBody.type,
        isDisabled: true,
        deviceOwner: updateBody.deviceOwner,
      });

      const dbDevice = await Device.findOne({ deviceId: updateBody.deviceId });
      expect(dbDevice).toBeDefined();
      expect(dbDevice).toMatchObject({
        deviceId: updateBody.deviceId,
        name: updateBody.name,
        type: updateBody.type,
        isDisabled: true,
        deviceOwner: updateBody.deviceOwner,
        updatedBy: admin.email,
      });
    });

    it('should return 200 and update device, all sub-devices, all sub-device-params, all shared device access and all socketIds of a device', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceTwo]);
      await insertSubDevices([subDeviceThree, subDeviceFour]);
      await insertSubDeviceParams([subDeviceParamFour, subDeviceParamFive]);
      await insertSocketIds([socketIdSix]);
      await insertSharedDeviceAccess([accessThree]);

      await request(app)
        .patch(`${route}/${deviceTwo.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const dbSubDeviceTwo = await SubDevice.findById(subDeviceFour._id);
      expect(dbSubDeviceTwo).toBeDefined();
      expect(dbSubDeviceTwo.deviceId).toBe(updateBody.deviceId);

      const dbSubDeviceParamOne = await SubDeviceParam.findById(subDeviceParamFour._id);
      expect(dbSubDeviceParamOne).toBeDefined();
      expect(dbSubDeviceParamOne.deviceId).toBe(updateBody.deviceId);

      const dbSubDeviceParamTwo = await SubDeviceParam.findById(subDeviceParamFive._id);
      expect(dbSubDeviceParamTwo).toBeDefined();
      expect(dbSubDeviceParamTwo.deviceId).toBe(updateBody.deviceId);

      const dbSocketIdTwo = await SocketId.findById(socketIdSix._id);
      expect(dbSocketIdTwo).toBeDefined();
      expect(dbSocketIdTwo.bindedTo).toBe(updateBody.deviceId);

      const dbAccessOne = await SharedDeviceAccess.findById(accessThree._id);
      expect(dbAccessOne).toBeDefined();
      expect(dbAccessOne.deviceId).toBe(updateBody.deviceId);
    });

    it('should return 200 and update device and delete all shared device access if deviceOwner already has access', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);
      await insertSharedDeviceAccess([accessOne]);

      updateBody = { deviceOwner: userOne.email };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const dbAccessOne = await SharedDeviceAccess.findById(accessOne._id);
      expect(dbAccessOne).toBeNull();
    });

    it('should return 200 and update device and delete all shared device access if deviceId already has access', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);
      await insertSharedDeviceAccess([accessOne]);

      updateBody = { deviceId: accessOne.deviceId, deviceOwner: userOne.email };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const dbAccessOne = await SharedDeviceAccess.findById(accessOne._id);
      expect(dbAccessOne).toBeNull();
    });

    it('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      updateBody = { name: faker.name.firstName() };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if user is updating device', async () => {
      await insertUsers([userOne, userTwo]);
      updateBody = { name: faker.name.firstName() };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 200 and successfully update device if admin is updating device', async () => {
      await insertUsers([userOne, admin]);
      await insertDevices([deviceOne]);

      updateBody = { name: faker.name.firstName() };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    it('should return 404 if admin is updating device that is not found', async () => {
      await insertUsers([admin]);
      updateBody = { name: faker.name.firstName() };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 400 error if deviceId is not valid', async () => {
      await insertUsers([admin]);
      updateBody = { name: faker.name.firstName() };

      await request(app)
        .patch(`${route}/invalidid`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if deviceId is invalid', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);
      updateBody = { deviceId: 'invalidId' };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if deviceId is already taken', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne, deviceTwo]);
      updateBody = { deviceId: deviceTwo.deviceId };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should not return 400 if deviceId is my deviceId', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);
      updateBody = { deviceId: userOne.deviceId };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    it('should return 400 if deviceId length is less than 16 characters', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      updateBody = { deviceId: faker.random.alphaNumeric(15) };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceId length is greater than 20 characters', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      updateBody = { deviceId: faker.random.alphaNumeric(21) };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceId is not string', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      updateBody = { deviceId: 31231 };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody = { deviceId: {} };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name is invalid', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      updateBody = { name: 'invalid@name' };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name is not string', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      updateBody = { name: 1231 };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody = { name: 1231 };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name length is less than 1', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      updateBody = { name: '' };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if name length is greater than 20', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      updateBody = { name: faker.random.alphaNumeric(21) };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if type is invalid', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      updateBody = { type: 'invalid' };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if type is not a string', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      updateBody = { type: 23123 };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody = { type: {} };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceOwner is invalid', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      updateBody = { deviceOwner: 'invalid' };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if deviceOwner is not a string', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      updateBody = { deviceOwner: 3123123 };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody = { deviceOwner: {} };

      await request(app)
        .patch(`${route}/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/devices/authorize-device/:deviceId', () => {
    it('should return 200 and authorize device', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);

      const res = await request(app)
        .get(`${route}/authorize-device/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toHaveProperty('access');
      expect(res.body.access).toHaveProperty('token');
      expect(res.body.access).toHaveProperty('expires');
      expect(res.body.access.token).not.toBeNull();
    });

    it('should return 400 error if deviceId is not valid', async () => {
      await insertUsers([admin]);
      await request(app)
        .get(`${route}/authorize-device/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 error if device is not found', async () => {
      await insertUsers([admin]);
      await request(app)
        .get(`${route}/authorize-device/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 401 error if user trying to authorize device', async () => {
      await request(app)
        .get(`${route}/authorize-device/${deviceOne.deviceId}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});
