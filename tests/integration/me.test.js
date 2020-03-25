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
import { insertSettings, settingFive, settingFour, settingOne, settingThree, settingTwo } from '../fixtures/setting.fixture';

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
      await insertSettings([settingOne, settingTwo, settingThree, settingFour, settingFive]);
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
      expect(res.body.settings).toHaveProperty('deviceSettings');
      expect(res.body.settings).toHaveProperty('subDeviceSettings');
      expect(res.body.settings.deviceSettings).toHaveLength(3);
      expect(res.body.settings.subDeviceSettings).toHaveLength(1);

      expect(res.body.devices.myDevices[0]).toHaveProperty('deviceId');
      expect(res.body.devices.myDevices[0]).toHaveProperty('name');
      expect(res.body.devices.myDevices[0]).toHaveProperty('type');
      expect(res.body.devices.myDevices[0]).toHaveProperty('deviceOwner');

      expect(res.body.devices.myDevices[1]).toHaveProperty('deviceId');
      expect(res.body.devices.myDevices[1]).toHaveProperty('name');
      expect(res.body.devices.myDevices[1]).toHaveProperty('type');
      expect(res.body.devices.myDevices[1]).toHaveProperty('deviceOwner');
      expect(res.body.devices.myDevices[1]).toHaveProperty('deviceId');
      expect(res.body.devices.myDevices[1]).toHaveProperty('name');
      expect(res.body.devices.myDevices[1]).toHaveProperty('type');
      expect(res.body.devices.myDevices[1]).toHaveProperty('deviceOwner');

      expect(res.body.devices.sharedDevices[0]).toHaveProperty('deviceOwner');
      expect(res.body.devices.sharedDevices[0]).toHaveProperty('name');
      expect(res.body.devices.sharedDevices[0]).toHaveProperty('type');
      expect(res.body.devices.sharedDevices[0]).toHaveProperty('deviceOwner');

      expect(res.body.subDevices[0]).toHaveProperty('deviceId');
      expect(res.body.subDevices[0]).toHaveProperty('subDeviceId');
      expect(res.body.subDevices[0]).toHaveProperty('name');
      expect(res.body.subDevices[0]).toHaveProperty('type');

      expect(res.body.subDevices[1]).toHaveProperty('deviceId');
      expect(res.body.subDevices[1]).toHaveProperty('subDeviceId');
      expect(res.body.subDevices[1]).toHaveProperty('name');
      expect(res.body.subDevices[1]).toHaveProperty('type');

      expect(res.body.subDevices[2]).toHaveProperty('deviceId');
      expect(res.body.subDevices[2]).toHaveProperty('subDeviceId');
      expect(res.body.subDevices[2]).toHaveProperty('name');
      expect(res.body.subDevices[2]).toHaveProperty('type');

      expect(res.body.subDevices[3]).toHaveProperty('deviceId');
      expect(res.body.subDevices[3]).toHaveProperty('subDeviceId');
      expect(res.body.subDevices[3]).toHaveProperty('name');
      expect(res.body.subDevices[3]).toHaveProperty('type');

      expect(res.body.subDeviceParams[0]).toHaveProperty('deviceId');
      expect(res.body.subDeviceParams[0]).toHaveProperty('subDeviceId');
      expect(res.body.subDeviceParams[0]).toHaveProperty('paramName');
      expect(res.body.subDeviceParams[0]).toHaveProperty('paramValue');

      expect(res.body.subDeviceParams[1]).toHaveProperty('deviceId');
      expect(res.body.subDeviceParams[1]).toHaveProperty('subDeviceId');
      expect(res.body.subDeviceParams[1]).toHaveProperty('paramName');
      expect(res.body.subDeviceParams[1]).toHaveProperty('paramValue');

      expect(res.body.subDeviceParams[2]).toHaveProperty('deviceId');
      expect(res.body.subDeviceParams[2]).toHaveProperty('subDeviceId');
      expect(res.body.subDeviceParams[2]).toHaveProperty('paramName');
      expect(res.body.subDeviceParams[2]).toHaveProperty('paramValue');

      expect(res.body.subDeviceParams[3]).toHaveProperty('deviceId');
      expect(res.body.subDeviceParams[3]).toHaveProperty('subDeviceId');
      expect(res.body.subDeviceParams[3]).toHaveProperty('paramName');
      expect(res.body.subDeviceParams[3]).toHaveProperty('paramValue');

      expect(res.body.subDeviceParams[4]).toHaveProperty('deviceId');
      expect(res.body.subDeviceParams[4]).toHaveProperty('subDeviceId');
      expect(res.body.subDeviceParams[4]).toHaveProperty('paramName');
      expect(res.body.subDeviceParams[4]).toHaveProperty('paramValue');

      expect(res.body.settings.deviceSettings[0]).toHaveProperty('isDisabled');
      expect(res.body.settings.deviceSettings[0]).toHaveProperty('type');
      expect(res.body.settings.deviceSettings[0]).toHaveProperty('idType');
      expect(res.body.settings.deviceSettings[0]).toHaveProperty('bindedTo');
      expect(res.body.settings.deviceSettings[0]).toHaveProperty('paramName');
      expect(res.body.settings.deviceSettings[0]).toHaveProperty('paramValue');

      expect(res.body.settings.deviceSettings[1]).toHaveProperty('isDisabled');
      expect(res.body.settings.deviceSettings[1]).toHaveProperty('type');
      expect(res.body.settings.deviceSettings[1]).toHaveProperty('idType');
      expect(res.body.settings.deviceSettings[1]).toHaveProperty('bindedTo');
      expect(res.body.settings.deviceSettings[1]).toHaveProperty('paramName');
      expect(res.body.settings.deviceSettings[1]).toHaveProperty('paramValue');

      expect(res.body.settings.deviceSettings[2]).toHaveProperty('isDisabled');
      expect(res.body.settings.deviceSettings[2]).toHaveProperty('type');
      expect(res.body.settings.deviceSettings[2]).toHaveProperty('idType');
      expect(res.body.settings.deviceSettings[2]).toHaveProperty('bindedTo');
      expect(res.body.settings.deviceSettings[2]).toHaveProperty('paramName');
      expect(res.body.settings.deviceSettings[2]).toHaveProperty('paramValue');

      expect(res.body.settings.subDeviceSettings[0]).toHaveProperty('isDisabled');
      expect(res.body.settings.subDeviceSettings[0]).toHaveProperty('type');
      expect(res.body.settings.subDeviceSettings[0]).toHaveProperty('idType');
      expect(res.body.settings.subDeviceSettings[0]).toHaveProperty('bindedTo');
      expect(res.body.settings.subDeviceSettings[0]).toHaveProperty('paramName');
      expect(res.body.settings.subDeviceSettings[0]).toHaveProperty('paramValue');
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
