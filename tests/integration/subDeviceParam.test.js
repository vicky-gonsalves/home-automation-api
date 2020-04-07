import faker from 'faker';
import request from 'supertest';
import httpStatus from 'http-status';
import { setupTestDB } from '../utils/setupTestDB';
import app from '../../src/app';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import { admin, insertUsers, userOne } from '../fixtures/user.fixture';
import { deviceFour, deviceOne, deviceThree, deviceTwo, insertDevices } from '../fixtures/device.fixture';
import {
  insertSubDevices,
  subDeviceFive,
  subDeviceFour,
  subDeviceOne,
  subDeviceSix,
  subDeviceThree,
  subDeviceTwo,
} from '../fixtures/subDevice.fixture';
import {
  insertSubDeviceParams,
  subDeviceParamEight,
  subDeviceParamFive,
  subDeviceParamFour,
  subDeviceParamOne,
  subDeviceParamSeven,
  subDeviceParamSix,
  subDeviceParamThree,
  subDeviceParamTwo,
} from '../fixtures/subDeviceParam.fixture';
import SubDeviceParam from '../../src/models/subDeviceParam.model';
import Log from '../../src/models/log.model';
import { accessFive, accessOne, insertSharedDeviceAccess } from '../fixtures/sharedDeviceAccess.fixture';
import {
  insertSocketIds,
  socketIdFive,
  socketIdFour,
  socketIdOne,
  socketIdSix,
  socketIdThree,
  socketIdTwo,
} from '../fixtures/socketId.fixture';
import NotificationService from '../../src/services/notification.service';
import { deviceParamSix, insertDeviceParams } from '../fixtures/deviceParam.fixture';

setupTestDB();

