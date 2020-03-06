import request from 'supertest';
import httpStatus from 'http-status';
import { setupTestDB } from '../utils/setupTestDB';
import { admin, insertUsers, userOne } from '../fixtures/user.fixture';
import { deviceOne, deviceThree, deviceTwo, insertDevices } from '../fixtures/device.fixture';
import { insertSubDevices, subDeviceFour, subDeviceOne, subDeviceThree, subDeviceTwo } from '../fixtures/subDevice.fixture';
import {
  insertSubDeviceParams,
  subDeviceParamFive,
  subDeviceParamFour,
  subDeviceParamOne,
  subDeviceParamThree,
  subDeviceParamTwo,
} from '../fixtures/subDeviceParam.fixture';
import { accessOne, insertSharedDeviceAccess } from '../fixtures/sharedDeviceAccess.fixture';
import app from '../../src/app';
import { adminAccessToken, userOneAccessToken, userTwoAccessToken } from '../fixtures/token.fixture';

setupTestDB();

describe('Me Routes', () => {
  let route;
  describe('GET /v1/devices', () => {
    route = '/v1/me/devices';
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
    });

    it('should return 200 and all devices and its sub-devices and its sub-device-params', async () => {
      await insertDevices([deviceOne, deviceTwo, deviceThree]);
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);
      await insertSubDeviceParams([
        subDeviceParamOne,
        subDeviceParamTwo,
        subDeviceParamThree,
        subDeviceParamFour,
        subDeviceParamFive,
      ]);
      await insertSharedDeviceAccess([accessOne]);
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toHaveProperty('devices');
      expect(res.body.devices).toHaveProperty('myDevices');
      expect(res.body.devices.myDevices).toBeInstanceOf(Array);
      expect(res.body.devices).toHaveProperty('sharedDevices');
      expect(res.body.devices.sharedDevices).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('subDevices');
      expect(res.body.subDevices).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('subDeviceParams');
      expect(res.body.subDeviceParams).toBeInstanceOf(Array);
      expect(res.body.devices.myDevices).toHaveLength(2);
      expect(res.body.devices.sharedDevices).toHaveLength(1);
      expect(res.body.subDevices).toHaveLength(4);
      expect(res.body.subDeviceParams).toHaveLength(5);

      expect(res.body.devices.myDevices[0]).toMatchObject({
        deviceId: deviceTwo.deviceId,
        name: deviceTwo.name,
        type: deviceTwo.type,
        deviceOwner: deviceTwo.deviceOwner,
      });
      expect(res.body.devices.myDevices[1]).toMatchObject({
        deviceId: deviceThree.deviceId,
        name: deviceThree.name,
        type: deviceThree.type,
        deviceOwner: deviceThree.deviceOwner,
      });
      expect(res.body.devices.sharedDevices[0]).toMatchObject({
        deviceId: deviceOne.deviceId,
        name: deviceOne.name,
        type: deviceOne.type,
        deviceOwner: deviceOne.deviceOwner,
      });
      expect(res.body.subDevices[0]).toMatchObject({
        deviceId: subDeviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        name: subDeviceOne.name,
        type: subDeviceOne.type,
      });
      expect(res.body.subDevices[1]).toMatchObject({
        deviceId: subDeviceTwo.deviceId,
        subDeviceId: subDeviceTwo.subDeviceId,
        name: subDeviceTwo.name,
        type: subDeviceTwo.type,
      });
      expect(res.body.subDevices[2]).toMatchObject({
        deviceId: subDeviceThree.deviceId,
        subDeviceId: subDeviceThree.subDeviceId,
        name: subDeviceThree.name,
        type: subDeviceThree.type,
      });
      expect(res.body.subDevices[3]).toMatchObject({
        deviceId: subDeviceFour.deviceId,
        subDeviceId: subDeviceFour.subDeviceId,
        name: subDeviceFour.name,
        type: subDeviceFour.type,
      });
      expect(res.body.subDeviceParams[0]).toMatchObject({
        deviceId: subDeviceParamOne.deviceId,
        subDeviceId: subDeviceParamOne.subDeviceId,
        paramName: subDeviceParamOne.paramName,
        paramValue: subDeviceParamOne.paramValue,
      });
      expect(res.body.subDeviceParams[1]).toMatchObject({
        deviceId: subDeviceParamThree.deviceId,
        subDeviceId: subDeviceParamThree.subDeviceId,
        paramName: subDeviceParamThree.paramName,
        paramValue: subDeviceParamThree.paramValue,
      });
      expect(res.body.subDeviceParams[2]).toMatchObject({
        deviceId: subDeviceParamTwo.deviceId,
        subDeviceId: subDeviceParamTwo.subDeviceId,
        paramName: subDeviceParamTwo.paramName,
        paramValue: subDeviceParamTwo.paramValue,
      });
      expect(res.body.subDeviceParams[3]).toMatchObject({
        deviceId: subDeviceParamFour.deviceId,
        subDeviceId: subDeviceParamFour.subDeviceId,
        paramName: subDeviceParamFour.paramName,
        paramValue: subDeviceParamFour.paramValue,
      });
      expect(res.body.subDeviceParams[4]).toMatchObject({
        deviceId: subDeviceParamFive.deviceId,
        subDeviceId: subDeviceParamFive.subDeviceId,
        paramName: subDeviceParamFive.paramName,
        paramValue: subDeviceParamFive.paramValue,
      });
    });

    it('should return 200 and no device if no device exists', async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toHaveProperty('devices');
      expect(res.body.devices).toHaveProperty('myDevices');
      expect(res.body.devices.myDevices).toBeInstanceOf(Array);
      expect(res.body.devices).toHaveProperty('sharedDevices');
      expect(res.body.devices.sharedDevices).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('subDevices');
      expect(res.body.subDevices).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('subDeviceParams');
      expect(res.body.subDeviceParams).toBeInstanceOf(Array);
      expect(res.body.devices.myDevices).toHaveLength(0);
      expect(res.body.devices.sharedDevices).toHaveLength(0);
      expect(res.body.subDevices).toHaveLength(0);
      expect(res.body.subDeviceParams).toHaveLength(0);
    });

    it('should return 200 and device but no sub-device if it does not exists', async () => {
      await insertDevices([deviceOne, deviceTwo, deviceThree]);
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toHaveProperty('devices');
      expect(res.body.devices).toHaveProperty('myDevices');
      expect(res.body.devices.myDevices).toBeInstanceOf(Array);
      expect(res.body.devices).toHaveProperty('sharedDevices');
      expect(res.body.devices.sharedDevices).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('subDevices');
      expect(res.body.subDevices).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('subDeviceParams');
      expect(res.body.subDeviceParams).toBeInstanceOf(Array);
      expect(res.body.devices.myDevices).toHaveLength(2);
      expect(res.body.devices.sharedDevices).toHaveLength(0);
      expect(res.body.subDevices).toHaveLength(0);
      expect(res.body.subDeviceParams).toHaveLength(0);
    });

    it('should return 200 and device with shared devices but no sub-device if it does not exists', async () => {
      await insertDevices([deviceOne, deviceTwo, deviceThree]);
      await insertSharedDeviceAccess([accessOne]);
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toHaveProperty('devices');
      expect(res.body.devices).toHaveProperty('myDevices');
      expect(res.body.devices.myDevices).toBeInstanceOf(Array);
      expect(res.body.devices).toHaveProperty('sharedDevices');
      expect(res.body.devices.sharedDevices).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('subDevices');
      expect(res.body.subDevices).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('subDeviceParams');
      expect(res.body.subDeviceParams).toBeInstanceOf(Array);
      expect(res.body.devices.myDevices).toHaveLength(2);
      expect(res.body.devices.sharedDevices).toHaveLength(1);
      expect(res.body.subDevices).toHaveLength(0);
      expect(res.body.subDeviceParams).toHaveLength(0);
    });

    it('should return 200 and device and sub-device but no sub-device-params if it does not exists', async () => {
      await insertDevices([deviceOne, deviceTwo, deviceThree]);
      await insertSubDevices([subDeviceOne, subDeviceTwo, subDeviceThree, subDeviceFour]);

      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toHaveProperty('devices');
      expect(res.body.devices).toHaveProperty('myDevices');
      expect(res.body.devices.myDevices).toBeInstanceOf(Array);
      expect(res.body.devices).toHaveProperty('sharedDevices');
      expect(res.body.devices.sharedDevices).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('subDevices');
      expect(res.body.subDevices).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('subDeviceParams');
      expect(res.body.subDeviceParams).toBeInstanceOf(Array);
      expect(res.body.devices.myDevices).toHaveLength(2);
      expect(res.body.devices.sharedDevices).toHaveLength(0);
      expect(res.body.subDevices).toHaveLength(2);
      expect(res.body.subDeviceParams).toHaveLength(0);
    });

    it('should return 200 if a admin is trying to access', async () => {
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    it('should return 401 if access token is missing', async () => {
      await request(app)
        .get(route)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 401 if user does not exists', async () => {
      await request(app)
        .get(route)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});
