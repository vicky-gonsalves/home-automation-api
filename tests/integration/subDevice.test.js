import faker from 'faker';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '../../src/app';
import { subDeviceType } from '../../src/config/device';
import SubDevice from '../../src/models/subDevice.model';
import SubDeviceParam from '../../src/models/subDeviceParam.model';
import Setting from '../../src/models/setting.model';
import { deviceOne, deviceTwo, insertDevices } from '../fixtures/device.fixture';
import { insertSubDevices, subDeviceFour, subDeviceOne, subDeviceThree, subDeviceTwo } from '../fixtures/subDevice.fixture';
import {
  insertSubDeviceParams,
  subDeviceParamFive,
  subDeviceParamFour,
  subDeviceParamOne,
  subDeviceParamThree,
  subDeviceParamTwo,
} from '../fixtures/subDeviceParam.fixture';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import { admin, insertUsers, userOne } from '../fixtures/user.fixture';
import { setupTestDB } from '../utils/setupTestDB';
import { accessOne, insertSharedDeviceAccess } from '../fixtures/sharedDeviceAccess.fixture';
import { insertSocketIds, socketIdFour, socketIdSix, socketIdTwo } from '../fixtures/socketId.fixture';
import NotificationService from '../../src/services/notification.service';
import { defaultSettings } from '../../src/config/config';
import { insertSettings, settingFour, settingOne, settingThree, settingTwo } from '../fixtures/setting.fixture';
import { idType, settingType } from '../../src/config/setting';

setupTestDB();