describe('Sub-Device Params Routes', () => {
  let route;
  describe('POST /v1/devices/:deviceId/sub-devices/:subDeviceId/sub-device-params', () => {
    let subDeviceParam;
    beforeEach(async () => {
      subDeviceParam = {
        paramName: faker.random.alphaNumeric(50),
        paramValue: faker.random.arrayElement(['something', 2131231, { data: 'something' }]),
      };
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-params`;
    });

    it('should return 201 and successfully create new sub-device param if data is ok', async () => {
      const res = await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('deviceId');
      expect(res.body).toHaveProperty('subDeviceId');
      expect(res.body).toMatchObject({
        id: expect.anything(),
        isDisabled: false,
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        ...subDeviceParam,
      });

      const dbSubDeviceParam = await SubDeviceParam.findById(res.body.id);
      expect(dbSubDeviceParam).toBeDefined();
      expect(dbSubDeviceParam.isDisabled).toBe(false);
      expect(dbSubDeviceParam).toMatchObject({
        paramName: subDeviceParam.paramName,
        paramValue: subDeviceParam.paramValue,
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        isDisabled: false,
        createdBy: admin.email,
      });
    });

    it('should return 201 and successfully create new sub-device-param if data is ok and send notification to users', async () => {
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const _subDeviceParam = {
        paramName: subDeviceParamOne.paramName,
        paramValue: subDeviceParamOne.paramValue,
      };
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_subDeviceParam)
        .expect(httpStatus.CREATED);
      expect(spy).toBeCalled();
    });

    it('should return 401 error is access token is missing', async () => {
      await request(app)
        .post(route)
        .send(subDeviceParam)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 error if logged in user is not admin', async () => {
      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 400 error if paramName is invalid', async () => {
      subDeviceParam.paramName = 'invalid param @';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName is already used for same subDevice and device', async () => {
      await insertSubDeviceParams([subDeviceParamOne]);
      subDeviceParam.paramName = subDeviceParamOne.paramName;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 201 if paramName is not used for other subDevice and device', async () => {
      await insertSubDeviceParams([subDeviceParamFour]);
      subDeviceParam.paramName = subDeviceParamFour.paramName;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.CREATED);
    });

    it('should return 400 error if paramName length is less than 1 characters', async () => {
      subDeviceParam.paramName = faker.random.alphaNumeric(0);

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName length is greater than 50 characters', async () => {
      subDeviceParam.subDeviceId = faker.random.alphaNumeric(21);

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName is missing', async () => {
      delete subDeviceParam.paramName;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramValue is empty', async () => {
      subDeviceParam.paramValue = '';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramValue is missing', async () => {
      delete subDeviceParam.paramValue;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if createdBy is invalid', async () => {
      subDeviceParam.createdBy = 'invalid';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if createdBy is not a string', async () => {
      subDeviceParam.createdBy = 3123123;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.BAD_REQUEST);

      subDeviceParam.createdBy = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if updatedBy is invalid', async () => {
      subDeviceParam.updatedBy = 'invalid';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if updatedBy is not a string', async () => {
      subDeviceParam.updatedBy = 3123123;

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.BAD_REQUEST);

      subDeviceParam.updatedBy = {};

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/devices/:deviceId/sub-devices/:subDeviceId/sub-device-params', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-params`;
    });

    it('should return 200 and all sub-device params', async () => {
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree, subDeviceParamFour]);

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
      expect(res.body[0]).toHaveProperty('subDeviceId');
      expect(res.body[0]).toHaveProperty('paramName');
      expect(res.body[0]).toHaveProperty('paramValue');
      expect(res.body[0]).toHaveProperty('isDisabled');
      expect(res.body[0]).toHaveProperty('createdBy');

      expect(res.body[1]).toHaveProperty('createdAt');
      expect(res.body[1]).toHaveProperty('updatedAt');
      expect(res.body[1]).toHaveProperty('deviceId');
      expect(res.body[1]).toHaveProperty('subDeviceId');
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

    it('should return 403 if a non-admin is trying to access all sub-device parmas', async () => {
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should correctly apply filter on paramName field', async () => {
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree, subDeviceParamFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ paramName: subDeviceParamOne.paramName })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBeDefined();
    });

    it('should correctly apply filter on paramValue field', async () => {
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree, subDeviceParamFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ paramValue: 'off' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBeDefined();
    });

    it('should correctly apply filter on paramValue field is numeric', async () => {
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree, subDeviceParamFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ paramValue: 50 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBeDefined();
    });

    it('should correctly apply filter on isDisabled field', async () => {
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree, subDeviceParamFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ isDisabled: subDeviceParamThree.isDisabled })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[1].id).toBeDefined();
    });

    it('should correctly sort returned array if descending sort param is specified', async () => {
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree, subDeviceParamFour]);

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
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree, subDeviceParamFour]);

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
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree, subDeviceParamFour]);

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
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree, subDeviceParamFour]);

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

  describe('GET /v1/devices/:deviceId/sub-devices/:subDeviceId/sub-device-params/:paramName', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);
      await insertSubDeviceParams([subDeviceParamOne]);
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-params/${subDeviceParamOne.paramName}`;
    });

    it('should return 200 and the sub-device param object if data is ok', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('deviceId');
      expect(res.body).toHaveProperty('subDeviceId');
      expect(res.body).toHaveProperty('paramName');
      expect(res.body).toHaveProperty('paramValue');
      expect(res.body).toMatchObject({
        id: subDeviceParamOne._id.toString(),
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamOne.paramName,
        paramValue: subDeviceParamOne.paramValue,
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

    it('should return 403 error if user is trying to get sub-device param', async () => {
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 200 and the sub-device param object if admin is trying to get sub-device param', async () => {
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    it('should return 400 error if paramName is not valid', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-params/invalid@Name`;
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 error if device is not found', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-params/${subDeviceParamTwo.paramName}`;
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/devices/:deviceId/sub-devices/:subDeviceId/sub-device-params/:paramName', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne]);
      await insertSubDeviceParams([subDeviceParamOne]);
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-params/${subDeviceParamOne.paramName}`;
    });

    it('should return 204 if data is ok', async () => {
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbSubDeviceParam = await SubDeviceParam.findById(subDeviceParamOne._id);
      expect(dbSubDeviceParam).toBeNull();
    });

    it('should return 204 and successfully delete sub-device-param if data is ok and send notification to users', async () => {
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

    it('should return 403 error if user is trying to delete sub-device param', async () => {
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 204 if admin is trying to delete sub-device param', async () => {
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    it('should return 400 error if paramName is not valid', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-params/invalid@`;
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 error if device is not found', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-params/${subDeviceParamTwo.paramName}`;
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/devices/:deviceId/sub-devices/:subDeviceId/sub-device-params/:paramName', () => {
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
      await insertSubDeviceParams([subDeviceParamOne]);
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-params/${subDeviceParamOne.paramName}`;
    });

    it('should return 200 and successfully update sub-device param if data is ok', async () => {
      const res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: updateBody.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: true,
      });

      const dbSubDeviceParam = await SubDeviceParam.findOne({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: updateBody.paramName,
      });
      expect(dbSubDeviceParam).toBeDefined();
      expect(dbSubDeviceParam).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: updateBody.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: true,
        updatedBy: admin.email,
      });
    });

    it('should return 200 and successfully update sub-device-param if data is ok and send notification to users', async () => {
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

    it('should return 403 if user is updating sub-device param', async () => {
      updateBody = { name: faker.name.firstName() };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 200 and successfully update sub-device param if admin is updating sub-device param', async () => {
      updateBody = { paramName: faker.name.firstName() };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    it('should return 404 if admin is updating sub-device paramName that is not found', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-params/${subDeviceParamTwo.paramName}`;
      updateBody = { paramName: faker.name.firstName() };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 400 error if sub-device paramName is not valid', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-params/invalid@`;
      updateBody = { paramName: faker.name.firstName() };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if sub-device paramName is invalid', async () => {
      updateBody = { paramName: 'invalidId@' };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if sub-device paramName is already taken', async () => {
      await insertSubDeviceParams([subDeviceParamThree]);
      updateBody = { paramName: subDeviceParamThree.paramName };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should not return 400 if paramName is my paramName', async () => {
      await insertSubDeviceParams([subDeviceParamTwo]);
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

  describe('PATCH /v1/devices/:deviceId/sub-devices/:subDeviceId/sub-device-param-value/:paramName', () => {
    let updateBody;
    beforeEach(async () => {
      updateBody = {
        paramValue: faker.random.arrayElement(['something', 2131231, { data: 'something' }]),
      };
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne, deviceTwo]);
      await insertSubDevices([subDeviceOne, subDeviceThree]);
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamFour]);
    });

    it('should return 200 and successfully update sub-device param value if data is ok and if user is admin', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-param-value/${subDeviceParamOne.paramName}`;
      const res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamOne.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
      });

      const dbSubDeviceParam = await SubDeviceParam.findOne({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamOne.paramName,
      });
      expect(dbSubDeviceParam).toBeDefined();
      expect(dbSubDeviceParam).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamOne.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
        updatedBy: admin.email,
      });
    });

    it('should return 200 and successfully update sub-device param value if data is ok and if user is admin and save log when device is online', async () => {
      await insertDeviceParams([deviceParamSix]);
      await insertSubDeviceParams([subDeviceParamThree]);
      await insertSocketIds([socketIdOne]);
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-param-value/${subDeviceParamThree.paramName}`;
      updateBody = {
        paramValue: 'on',
      };
      const res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamThree.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
      });

      const dbSubDeviceParam = await SubDeviceParam.findOne({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamThree.paramName,
      });
      expect(dbSubDeviceParam).toBeDefined();
      expect(dbSubDeviceParam).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamThree.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
        updatedBy: admin.email,
      });

      const dbLog = await Log.findOne({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        logName: `${subDeviceParamThree.paramName}_UPDATED`,
      });
      expect(dbLog).toBeDefined();
      expect(dbLog).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        logName: `${subDeviceParamThree.paramName}_UPDATED`,
        logDescription: `${subDeviceOne.name} turned on when water level was ${deviceParamSix.paramValue}%`,
        createdBy: admin.email,
      });
    });

    it('should return 200 and successfully update sub-device param value if data is ok and if user is admin and save log when device is offline', async () => {
      await insertDeviceParams([deviceParamSix]);
      await insertSubDeviceParams([subDeviceParamThree]);
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-param-value/${subDeviceParamThree.paramName}`;
      updateBody = {
        paramValue: 'on',
      };
      const res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamThree.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
      });

      const dbSubDeviceParam = await SubDeviceParam.findOne({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamThree.paramName,
      });
      expect(dbSubDeviceParam).toBeDefined();
      expect(dbSubDeviceParam).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamThree.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
        updatedBy: admin.email,
      });

      const dbLog = await Log.findOne({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        logName: `${subDeviceParamThree.paramName}_UPDATED`,
      });
      expect(dbLog).toBeDefined();
      expect(dbLog).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        logName: `${subDeviceParamThree.paramName}_UPDATED`,
        logDescription: `${subDeviceOne.name} turned on when device was offline`,
        createdBy: admin.email,
      });
    });

    it('should return 200 and successfully update sub-device param value if data is ok and if user is having role user and access to the device', async () => {
      await insertSharedDeviceAccess([accessOne]);
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-param-value/${subDeviceParamOne.paramName}`;
      const res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamOne.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
      });

      const dbSubDeviceParam = await SubDeviceParam.findOne({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamOne.paramName,
      });
      expect(dbSubDeviceParam).toBeDefined();
      expect(dbSubDeviceParam).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamOne.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
        updatedBy: userOne.email,
      });
    });

    it('should return 200 and successfully update sub-device param value if data is ok and if user is having role user and user is trying to update his own device', async () => {
      route = `/v1/devices/${deviceTwo.deviceId}/sub-devices/${subDeviceThree.subDeviceId}/sub-device-param-value/${subDeviceParamFour.paramName}`;
      const res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: deviceTwo.deviceId,
        subDeviceId: subDeviceThree.subDeviceId,
        paramName: subDeviceParamFour.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
      });

      const dbSubDeviceParam = await SubDeviceParam.findOne({
        deviceId: deviceTwo.deviceId,
        subDeviceId: subDeviceThree.subDeviceId,
        paramName: subDeviceParamFour.paramName,
      });
      expect(dbSubDeviceParam).toBeDefined();
      expect(dbSubDeviceParam).toMatchObject({
        deviceId: deviceTwo.deviceId,
        subDeviceId: subDeviceThree.subDeviceId,
        paramName: subDeviceParamFour.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
        updatedBy: userOne.email,
      });
    });

    it('should return 200 and successfully update sub-device-param if data is ok and send notification to users', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-param-value/${subDeviceParamOne.paramName}`;
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
      expect(spy).toBeCalledTimes(2);
    });

    it('should return 403 if user is having role user and no access to the device', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-param-value/${subDeviceParamOne.paramName}`;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 401 error if access token is missing', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-param-value/${subDeviceParamOne.paramName}`;
      await request(app)
        .patch(route)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 404 if admin is updating sub-device paramName that is not found', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-param-value/${subDeviceParamTwo.paramName}`;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 400 error if sub-device paramName is not valid', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-param-value/invalid@`;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if sub-device paramValue is missing', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-param-value/${subDeviceParamOne.paramName}`;
      const _updateBody = {};
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 500 and 400 if sub-device paramValue is blank or null or undefined', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}/sub-device-param-value/${subDeviceParamOne.paramName}`;
      let _updateBody = { paramValue: '' };
      let res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_updateBody)
        .expect(httpStatus.INTERNAL_SERVER_ERROR);
      expect(JSON.parse(res.error.text)).toMatchObject({
        code: 500,
        message: 'SubDeviceParam validation failed: paramValue: Invalid paramValue',
      });

      _updateBody = { paramValue: null };
      res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_updateBody)
        .expect(httpStatus.INTERNAL_SERVER_ERROR);
      expect(JSON.parse(res.error.text)).toMatchObject({
        code: 500,
        message: 'SubDeviceParam validation failed: paramValue: Path `paramValue` is required.',
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

  describe('PATCH /v1/devices/:deviceId/sub-device-param-value/status', () => {
    let updateBody;
    beforeEach(async () => {
      updateBody = {
        paramValue: 'on',
      };
      await insertUsers([admin, userOne]);
      await insertDevices([deviceOne, deviceTwo, deviceFour]);
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour, subDeviceFive, subDeviceSix]);
      await insertSubDeviceParams([
        subDeviceParamOne,
        subDeviceParamTwo,
        subDeviceParamThree,
        subDeviceParamFour,
        subDeviceParamFive,
        subDeviceParamSix,
        subDeviceParamSeven,
        subDeviceParamEight,
      ]);
    });

    it('should return 200 and successfully update status if data is ok and if user is admin', async () => {
      route = `/v1/devices/${deviceTwo.deviceId}/sub-device-param-value/status`;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const dbSubDeviceParam = await SubDeviceParam.findOne({
        deviceId: subDeviceParamFour.deviceId,
        subDeviceId: subDeviceParamFour.subDeviceId,
        paramName: 'status',
        isDisabled: false,
      });
      expect(dbSubDeviceParam).toBeDefined();
      expect(dbSubDeviceParam).toMatchObject({
        deviceId: subDeviceParamFour.deviceId,
        subDeviceId: subDeviceParamFour.subDeviceId,
        paramName: 'status',
        paramValue: updateBody.paramValue,
        isDisabled: false,
        updatedBy: admin.email,
      });

      const dbSubDeviceParam2 = await SubDeviceParam.findOne({
        deviceId: subDeviceParamFive.deviceId,
        subDeviceId: subDeviceParamFive.subDeviceId,
        paramName: 'status',
        isDisabled: false,
      });
      expect(dbSubDeviceParam2).toBeDefined();
      expect(dbSubDeviceParam2).toMatchObject({
        deviceId: subDeviceParamFive.deviceId,
        subDeviceId: subDeviceParamFive.subDeviceId,
        paramName: 'status',
        paramValue: updateBody.paramValue,
        isDisabled: false,
        updatedBy: admin.email,
      });
    });

    it('should return 200 and successfully update status if data is ok and send notification to users and devices', async () => {
      await insertSocketIds([socketIdOne, socketIdTwo, socketIdThree, socketIdFour, socketIdFive, socketIdSix]);
      route = `/v1/devices/${deviceTwo.deviceId}/sub-device-param-value/status`;
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
      expect(spy).toBeCalledTimes(2);
    });

    it('should return 200 and successfully update status if data is ok and if user is having role user and access to the device', async () => {
      await insertSharedDeviceAccess([accessFive]);
      route = `/v1/devices/${deviceFour.deviceId}/sub-device-param-value/status`;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const dbSubDeviceParam = await SubDeviceParam.findOne({
        deviceId: subDeviceParamSix.deviceId,
        subDeviceId: subDeviceParamSix.subDeviceId,
        paramName: 'status',
        isDisabled: false,
      });
      expect(dbSubDeviceParam).toBeDefined();
      expect(dbSubDeviceParam).toMatchObject({
        deviceId: subDeviceParamSix.deviceId,
        subDeviceId: subDeviceParamSix.subDeviceId,
        paramName: 'status',
        paramValue: updateBody.paramValue,
        isDisabled: false,
        updatedBy: userOne.email,
      });

      const dbSubDeviceParam2 = await SubDeviceParam.findOne({
        deviceId: subDeviceParamSeven.deviceId,
        subDeviceId: subDeviceParamSeven.subDeviceId,
        paramName: 'status',
        isDisabled: false,
      });
      expect(dbSubDeviceParam2).toBeDefined();
      expect(dbSubDeviceParam2).toMatchObject({
        deviceId: subDeviceParamSeven.deviceId,
        subDeviceId: subDeviceParamSeven.subDeviceId,
        paramName: 'status',
        paramValue: updateBody.paramValue,
        isDisabled: false,
        updatedBy: userOne.email,
      });
    });

    it('should return 200 and successfully update sub-device param value if data is ok and if user is having role user and user is trying to update his own device', async () => {
      route = `/v1/devices/${deviceTwo.deviceId}/sub-devices/${subDeviceThree.subDeviceId}/sub-device-param-value/${subDeviceParamFour.paramName}`;
      const res = await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toMatchObject({
        deviceId: deviceTwo.deviceId,
        subDeviceId: subDeviceThree.subDeviceId,
        paramName: subDeviceParamFour.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
      });

      const dbSubDeviceParam = await SubDeviceParam.findOne({
        deviceId: deviceTwo.deviceId,
        subDeviceId: subDeviceThree.subDeviceId,
        paramName: subDeviceParamFour.paramName,
      });
      expect(dbSubDeviceParam).toBeDefined();
      expect(dbSubDeviceParam).toMatchObject({
        deviceId: deviceTwo.deviceId,
        subDeviceId: subDeviceThree.subDeviceId,
        paramName: subDeviceParamFour.paramName,
        paramValue: updateBody.paramValue,
        isDisabled: false,
        updatedBy: userOne.email,
      });
    });

    it('should return 403 user have no access to the device', async () => {
      route = `/v1/devices/${deviceFour.deviceId}/sub-device-param-value/status`;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 if device has no subDevice', async () => {
      await insertDevices([deviceThree]);
      route = `/v1/devices/${deviceThree.deviceId}/sub-device-param-value/status`;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 404 if device variant is not smartSwitch', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-device-param-value/status`;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 401 error if access token is missing', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-device-param-value/status`;
      await request(app)
        .patch(route)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 404 if admin is updating device status that is not found', async () => {
      route = `/v1/devices/${deviceThree.deviceId}/sub-device-param-value/status`;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 400 error if sub-device status is not valid', async () => {
      updateBody.paramValue = 'invalid';
      route = `/v1/devices/${deviceOne.deviceId}/sub-device-param-value/status`;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if sub-device status is missing', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-device-param-value/status`;
      const _updateBody = {};
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if sub-device status is blank or null or undefined', async () => {
      route = `/v1/devices/${deviceOne.deviceId}/sub-device-param-value/status`;
      let _updateBody = { paramValue: '' };
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_updateBody)
        .expect(httpStatus.BAD_REQUEST);

      _updateBody = { paramValue: null };
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_updateBody)
        .expect(httpStatus.BAD_REQUEST);

      _updateBody = { paramValue: undefined };
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(_updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
