import faker from 'faker';
import request from 'supertest';
import httpStatus from 'http-status';
import { setupTestDB } from '../utils/setupTestDB';
import app from '../../src/app';
import { userOneAccessToken, adminAccessToken } from '../fixtures/token.fixture';
import { userOne, admin, insertUsers } from '../fixtures/user.fixture';
import { deviceOne, insertDevices } from '../fixtures/device.fixture';
import { subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour, insertSubDevices } from '../fixtures/subDevice.fixture';
import {
  subDeviceParamOne,
  subDeviceParamTwo,
  subDeviceParamThree,
  subDeviceParamFour,
  insertSubDeviceParams,
} from '../fixtures/subDeviceParam.fixture';
import SubDeviceParam from '../../src/models/subDeviceParam.model';

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

    it('should return 500 error if paramValue is empty', async () => {
      subDeviceParam.paramValue = '';

      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDeviceParam)
        .expect(httpStatus.INTERNAL_SERVER_ERROR);
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
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toHaveProperty('createdAt');
      expect(res.body[0]).toHaveProperty('updatedAt');
      expect(res.body[0]).toMatchObject({
        id: subDeviceParamOne._id.toHexString(),
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        paramName: subDeviceParamOne.paramName,
        paramValue: subDeviceParamOne.paramValue,
        isDisabled: false,
        createdBy: admin.email,
      });
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
      expect(res.body[0].id).toBe(subDeviceParamOne._id.toHexString());
    });

    it('should correctly apply filter on paramValue field', async () => {
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree, subDeviceParamFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ paramValue: subDeviceParamTwo.paramValue })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(subDeviceParamTwo._id.toHexString());
    });

    it('should correctly apply filter on isDisabled field', async () => {
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree, subDeviceParamFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ isDisabled: subDeviceParamOne.isDisabled })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe(subDeviceParamOne._id.toHexString());
    });

    it('should correctly sort returned array if descending sort param is specified', async () => {
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree, subDeviceParamFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'paramName:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(3);
      expect(res.body[0].id).toBe(subDeviceParamOne._id.toHexString());
    });

    it('should correctly sort returned array if ascending sort param is specified', async () => {
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree, subDeviceParamFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'paramName:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(3);
      expect(res.body[2].id).toBe(subDeviceParamOne._id.toHexString());
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
      expect(res.body[0].id).toBe(subDeviceParamTwo._id.toHexString());
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
        id: subDeviceParamOne._id.toHexString(),
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
      await insertSubDeviceParams([subDeviceParamTwo]);
      updateBody = { paramName: subDeviceParamTwo.paramName };

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

    it('should return 500 error if paramValue is invalid', async () => {
      updateBody = { paramValue: '' };

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
