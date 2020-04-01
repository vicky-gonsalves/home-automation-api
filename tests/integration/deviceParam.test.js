import faker from 'faker';
import request from 'supertest';
import httpStatus from 'http-status';
import { setupTestDB } from '../utils/setupTestDB';
import app from '../../src/app';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import { admin, insertUsers, userOne } from '../fixtures/user.fixture';
import { deviceOne, deviceTwo, insertDevices } from '../fixtures/device.fixture';
import { insertSubDevices, subDeviceFour, subDeviceOne, subDeviceThree, subDeviceTwo } from '../fixtures/subDevice.fixture';
import { deviceParamOne, deviceParamThree, deviceParamTwo, insertDeviceParams } from '../fixtures/deviceParam.fixture';
import DeviceParam from '../../src/models/deviceParam.model';
import { accessOne, insertSharedDeviceAccess } from '../fixtures/sharedDeviceAccess.fixture';
import { insertSocketIds, socketIdFour, socketIdTwo } from '../fixtures/socketId.fixture';
import NotificationService from '../../src/services/notification.service';
import Log from '../../src/models/log.model';

setupTestDB();

describe('Device Params Routes', () => {
  let route;
  describe('POST /v1/devices/:deviceId/device-params', () => {
    let deviceParam;
    beforeEach(async () => {
      deviceParam = {
        paramName: faker.random.alphaNumeric(50),
        paramValue: faker.random.arrayElement(['something', 2131231, { data: 'something' }]),
      };
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);
      route = `/v1/devices/${deviceOne.deviceId}/device-params`;
    });

    it('should return 201 and successfully create new device param if data is ok', async () => {
      const res = await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('deviceId');
      expect(res.body).toMatchObject({
        id: expect.anything(),
        isDisabled: false,
        deviceId: deviceOne.deviceId,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        ...deviceParam,
      });

      const dbDeviceParam = await DeviceParam.findById(res.body.id);
      expect(dbDeviceParam).toBeDefined();
      expect(dbDeviceParam.isDisabled).toBe(false);
      expect(dbDeviceParam).toMatchObject({
        paramName: deviceParam.paramName,
        paramValue: deviceParam.paramValue,
        deviceId: deviceOne.deviceId,
        isDisabled: false,
        createdBy: admin.email,
      });
    });

    it('should return 201 and successfully create new device-param if data is ok and send notification to users', async () => {
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const _deviceParam = {
        paramName: deviceParamOne.paramName,
        paramValue: deviceParamOne.paramValue,
      };
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_deviceParam)
        .expect(httpStatus.CREATED);
      expect(spy).toBeCalled();
    });

    it('should return 401 error is access token is missing', async () => {
      await request(app)
        .post(route)
        .send(deviceParam)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if logged in user is not admin', async () => {
      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 400 error if paramName is invalid', async () => {
      deviceParam.paramName = 'invalid param @';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName is already used for same device', async () => {
      await insertDeviceParams([deviceParamOne]);
      deviceParam.paramName = deviceParamOne.paramName;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 201 if paramName is not used for other device', async () => {
      await insertDeviceParams([deviceParamOne]);
      deviceParam.paramName = deviceParamTwo.paramName;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.CREATED);
    });

    it('should return 400 error if paramName length is less than 1 characters', async () => {
      deviceParam.paramName = faker.random.alphaNumeric(0);

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName length is greater than 50 characters', async () => {
      deviceParam.subDeviceId = faker.random.alphaNumeric(21);

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName is missing', async () => {
      delete deviceParam.paramName;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramValue is empty', async () => {
      deviceParam.paramValue = '';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramValue is missing', async () => {
      delete deviceParam.paramValue;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if createdBy is invalid', async () => {
      deviceParam.createdBy = 'invalid';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if createdBy is not a string', async () => {
      deviceParam.createdBy = 3123123;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.BAD_REQUEST);

      deviceParam.createdBy = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if updatedBy is invalid', async () => {
      deviceParam.updatedBy = 'invalid';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if updatedBy is not a string', async () => {
      deviceParam.updatedBy = 3123123;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.BAD_REQUEST);

      deviceParam.updatedBy = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(deviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/devices/:deviceId/device-params', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);
      route = `/v1/devices/${deviceOne.deviceId}/device-params`;
    });

    it('should return 200 and all device params', async () => {
      await insertDeviceParams([deviceParamOne, deviceParamTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('createdAt');
      expect(res.body[0]).toHaveProperty('updatedAt');
      expect(res.body[0]).toHaveProperty('deviceId');
      expect(res.body[0]).toHaveProperty('paramName');
      expect(res.body[0]).toHaveProperty('paramValue');
      expect(res.body[0]).toHaveProperty('isDisabled');
      expect(res.body[0]).toHaveProperty('createdBy');

      expect(res.body[1]).toHaveProperty('createdAt');
      expect(res.body[1]).toHaveProperty('updatedAt');
      expect(res.body[1]).toHaveProperty('deviceId');
      expect(res.body[1]).toHaveProperty('paramName');
      expect(res.body[1]).toHaveProperty('paramValue');
      expect(res.body[1]).toHaveProperty('isDisabled');
      expect(res.body[1]).toHaveProperty('createdBy');
    });

    it('should return 401 if access token is missing', async () => {
      await request(app)
        .get(route)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if a non-admin is trying to access all device parmas', async () => {
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should correctly apply filter on paramName field', async () => {
      await insertDeviceParams([deviceParamOne, deviceParamTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ paramName: deviceParamOne.paramName })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBeDefined();
    });

    it('should correctly apply filter on paramValue field', async () => {
      await insertDeviceParams([deviceParamOne, deviceParamTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ paramValue: deviceParamOne.paramValue })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBeDefined();
    });

    it('should correctly apply filter on isDisabled field', async () => {
      await insertDeviceParams([deviceParamOne, deviceParamTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ isDisabled: deviceParamOne.isDisabled })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[1].id).toBeDefined();
    });

    it('should correctly sort returned array if descending sort param is specified', async () => {
      await insertDeviceParams([deviceParamOne, deviceParamTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'paramName:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[1].id).toBeDefined();
    });

    it('should correctly sort returned array if ascending sort param is specified', async () => {
      await insertDeviceParams([deviceParamOne, deviceParamTwo]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'paramName:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[1].id).toBeDefined();
    });

    it('should limit returned array if limit param is specified', async () => {
      await insertDeviceParams([deviceParamOne, deviceParamTwo]);

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
      await insertDeviceParams([deviceParamOne, deviceParamTwo]);

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

  describe('GET /v1/devices/:deviceId/device-params/:paramName', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);
      await insertDeviceParams([deviceParamOne]);
      route = `/v1/devices/${deviceOne.deviceId}/device-params/${deviceParamOne.paramName}`;
    });

    it('should return 200 and the device param object if data is ok', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('deviceId');
      expect(res.body).toHaveProperty('paramName');
      expect(res.body).toHaveProperty('paramValue');
      expect(res.body).toMatchObject({
        id: deviceParamOne._id.toString(),
        deviceId: deviceOne.deviceId,
        paramName: deviceParamOne.paramName,
        paramValue: deviceParamOne.paramValue,
        isDisabled: false,
      });
    });

    it('should return 401 error if access token is missing', async () => {
      await request(app)
        .get(route)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if user is trying to get device param', async () => {
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 200 and the device param object if admin is trying to get device param', async () => {
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    it('should return 400 error if paramName is not valid', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-params/invalid@Name`;
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 error if device is not found', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-params/${deviceParamTwo.paramName}`;
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/devices/:deviceId/device-params/:paramName', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne]);
      await insertDeviceParams([deviceParamOne]);
      route = `/v1/devices/${deviceOne.deviceId}/device-params/${deviceParamOne.paramName}`;
    });

    it('should return 204 if data is ok', async () => {
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbDeviceParam = await DeviceParam.findById(deviceParamOne._id);
      expect(dbDeviceParam).toBeNull();
    });

    it('should return 204 and successfully delete device-param if data is ok and send notification to users', async () => {
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
      expect(spy).toBeCalled();
    });

    it('should return 401 error if access token is missing', async () => {
      await request(app)
        .delete(route)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if user is trying to delete device param', async () => {
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 204 if admin is trying to delete device param', async () => {
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    it('should return 400 error if paramName is not valid', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-params/invalid@`;
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 error if device is not found', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-params/${deviceParamTwo.paramName}`;
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/devices/:deviceId/device-params/:paramName', () => {
    let updateBody;
    beforeEach(async () => {
      updateBody = {
        paramName: faker.random.alphaNumeric(50),
        paramValue: faker.random.arrayElement(['something', 2131231, { data: 'something' }]),
        isDisabled: true,
      };
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne]);
      await insertDeviceParams([deviceParamOne]);
      route = `/v1/devices/${deviceOne.deviceId}/device-params/${deviceParamOne.paramName}`;
    });

    it('should return 200 and successfully update device param if data is ok', async () => {
      const res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: deviceOne.deviceId,
        paramName: updateBody.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: true,
      });

      const dbDeviceParam = await DeviceParam.findOne({
        deviceId: deviceOne.deviceId,
        paramName: updateBody.paramName,
      });
      expect(dbDeviceParam).toBeDefined();
      expect(dbDeviceParam).toMatchObject({
        deviceId: deviceOne.deviceId,
        paramName: updateBody.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: true,
        updatedBy: admin.email,
      });
    });

    it('should return 200 and successfully update device-param if data is ok and send notification to users', async () => {
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
      expect(spy).toBeCalled();
    });

    it('should return 401 error if access token is missing', async () => {
      updateBody = { name: faker.name.firstName() };

      await request(app)
        .patch(route)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if user is updating device param', async () => {
      updateBody = { name: faker.name.firstName() };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 200 and successfully update device param if admin is updating device param', async () => {
      updateBody = { paramName: faker.name.firstName() };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    it('should return 404 if admin is updating device paramName that is not found', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-params/${deviceParamTwo.paramName}`;
      updateBody = { paramName: faker.name.firstName() };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 400 error if device paramName is not valid', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-params/invalid@`;
      updateBody = { paramName: faker.name.firstName() };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if device paramName is invalid', async () => {
      updateBody = { paramName: 'invalidId@' };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if device paramName is already taken', async () => {
      await insertDeviceParams([deviceParamTwo]);
      updateBody = { paramName: deviceParamTwo.paramName };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should not return 400 if paramName is my paramName', async () => {
      await insertDeviceParams([deviceParamTwo]);
      updateBody = { paramName: subDeviceOne.paramName };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    it('should return 400 if paramName length is less than 1 characters', async () => {
      updateBody = { paramName: faker.random.alphaNumeric(0) };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName length is greater than 50 characters', async () => {
      updateBody = { paramName: faker.random.alphaNumeric(51) };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName is not string', async () => {
      updateBody = { paramName: 31231 };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody = { paramName: {} };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramValue is invalid', async () => {
      updateBody = { paramValue: '' };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /v1/devices/:deviceId/device-param-value/:paramName', () => {
    let updateBody;
    beforeEach(async () => {
      updateBody = {
        paramValue: faker.random.arrayElement(['something', 2131231, { data: 'something' }]),
      };
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne, deviceTwo]);
      await insertSubDevices([subDeviceOne, subDeviceThree]);
      await insertDeviceParams([deviceParamOne, deviceParamTwo, deviceParamThree]);
    });

    it('should return 200 and successfully update device param value if data is ok and if user is admin', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-param-value/${deviceParamOne.paramName}`;
      const res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: deviceOne.deviceId,
        paramName: deviceParamOne.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
      });

      const dbDeviceParam = await DeviceParam.findOne({
        deviceId: deviceOne.deviceId,
        paramName: deviceParamOne.paramName,
      });
      expect(dbDeviceParam).toBeDefined();
      expect(dbDeviceParam).toMatchObject({
        deviceId: deviceOne.deviceId,
        paramName: deviceParamOne.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
        updatedBy: admin.email,
      });
    });

    it('should return 200 and successfully update device param value if data is ok and create log and if user is admin', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-param-value/${deviceParamOne.paramName}`;
      const res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: deviceOne.deviceId,
        paramName: deviceParamOne.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
      });

      const dbDeviceParam = await DeviceParam.findOne({
        deviceId: deviceOne.deviceId,
        paramName: deviceParamOne.paramName,
      });
      expect(dbDeviceParam).toBeDefined();
      expect(dbDeviceParam).toMatchObject({
        deviceId: deviceOne.deviceId,
        paramName: deviceParamOne.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
        updatedBy: admin.email,
      });

      const dbLog = await Log.findOne({
        deviceId: deviceParamOne.deviceId,
        logName: `${deviceParamOne.paramName}_UPDATED`,
      });
      expect(dbLog).toBeDefined();
      expect(dbLog).toMatchObject({
        deviceId: deviceOne.deviceId,
        logName: `${deviceParamOne.paramName}_UPDATED`,
        logDescription: `${deviceOne.name} ${deviceParamOne.paramName} updated to ${updateBody.paramValue}`,
        createdBy: admin.email,
        triggeredByDevice: false,
      });
    });

    it('should return 200 and successfully update device param value if data is ok and if user is having role user and access to the device', async () => {
      await insertSharedDeviceAccess([accessOne]);
      route = `/v1/devices/${deviceOne.deviceId}/device-param-value/${deviceParamOne.paramName}`;
      const res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: deviceOne.deviceId,
        paramName: deviceParamOne.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
      });

      const dbDeviceParam = await DeviceParam.findOne({
        deviceId: deviceOne.deviceId,
        paramName: deviceParamOne.paramName,
      });
      expect(dbDeviceParam).toBeDefined();
      expect(dbDeviceParam).toMatchObject({
        deviceId: deviceOne.deviceId,
        paramName: deviceParamOne.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
        updatedBy: userOne.email,
      });
    });

    it('should return 200 and successfully update device param value if data is ok and if user is having role user and user is trying to update his own device', async () => {
      route = `/v1/devices/${deviceTwo.deviceId}/device-param-value/${deviceParamThree.paramName}`;
      const res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: deviceTwo.deviceId,
        paramName: deviceParamThree.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
      });

      const dbDeviceParam = await DeviceParam.findOne({
        deviceId: deviceTwo.deviceId,
        paramName: deviceParamThree.paramName,
      });
      expect(dbDeviceParam).toBeDefined();
      expect(dbDeviceParam).toMatchObject({
        deviceId: deviceTwo.deviceId,
        paramName: deviceParamThree.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
      });
    });

    it('should return 200 and successfully update device-param if data is ok and send notification to users', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-param-value/${deviceParamOne.paramName}`;
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
      expect(spy).toBeCalled();
    });

    it('should return 403 if user is having role user and no access to the device', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-param-value/${deviceParamOne.paramName}`;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 401 error if access token is missing', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-param-value/${deviceParamOne.paramName}`;
      await request(app)
        .patch(route)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 404 if admin is updating device paramName that is not found', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-param-value/someParam`;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 400 error if device paramName is not valid', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-param-value/invalid@`;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if device paramValue is missing', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-param-value/${deviceParamOne.paramName}`;
      const _updateBody = {};
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 500 and 400 if device paramValue is blank or null or undefined', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/device-param-value/${deviceParamOne.paramName}`;
      let _updateBody = { paramValue: '' };
      let res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_updateBody)
        .expect(httpStatus.INTERNAL_SERVER_ERROR);
      expect(JSON.parse(res.error.text)).toMatchObject({
        code: 500,
        message: 'DeviceParam validation failed: paramValue: Invalid paramValue',
      });

      _updateBody = { paramValue: null };
      res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_updateBody)
        .expect(httpStatus.INTERNAL_SERVER_ERROR);
      expect(JSON.parse(res.error.text)).toMatchObject({
        code: 500,
        message: 'DeviceParam validation failed: paramValue: Path `paramValue` is required.',
      });

      _updateBody = { paramValue: undefined };
      res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_updateBody)
        .expect(httpStatus.BAD_REQUEST);
      expect(JSON.parse(res.error.text)).toMatchObject({
        code: 400,
        message: '"paramValue" is required',
      });
    });
  });
});