describe('Sub-Device Routes', () => {
  let route;
  describe('POST /v1/devices/:deviceId/sub-devices', () => {
    let subDevice;
    beforeEach(async () => {
      subDevice = {
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
      expect(res.body).toHaveProperty('subDeviceId');
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
      expect(dbSubDevice.subDeviceId).toBeDefined();
      expect(dbSubDevice.subDeviceId.length).toBeGreaterThanOrEqual(10);
      expect(dbSubDevice.subDeviceId.length).toBeLessThanOrEqual(20);
      expect(dbSubDevice).toMatchObject({
        name: subDevice.name,
        deviceId: deviceOne.deviceId,
        type: subDevice.type,
        isDisabled: false,
        createdBy: admin.email,
      });
    });

    it('should return 201 and successfully create new default settings if device variant is tank', async () => {
      const res = await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.CREATED);

      const dbSetting = await Setting.findOne({
        type: 'device',
        idType: 'deviceId',
        bindedTo: deviceOne.deviceId,
        paramName: 'preferredSubDevice',
        paramValue: res.body.subDeviceId,
      });
      expect(dbSetting).toBeDefined();
      expect(dbSetting).toBeInstanceOf(Object);
      expect(dbSetting.type).toBe('device');
      expect(dbSetting.idType).toBe('deviceId');
      expect(dbSetting.bindedTo).toBe(deviceOne.deviceId);
      expect(dbSetting.paramName).toBe('preferredSubDevice');
      expect(dbSetting.paramValue).toBe(res.body.subDeviceId);
      expect(dbSetting.isDisabled).toBe(false);
      expect(dbSetting.createdBy).toBe(res.body.createdBy);

      const dbSettingTwo = await Setting.findOne({
        type: 'device',
        idType: 'deviceId',
        bindedTo: res.body.deviceId,
        paramName: 'autoShutDownTime',
        paramValue: defaultSettings.defaultSubDeviceAutoShutDownTime,
      });
      expect(dbSettingTwo).toBeDefined();
      expect(dbSettingTwo).toBeInstanceOf(Object);
      expect(dbSettingTwo.type).toBe('device');
      expect(dbSettingTwo.idType).toBe('deviceId');
      expect(dbSettingTwo.bindedTo).toBe(res.body.deviceId);
      expect(dbSettingTwo.paramName).toBe('autoShutDownTime');
      expect(dbSettingTwo.paramValue).toBe(defaultSettings.defaultSubDeviceAutoShutDownTime);
      expect(dbSettingTwo.isDisabled).toBe(false);
      expect(dbSettingTwo.createdBy).toBe(res.body.createdBy);

      const dbSettingThree = await Setting.findOne({
        type: 'device',
        idType: 'deviceId',
        bindedTo: res.body.deviceId,
        paramName: 'waterLevelToStart',
        paramValue: defaultSettings.defaultTankWaterLevelToStart,
      });
      expect(dbSettingThree).toBeDefined();
      expect(dbSettingThree).toBeInstanceOf(Object);
      expect(dbSettingTwo.type).toBe('device');
      expect(dbSettingTwo.idType).toBe('deviceId');
      expect(dbSettingTwo.bindedTo).toBe(res.body.deviceId);
      expect(dbSettingThree.paramName).toBe('waterLevelToStart');
      expect(dbSettingThree.paramValue).toBe(defaultSettings.defaultTankWaterLevelToStart);
      expect(dbSettingThree.isDisabled).toBe(false);
      expect(dbSettingThree.createdBy).toBe(res.body.createdBy);
    });

    it('should return 201 and successfully and create new default settings and skip preferredSubDevice setting if it exists if device variant is tank', async () => {
      const snap = Setting.findOne;
      const spy = jest.spyOn(Setting, 'create');
      Setting.findOne = jest.fn().mockResolvedValue({ exists: true });
      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.CREATED);
      Setting.findOne = snap;
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should return 201 and successfully and create new default settings and skip autoShutDownTime setting if it exists if device variant is smartSwitch', async () => {
      route = `/v1/devices/${deviceTwo.deviceId}/sub-devices`;
      await insertDevices([deviceTwo]);
      const snap = Setting.findOne;
      const spy = jest.spyOn(Setting, 'create');
      Setting.findOne = jest.fn().mockResolvedValue({ exists: true });
      await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.CREATED);
      Setting.findOne = snap;
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should return 201 and successfully create new default settings if device variant is smartSwitch', async () => {
      route = `/v1/devices/${deviceTwo.deviceId}/sub-devices`;
      await insertDevices([deviceTwo]);
      const res = await request(app)
        .post(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(subDevice)
        .expect(httpStatus.CREATED);

      const dbSetting = await Setting.findOne({
        type: 'subDevice',
        idType: 'subDeviceId',
        bindedTo: res.body.subDeviceId,
        paramName: 'autoShutDownTime',
        paramValue: 0,
      });
      expect(dbSetting).toBeDefined();
      expect(dbSetting).toBeInstanceOf(Object);
      expect(dbSetting.type).toBe('subDevice');
      expect(dbSetting.idType).toBe('subDeviceId');
      expect(dbSetting.bindedTo).toBe(res.body.subDeviceId);
      expect(dbSetting.paramName).toBe('autoShutDownTime');
      expect(dbSetting.paramValue).toBe(0);
      expect(dbSetting.isDisabled).toBe(false);
      expect(dbSetting.createdBy).toBe(res.body.createdBy);
    });

    it('should return 201 and successfully create new sub-device if data is ok and send notification to users', async () => {
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const _subDevice = {
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
      expect(res.body[0]).toHaveProperty('deviceId');
      expect(res.body[0]).toHaveProperty('subDeviceId');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('type');
      expect(res.body[0]).toHaveProperty('isDisabled');
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('createdBy');

      expect(res.body[1]).toHaveProperty('createdAt');
      expect(res.body[1]).toHaveProperty('updatedAt');
      expect(res.body[1]).toHaveProperty('deviceId');
      expect(res.body[1]).toHaveProperty('subDeviceId');
      expect(res.body[1]).toHaveProperty('name');
      expect(res.body[1]).toHaveProperty('type');
      expect(res.body[1]).toHaveProperty('isDisabled');
      expect(res.body[1]).toHaveProperty('id');
      expect(res.body[1]).toHaveProperty('createdBy');
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
      expect(res.body[0].id).toBeDefined();
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
      expect(res.body[0].id).toBeDefined();
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
      expect(res.body[0].id).toBeDefined();
      expect(res.body[1].id).toBeDefined();
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
      expect(res.body[0].id).toBeDefined();
      expect(res.body[1].id).toBeDefined();
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
      expect(res.body[1].id).toBeDefined();
      expect(res.body[1].id).toBeDefined();
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
      expect(res.body[0].id).toBeDefined();
      expect(res.body[1].id).toBeDefined();
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
      expect(res.body[0].id).toBeDefined();
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
      expect(res.body[0].id).toBeDefined();
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

    it('should return 204 and delete sub-device and all sub-device-params of a sub device', async () => {
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
      expect(dbSubDeviceParamTwo).toBeDefined();
    });

    it('should delete sub device and if in settings, preferred Device is that sub device, then it should change the preferred device to remaining sub device and send notification', async () => {
      await insertSubDevices([subDeviceTwo]);
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree]);
      await insertSettings([settingOne, settingTwo, settingThree]);
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');

      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}`;
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbSetting = await Setting.findOne({
        type: settingType[0],
        idType: idType[0],
        bindedTo: deviceOne.deviceId,
        paramName: 'preferredSubDevice',
        isDisabled: false,
      });
      expect(dbSetting).toBeDefined();
      expect(dbSetting).toBeInstanceOf(Object);
      expect(dbSetting.isDisabled).toBe(false);
      expect(dbSetting.type).toBe(settingType[0]);
      expect(dbSetting.idType).toBe(idType[0]);
      expect(dbSetting.bindedTo).toBe(deviceOne.deviceId);
      expect(dbSetting.paramName).toBe('preferredSubDevice');
      expect(dbSetting.paramValue).toBe(subDeviceTwo.subDeviceId);

      // Notifications
      expect(spy).toHaveBeenCalledTimes(3);

      // First Notification
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][0].length).toBe(2);
      expect(spy.mock.calls[0][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[0][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[0][1]).toBe('DEVICE_SETTING_UPDATED');
      expect(spy.mock.calls[0][2]).toMatchObject({
        type: settingType[0],
        idType: idType[0],
        bindedTo: deviceOne.deviceId,
        paramName: 'preferredSubDevice',
        isDisabled: false,
        updatedBy: admin.email,
      });

      // second Notification
      expect(spy.mock.calls[1][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][0].length).toBe(2);
      expect(spy.mock.calls[1][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[1][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[1][1]).toBe('DEVICE_MULTI_SETTING_DELETED');
      expect(spy.mock.calls[1][2]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][2].length).toBe(2);
      expect(spy.mock.calls[1][2][0]).toMatchObject({
        type: settingTwo.type,
        idType: settingTwo.idType,
        paramName: settingTwo.paramName,
        paramValue: settingTwo.paramValue,
      });
      expect(spy.mock.calls[1][2][1]).toMatchObject({
        type: settingThree.type,
        idType: settingThree.idType,
        paramName: settingThree.paramName,
        paramValue: settingThree.paramValue,
      });

      // Third Notification
      expect(spy.mock.calls[2][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[2][0].length).toBe(2);
      expect(spy.mock.calls[2][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[2][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[2][1]).toBe('SUB_DEVICE_DELETED');
      expect(spy.mock.calls[2][2]).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        name: subDeviceOne.name,
        type: subDeviceOne.type,
      });
    });

    it('should delete sub device and other settings if preferred sub device setting does not exists and then send notification', async () => {
      await insertSubDevices([subDeviceTwo]);
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree]);
      await insertSettings([settingTwo, settingThree]);
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');

      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}`;
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbSettings = await Setting.find({
        type: settingType[0],
        idType: idType[0],
        bindedTo: deviceOne.deviceId,
      });
      expect(dbSettings).toBeDefined();
      expect(dbSettings).toBeInstanceOf(Array);
      expect(dbSettings.length).toBe(0);

      // Notifications
      expect(spy).toHaveBeenCalledTimes(2);

      // First Notification
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][0].length).toBe(2);
      expect(spy.mock.calls[0][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[0][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[0][1]).toBe('DEVICE_MULTI_SETTING_DELETED');
      expect(spy.mock.calls[0][2]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][2].length).toBe(2);
      expect(spy.mock.calls[0][2][0]).toMatchObject({
        type: settingTwo.type,
        idType: settingTwo.idType,
        paramName: settingTwo.paramName,
        paramValue: settingTwo.paramValue,
      });
      expect(spy.mock.calls[0][2][1]).toMatchObject({
        type: settingThree.type,
        idType: settingThree.idType,
        paramName: settingThree.paramName,
        paramValue: settingThree.paramValue,
      });

      // Third Notification
      expect(spy.mock.calls[1][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][0].length).toBe(2);
      expect(spy.mock.calls[1][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[1][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[1][1]).toBe('SUB_DEVICE_DELETED');
      expect(spy.mock.calls[1][2]).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        name: subDeviceOne.name,
        type: subDeviceOne.type,
      });
    });

    it('should delete sub device and should not delete other settings if they dont exists and finally send notification', async () => {
      await insertSubDevices([subDeviceTwo]);
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree]);
      await insertSettings([settingOne]);
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');

      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}`;
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbSetting = await Setting.findOne({
        type: settingType[0],
        idType: idType[0],
        bindedTo: deviceOne.deviceId,
        paramName: 'preferredSubDevice',
        isDisabled: false,
      });
      expect(dbSetting).toBeDefined();
      expect(dbSetting).toBeInstanceOf(Object);
      expect(dbSetting.isDisabled).toBe(false);
      expect(dbSetting.type).toBe(settingType[0]);
      expect(dbSetting.idType).toBe(idType[0]);
      expect(dbSetting.bindedTo).toBe(deviceOne.deviceId);
      expect(dbSetting.paramName).toBe('preferredSubDevice');
      expect(dbSetting.paramValue).toBe(subDeviceTwo.subDeviceId);

      // Notifications
      expect(spy).toHaveBeenCalledTimes(2);

      // First Notification
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][0].length).toBe(2);
      expect(spy.mock.calls[0][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[0][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[0][1]).toBe('DEVICE_SETTING_UPDATED');
      expect(spy.mock.calls[0][2]).toMatchObject({
        type: settingType[0],
        idType: idType[0],
        bindedTo: deviceOne.deviceId,
        paramName: 'preferredSubDevice',
        isDisabled: false,
        updatedBy: admin.email,
      });

      // second Notification
      expect(spy.mock.calls[1][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][0].length).toBe(2);
      expect(spy.mock.calls[1][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[1][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[1][1]).toBe('SUB_DEVICE_DELETED');
      expect(spy.mock.calls[1][2]).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        name: subDeviceOne.name,
        type: subDeviceOne.type,
      });
    });

    it('should delete sub device and all non preferred sub device settings sub device and send notification if device has only one sub device', async () => {
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamThree]);
      await insertSettings([settingOne, settingTwo, settingThree]);
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');

      route = `/v1/devices/${deviceOne.deviceId}/sub-devices/${subDeviceOne.subDeviceId}`;
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbSettings = await Setting.find({
        type: settingType[0],
        idType: idType[0],
        bindedTo: deviceOne.deviceId,
      });
      expect(dbSettings).toBeDefined();
      expect(dbSettings).toBeInstanceOf(Array);
      expect(dbSettings.length).toBe(0);

      // Notifications
      expect(spy).toHaveBeenCalledTimes(2);

      // // First Notification
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][0].length).toBe(2);
      expect(spy.mock.calls[0][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[0][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[0][1]).toBe('DEVICE_MULTI_SETTING_DELETED');
      expect(spy.mock.calls[0][2]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][2].length).toBe(3);
      expect(spy.mock.calls[0][2][0]).toMatchObject({
        type: settingOne.type,
        idType: settingOne.idType,
        bindedTo: settingOne.bindedTo,
        paramName: settingOne.paramName,
        paramValue: settingOne.paramValue,
      });

      expect(spy.mock.calls[0][2][1]).toMatchObject({
        type: settingTwo.type,
        idType: settingTwo.idType,
        bindedTo: settingTwo.bindedTo,
        paramName: settingTwo.paramName,
        paramValue: settingTwo.paramValue,
      });

      expect(spy.mock.calls[0][2][2]).toMatchObject({
        type: settingThree.type,
        idType: settingThree.idType,
        bindedTo: settingThree.bindedTo,
        paramName: settingThree.paramName,
        paramValue: settingThree.paramValue,
      });

      // second Notification
      expect(spy.mock.calls[1][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][0].length).toBe(2);
      expect(spy.mock.calls[1][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[1][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[1][1]).toBe('SUB_DEVICE_DELETED');
      expect(spy.mock.calls[1][2]).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        name: subDeviceOne.name,
        type: subDeviceOne.type,
      });
    });

    it('should just delete sub device and send notification if device is smartSwitch and has no settings', async () => {
      await insertDevices([deviceTwo]);
      await insertSubDevices([subDeviceThree, subDeviceFour]);
      await insertSubDeviceParams([subDeviceParamFour, subDeviceParamFive]);
      await insertSocketIds([socketIdTwo, socketIdFour, socketIdSix]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');

      route = `/v1/devices/${deviceTwo.deviceId}/sub-devices/${subDeviceThree.subDeviceId}`;
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbSetting = await Setting.find({
        type: settingType[1],
        idType: idType[1],
        bindedTo: subDeviceThree.subDeviceId,
      });
      expect(dbSetting).toBeInstanceOf(Array);
      expect(dbSetting.length).toBe(0);

      // Notifications
      expect(spy).toHaveBeenCalledTimes(1);

      // First Notification
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][0].length).toBe(2);
      expect(spy.mock.calls[0][0][0].socketId).toBe(socketIdSix.socketId);
      expect(spy.mock.calls[0][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[0][1]).toBe('SUB_DEVICE_DELETED');
      expect(spy.mock.calls[0][2]).toMatchObject({
        deviceId: deviceTwo.deviceId,
        subDeviceId: subDeviceThree.subDeviceId,
        type: subDeviceThree.type,
        name: subDeviceThree.name,
      });
    });

    it('should delete sub device and its settings and send notification if device is smartSwitch', async () => {
      await insertDevices([deviceTwo]);
      await insertSubDevices([subDeviceThree]);
      await insertSettings([settingFour]);
      await insertSubDeviceParams([subDeviceParamFour]);
      await insertSocketIds([socketIdTwo, socketIdFour, socketIdSix]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');

      route = `/v1/devices/${deviceTwo.deviceId}/sub-devices/${subDeviceThree.subDeviceId}`;
      await request(app)
        .delete(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbSetting = await Setting.find({
        type: settingType[1],
        idType: idType[1],
        bindedTo: subDeviceThree.subDeviceId,
      });
      expect(dbSetting).toBeInstanceOf(Array);
      expect(dbSetting.length).toBe(0);

      // Notifications
      expect(spy).toHaveBeenCalledTimes(2);

      // First Notification
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][0].length).toBe(2);
      expect(spy.mock.calls[0][0][0].socketId).toBe(socketIdSix.socketId);
      expect(spy.mock.calls[0][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[0][1]).toBe('SUB_DEVICE_MULTI_SETTING_DELETED');
      expect(spy.mock.calls[0][2]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][2].length).toBe(1);
      expect(spy.mock.calls[0][2][0]).toMatchObject({
        type: settingFour.type,
        idType: settingFour.idType,
        bindedTo: subDeviceThree.subDeviceId,
        paramName: settingFour.paramName,
        parent: deviceTwo.deviceId,
      });

      // second Notification
      expect(spy.mock.calls[1][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][0].length).toBe(2);
      expect(spy.mock.calls[1][0][0].socketId).toBe(socketIdSix.socketId);
      expect(spy.mock.calls[1][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[1][1]).toBe('SUB_DEVICE_DELETED');
      expect(spy.mock.calls[1][2]).toMatchObject({
        deviceId: subDeviceThree.deviceId,
        subDeviceId: subDeviceThree.subDeviceId,
        name: subDeviceThree.name,
        type: subDeviceThree.type,
      });
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

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('subDeviceId');
      expect(res.body).toMatchObject({
        deviceId: deviceOne.deviceId,
        name: updateBody.name,
        type: updateBody.type,
        isDisabled: true,
      });

      const dbSubDevice = await SubDevice.findById(res.body.id);
      expect(dbSubDevice).toBeDefined();
      expect(dbSubDevice.subDeviceId).toBeDefined();
      expect(dbSubDevice.subDeviceId.length).toBeGreaterThanOrEqual(10);
      expect(dbSubDevice.subDeviceId.length).toBeLessThanOrEqual(20);
      expect(dbSubDevice).toMatchObject({
        deviceId: deviceOne.deviceId,
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
      expect(dbSubDeviceParamOne.subDeviceId).toBe(subDeviceParamOne.subDeviceId);

      const dbSubDeviceParamThree = await SubDeviceParam.findById(subDeviceParamThree._id);
      expect(dbSubDeviceParamThree).toBeDefined();
      expect(dbSubDeviceParamThree.subDeviceId).toBe(subDeviceParamThree.subDeviceId);
    });

    it('should update sub device and if in settings, preferred Device is that sub device, then it should change the preferred device to remaining sub device if sub device is disabled and send notification', async () => {
      await insertSubDevices([subDeviceTwo]);
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamThree]);
      await insertSettings([settingOne, settingTwo, settingThree]);
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');

      updateBody.isDisabled = true;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const dbSetting = await Setting.findOne({
        type: settingType[0],
        idType: idType[0],
        bindedTo: deviceOne.deviceId,
        paramName: 'preferredSubDevice',
        isDisabled: false,
      });
      expect(dbSetting).toBeDefined();
      expect(dbSetting).toBeInstanceOf(Object);
      expect(dbSetting.isDisabled).toBe(false);
      expect(dbSetting.type).toBe(settingType[0]);
      expect(dbSetting.idType).toBe(idType[0]);
      expect(dbSetting.bindedTo).toBe(deviceOne.deviceId);
      expect(dbSetting.paramName).toBe('preferredSubDevice');
      expect(dbSetting.paramValue).toBe(subDeviceTwo.subDeviceId);

      // Notifications
      expect(spy).toHaveBeenCalledTimes(3);

      // First Notification
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][0].length).toBe(2);
      expect(spy.mock.calls[0][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[0][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[0][1]).toBe('DEVICE_SETTING_UPDATED');
      expect(spy.mock.calls[0][2]).toMatchObject({
        type: settingType[0],
        idType: idType[0],
        bindedTo: deviceOne.deviceId,
        paramName: 'preferredSubDevice',
        isDisabled: false,
        updatedBy: admin.email,
      });

      // second Notification
      expect(spy.mock.calls[1][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][0].length).toBe(2);
      expect(spy.mock.calls[1][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[1][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[1][1]).toBe('DEVICE_MULTI_SETTING_UPDATED');
      expect(spy.mock.calls[1][2]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][2].length).toBe(2);
      expect(spy.mock.calls[1][2][0]).toMatchObject({
        type: settingTwo.type,
        idType: settingTwo.idType,
        paramName: settingTwo.paramName,
        paramValue: settingTwo.paramValue,
        isDisabled: true,
      });
      expect(spy.mock.calls[1][2][1]).toMatchObject({
        type: settingThree.type,
        idType: settingThree.idType,
        paramName: settingThree.paramName,
        paramValue: settingThree.paramValue,
        isDisabled: true,
      });

      // Third Notification
      expect(spy.mock.calls[2][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[2][0].length).toBe(2);
      expect(spy.mock.calls[2][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[2][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[2][1]).toBe('SUB_DEVICE_UPDATED');
      expect(spy.mock.calls[2][2]).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        name: updateBody.name,
        type: updateBody.type,
        isDisabled: true,
      });
    });

    it('should update sub device and if in settings, preferred Device is that sub device, then it should change the preferred device to remaining sub device if sub device is disabled is false and send notification', async () => {
      await insertSubDevices([subDeviceTwo]);
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamThree]);
      await insertSettings([settingOne, settingTwo, settingThree]);
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');

      updateBody.isDisabled = false;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const dbSetting = await Setting.findOne({
        type: settingType[0],
        idType: idType[0],
        bindedTo: deviceOne.deviceId,
        paramName: 'preferredSubDevice',
        isDisabled: false,
      });
      expect(dbSetting).toBeDefined();
      expect(dbSetting).toBeInstanceOf(Object);
      expect(dbSetting.isDisabled).toBe(false);
      expect(dbSetting.type).toBe(settingType[0]);
      expect(dbSetting.idType).toBe(idType[0]);
      expect(dbSetting.bindedTo).toBe(deviceOne.deviceId);
      expect(dbSetting.paramName).toBe('preferredSubDevice');
      expect(dbSetting.paramValue).toBe(subDeviceOne.subDeviceId);

      // Notifications
      expect(spy).toHaveBeenCalledTimes(2);

      // First Notification
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][0].length).toBe(2);
      expect(spy.mock.calls[0][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[0][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[0][1]).toBe('DEVICE_MULTI_SETTING_UPDATED');
      expect(spy.mock.calls[0][2]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][2].length).toBe(2);
      expect(spy.mock.calls[0][2][0]).toMatchObject({
        type: settingTwo.type,
        idType: settingTwo.idType,
        paramName: settingTwo.paramName,
        paramValue: settingTwo.paramValue,
        isDisabled: false,
      });
      expect(spy.mock.calls[0][2][1]).toMatchObject({
        type: settingThree.type,
        idType: settingThree.idType,
        paramName: settingThree.paramName,
        paramValue: settingThree.paramValue,
        isDisabled: false,
      });

      // Third Notification
      expect(spy.mock.calls[1][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][0].length).toBe(2);
      expect(spy.mock.calls[1][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[1][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[1][1]).toBe('SUB_DEVICE_UPDATED');
      expect(spy.mock.calls[1][2]).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        name: updateBody.name,
        type: updateBody.type,
        isDisabled: false,
      });
    });

    it('should update sub device and other settings if preferred sub device setting does not exists and then send notification if sub device is disabled', async () => {
      await insertSubDevices([subDeviceTwo]);
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamThree]);
      await insertSettings([settingTwo, settingThree]);
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');

      updateBody.isDisabled = true;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      // Notifications
      expect(spy).toHaveBeenCalledTimes(2);

      // First Notification
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][0].length).toBe(2);
      expect(spy.mock.calls[0][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[0][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[0][1]).toBe('DEVICE_MULTI_SETTING_UPDATED');
      expect(spy.mock.calls[0][2]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][2].length).toBe(2);
      expect(spy.mock.calls[0][2][0]).toMatchObject({
        type: settingTwo.type,
        idType: settingTwo.idType,
        paramName: settingTwo.paramName,
        paramValue: settingTwo.paramValue,
        isDisabled: true,
      });
      expect(spy.mock.calls[0][2][1]).toMatchObject({
        type: settingThree.type,
        idType: settingThree.idType,
        paramName: settingThree.paramName,
        paramValue: settingThree.paramValue,
        isDisabled: true,
      });

      // Second Notification
      expect(spy.mock.calls[1][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][0].length).toBe(2);
      expect(spy.mock.calls[1][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[1][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[1][1]).toBe('SUB_DEVICE_UPDATED');
      expect(spy.mock.calls[1][2]).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        name: updateBody.name,
        type: updateBody.type,
        isDisabled: true,
      });
    });

    it('should update sub device and should not update other settings if they dont exists and finally send notification if sub device is disabled', async () => {
      await insertSubDevices([subDeviceTwo]);
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamThree]);
      await insertSettings([settingOne]);
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');

      updateBody.isDisabled = true;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      // Notifications
      expect(spy).toHaveBeenCalledTimes(2);

      // First Notification
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][0].length).toBe(2);
      expect(spy.mock.calls[0][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[0][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[0][1]).toBe('DEVICE_SETTING_UPDATED');
      expect(spy.mock.calls[0][2]).toMatchObject({
        type: settingType[0],
        idType: idType[0],
        bindedTo: deviceOne.deviceId,
        paramName: 'preferredSubDevice',
        isDisabled: false,
        updatedBy: admin.email,
      });

      // Second Notification
      expect(spy.mock.calls[1][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][0].length).toBe(2);
      expect(spy.mock.calls[1][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[1][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[1][1]).toBe('SUB_DEVICE_UPDATED');
      expect(spy.mock.calls[1][2]).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        name: updateBody.name,
        type: updateBody.type,
        isDisabled: true,
      });
    });

    it('should update sub device and all non preferred sub device settings and send notification if device has only one sub device if sub device is disabled', async () => {
      await insertSubDeviceParams([subDeviceParamOne, subDeviceParamThree]);
      await insertSettings([settingOne, settingTwo, settingThree]);
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');

      updateBody.isDisabled = true;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      // Notifications
      expect(spy).toHaveBeenCalledTimes(3);

      // First Notification
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][0].length).toBe(2);
      expect(spy.mock.calls[0][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[0][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[0][1]).toBe('DEVICE_SETTING_UPDATED');
      expect(spy.mock.calls[0][2]).toMatchObject({
        type: settingType[0],
        idType: idType[0],
        bindedTo: deviceOne.deviceId,
        paramName: 'preferredSubDevice',
        isDisabled: false,
        updatedBy: admin.email,
      });

      // Second Notification
      expect(spy.mock.calls[1][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][0].length).toBe(2);
      expect(spy.mock.calls[1][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[1][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[1][1]).toBe('DEVICE_MULTI_SETTING_UPDATED');
      expect(spy.mock.calls[1][2]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][2].length).toBe(2);
      expect(spy.mock.calls[1][2][0]).toMatchObject({
        type: settingTwo.type,
        idType: settingTwo.idType,
        paramName: settingTwo.paramName,
        paramValue: settingTwo.paramValue,
        isDisabled: true,
      });
      expect(spy.mock.calls[1][2][1]).toMatchObject({
        type: settingThree.type,
        idType: settingThree.idType,
        paramName: settingThree.paramName,
        paramValue: settingThree.paramValue,
        isDisabled: true,
      });

      // Third Notification
      expect(spy.mock.calls[2][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[2][0].length).toBe(2);
      expect(spy.mock.calls[2][0][0].socketId).toBe(socketIdTwo.socketId);
      expect(spy.mock.calls[2][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[2][1]).toBe('SUB_DEVICE_UPDATED');
      expect(spy.mock.calls[2][2]).toMatchObject({
        deviceId: deviceOne.deviceId,
        subDeviceId: subDeviceOne.subDeviceId,
        name: updateBody.name,
        type: updateBody.type,
        isDisabled: true,
      });
    });

    it('should just update sub device and send notification if device is smartSwitch and has no settings if sub device is disabled', async () => {
      await insertDevices([deviceTwo]);
      await insertSubDevices([subDeviceThree, subDeviceFour]);
      await insertSubDeviceParams([subDeviceParamFour, subDeviceParamFive]);
      await insertSocketIds([socketIdTwo, socketIdFour, socketIdSix]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      route = `/v1/devices/${deviceTwo.deviceId}/sub-devices/${subDeviceThree.subDeviceId}`;

      updateBody.isDisabled = true;
      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const dbSetting = await Setting.find({
        type: settingType[1],
        idType: idType[1],
        bindedTo: subDeviceThree.subDeviceId,
      });
      expect(dbSetting).toBeInstanceOf(Array);
      expect(dbSetting.length).toBe(0);

      // Notifications
      expect(spy).toHaveBeenCalledTimes(1);

      // First Notification
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][0].length).toBe(2);
      expect(spy.mock.calls[0][0][0].socketId).toBe(socketIdSix.socketId);
      expect(spy.mock.calls[0][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[0][1]).toBe('SUB_DEVICE_UPDATED');
      expect(spy.mock.calls[0][2]).toMatchObject({
        deviceId: deviceTwo.deviceId,
        subDeviceId: subDeviceThree.subDeviceId,
        type: subDeviceThree.type,
        name: updateBody.name,
        isDisabled: true,
      });
    });

    it('should update sub device and its settings and send notification if device is smartSwitch if sub device is disabled', async () => {
      await insertDevices([deviceTwo]);
      await insertSubDevices([subDeviceThree]);
      await insertSettings([settingFour]);
      await insertSubDeviceParams([subDeviceParamFour]);
      await insertSocketIds([socketIdTwo, socketIdFour, socketIdSix]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');

      route = `/v1/devices/${deviceTwo.deviceId}/sub-devices/${subDeviceThree.subDeviceId}`;

      updateBody.isDisabled = true;

      await request(app)
        .patch(route)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const dbSetting = await Setting.find({
        type: settingType[1],
        idType: idType[1],
        bindedTo: subDeviceThree.subDeviceId,
      });
      expect(dbSetting).toBeInstanceOf(Array);
      expect(dbSetting.length).toBe(1);
      expect(dbSetting[0].isDisabled).toBe(true);

      // Notifications
      expect(spy).toHaveBeenCalledTimes(2);

      // First Notification
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][0].length).toBe(2);
      expect(spy.mock.calls[0][0][0].socketId).toBe(socketIdSix.socketId);
      expect(spy.mock.calls[0][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[0][1]).toBe('SUB_DEVICE_MULTI_SETTING_UPDATED');
      expect(spy.mock.calls[0][2]).toBeInstanceOf(Array);
      expect(spy.mock.calls[0][2].length).toBe(1);
      expect(spy.mock.calls[0][2][0]).toMatchObject({
        type: settingFour.type,
        idType: settingFour.idType,
        bindedTo: subDeviceThree.subDeviceId,
        paramName: settingFour.paramName,
        parent: deviceTwo.deviceId,
        isDisabled: true,
      });

      // second Notification
      expect(spy.mock.calls[1][0]).toBeInstanceOf(Array);
      expect(spy.mock.calls[1][0].length).toBe(2);
      expect(spy.mock.calls[1][0][0].socketId).toBe(socketIdSix.socketId);
      expect(spy.mock.calls[1][0][1].socketId).toBe(socketIdFour.socketId);
      expect(spy.mock.calls[1][1]).toBe('SUB_DEVICE_UPDATED');
      expect(spy.mock.calls[1][2]).toMatchObject({
        deviceId: subDeviceThree.deviceId,
        subDeviceId: subDeviceThree.subDeviceId,
        name: updateBody.name,
        type: subDeviceThree.type,
        isDisabled: true,
      });
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
