import { admin, insertUsers, userOne } from '../fixtures/user.fixture';
import { deviceFour, deviceOne, deviceTwo, insertDevices } from '../fixtures/device.fixture';
import { insertSubDevices, subDeviceFive, subDeviceOne, subDeviceThree } from '../fixtures/subDevice.fixture';
import { insertSettings, settingFive, settingFour, settingOne, settingTwo, settingThree } from '../fixtures/setting.fixture';
import request from 'supertest';
import app from '../../src/app';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import httpStatus from 'http-status';
import Setting from '../../src/models/setting.model';
import { setupTestDB } from '../utils/setupTestDB';
import { accessFive, accessOne, insertSharedDeviceAccess } from '../fixtures/sharedDeviceAccess.fixture';
import { insertSocketIds, socketIdFour, socketIdTwo } from '../fixtures/socketId.fixture';
import NotificationService from '../../src/services/notification.service';

setupTestDB();

describe('Settings Route', () => {
  let route;
  let updateBodyOne;
  let updateBodyTwo;
  let updateBodyThree;
  describe('PATCH /v1/settings', () => {
    beforeEach(() => {
      route = '/v1/settings';
      updateBodyOne = {
        type: 'device',
        idType: 'deviceId',
        bindedTo: settingOne.bindedTo,
        paramName: 'preferredSubDevice',
        paramValue: 'sub_tank000000000001',
      };
      updateBodyTwo = {
        type: 'subDevice',
        idType: 'subDeviceId',
        bindedTo: settingFour.bindedTo,
        paramName: 'autoShutDownTime',
        paramValue: 15,
      };
      updateBodyThree = {
        type: 'subDevice',
        idType: 'subDeviceId',
        bindedTo: settingFive.bindedTo,
        paramName: 'autoShutDownTime',
        paramValue: 15,
      };
    });

    it('should return 200 and successfully update setting of device if data is ok and user role is admin', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne]);
      await insertSettings([settingOne]);

      const res = await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('type');
      expect(res.body).toHaveProperty('idType');
      expect(res.body).toHaveProperty('bindedTo');
      expect(res.body).toHaveProperty('paramName');
      expect(res.body).toHaveProperty('paramValue');
      expect(res.body).toMatchObject({
        ...updateBodyOne,
        isDisabled: false,
        updatedBy: admin.email,
      });

      const dbSetting = await Setting.findOne({
        type: 'device',
        idType: 'deviceId',
        bindedTo: settingOne.bindedTo,
        paramName: 'preferredSubDevice',
      });
      expect(dbSetting).toBeDefined();
      expect(dbSetting.type).toBeDefined();
      expect(dbSetting.idType).toBeDefined();
      expect(dbSetting.bindedTo).toBeDefined();
      expect(dbSetting.paramName).toBeDefined();
      expect(dbSetting.paramValue).toBeDefined();
      expect(dbSetting).toMatchObject({
        ...updateBodyOne,
        isDisabled: false,
        updatedBy: admin.email,
      });
    });

    it('should return 200 and successfully update setting of subDevice if data is ok and if user role is admin', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceTwo]);
      await insertSubDevices([subDeviceThree]);
      await insertSettings([settingFour]);

      const res = await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyTwo)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('type');
      expect(res.body).toHaveProperty('idType');
      expect(res.body).toHaveProperty('bindedTo');
      expect(res.body).toHaveProperty('paramName');
      expect(res.body).toHaveProperty('paramValue');
      expect(res.body).toMatchObject({
        ...updateBodyTwo,
        isDisabled: false,
        updatedBy: admin.email,
      });

      const dbSetting = await Setting.findOne({
        type: 'subDevice',
        idType: 'subDeviceId',
        bindedTo: settingFour.bindedTo,
        paramName: 'autoShutDownTime',
      });
      expect(dbSetting).toBeDefined();
      expect(dbSetting.type).toBeDefined();
      expect(dbSetting.idType).toBeDefined();
      expect(dbSetting.bindedTo).toBeDefined();
      expect(dbSetting.paramName).toBeDefined();
      expect(dbSetting.paramValue).toBeDefined();
      expect(dbSetting).toMatchObject({
        ...updateBodyTwo,
        isDisabled: false,
        updatedBy: admin.email,
      });
    });

    it('should return 200 and successfully update setting of device if data is ok and user role is user', async () => {
      await insertUsers([userOne]);
      await insertDevices([deviceTwo]);
      await insertSubDevices([subDeviceThree]);
      await insertSettings([settingFour]);

      const res = await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBodyTwo)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('type');
      expect(res.body).toHaveProperty('idType');
      expect(res.body).toHaveProperty('bindedTo');
      expect(res.body).toHaveProperty('paramName');
      expect(res.body).toHaveProperty('paramValue');
      expect(res.body).toMatchObject({
        ...updateBodyTwo,
        isDisabled: false,
        updatedBy: userOne.email,
      });

      const dbSetting = await Setting.findOne({
        type: 'subDevice',
        idType: 'subDeviceId',
        bindedTo: settingFour.bindedTo,
        paramName: 'autoShutDownTime',
      });
      expect(dbSetting).toBeDefined();
      expect(dbSetting.type).toBeDefined();
      expect(dbSetting.idType).toBeDefined();
      expect(dbSetting.bindedTo).toBeDefined();
      expect(dbSetting.paramName).toBeDefined();
      expect(dbSetting.paramValue).toBeDefined();
      expect(dbSetting).toMatchObject({
        ...updateBodyTwo,
        isDisabled: false,
        updatedBy: userOne.email,
      });
    });

    it('should return 200 and successfully update setting if data is ok and user role is user', async () => {
      await insertUsers([userOne]);
      await insertDevices([deviceTwo]);
      await insertSubDevices([subDeviceThree]);
      await insertSettings([settingFour]);

      const res = await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBodyTwo)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('type');
      expect(res.body).toHaveProperty('idType');
      expect(res.body).toHaveProperty('bindedTo');
      expect(res.body).toHaveProperty('paramName');
      expect(res.body).toHaveProperty('paramValue');
      expect(res.body).toMatchObject({
        ...updateBodyTwo,
        isDisabled: false,
        updatedBy: userOne.email,
      });

      const dbSetting = await Setting.findOne({
        type: 'subDevice',
        idType: 'subDeviceId',
        bindedTo: settingFour.bindedTo,
        paramName: 'autoShutDownTime',
      });
      expect(dbSetting).toBeDefined();
      expect(dbSetting.type).toBeDefined();
      expect(dbSetting.idType).toBeDefined();
      expect(dbSetting.bindedTo).toBeDefined();
      expect(dbSetting.paramName).toBeDefined();
      expect(dbSetting.paramValue).toBeDefined();
      expect(dbSetting).toMatchObject({
        ...updateBodyTwo,
        isDisabled: false,
        updatedBy: userOne.email,
      });
    });

    it('should return 200 and successfully update setting of shared device if data is ok and user role is user', async () => {
      await insertUsers([userOne]);
      await insertDevices([deviceFour]);
      await insertSubDevices([subDeviceFive]);
      await insertSettings([settingFive]);
      await insertSharedDeviceAccess([accessFive]);

      const res = await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBodyThree)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('isDisabled');
      expect(res.body).toHaveProperty('type');
      expect(res.body).toHaveProperty('idType');
      expect(res.body).toHaveProperty('bindedTo');
      expect(res.body).toHaveProperty('paramName');
      expect(res.body).toHaveProperty('paramValue');
      expect(res.body).toMatchObject({
        ...updateBodyThree,
        isDisabled: false,
        updatedBy: userOne.email,
      });

      const dbSetting = await Setting.findOne({
        type: 'subDevice',
        idType: 'subDeviceId',
        bindedTo: settingFive.bindedTo,
        paramName: 'autoShutDownTime',
      });
      expect(dbSetting).toBeDefined();
      expect(dbSetting.type).toBeDefined();
      expect(dbSetting.idType).toBeDefined();
      expect(dbSetting.bindedTo).toBeDefined();
      expect(dbSetting.paramName).toBeDefined();
      expect(dbSetting.paramValue).toBeDefined();
      expect(dbSetting).toMatchObject({
        ...updateBodyThree,
        isDisabled: false,
        updatedBy: userOne.email,
      });
    });

    it('should return 200 and successfully update setting if data is ok and send notification to its users', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne]);
      await insertSettings([settingOne]);
      await insertSharedDeviceAccess([accessOne]);
      await insertSocketIds([socketIdTwo, socketIdFour]);
      const spy = jest.spyOn(NotificationService, 'sendMessage');
      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.OK);
      expect(spy).toBeCalled();
    });

    it('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      await request(app)
        .patch(`${route}`)
        .send(updateBodyOne)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if role is user and have no access to device', async () => {
      await insertUsers([userOne]);
      await insertDevices([deviceFour]);
      await insertSubDevices([subDeviceFive]);
      await insertSettings([settingFive]);

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBodyThree)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 if admin is updating device setting that is not found', async () => {
      updateBodyOne.bindedTo = 'notfoundDevice';
      await insertUsers([admin]);
      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 404 if admin is updating sub-device setting that is not found', async () => {
      updateBodyTwo.bindedTo = 'notfoundDevice';
      await insertUsers([admin]);
      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyTwo)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 404 error if setting not found', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne]);
      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 400 error if deviceId is not valid', async () => {
      await insertUsers([admin]);
      updateBodyTwo.bindedTo = 'invalidid';
      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyTwo)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if type is invalid', async () => {
      await insertUsers([admin]);
      updateBodyOne.type = 'invalid';

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if type is not a string', async () => {
      await insertUsers([admin]);

      updateBodyOne.type = 12121;

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);

      updateBodyOne.type = {};

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if idType is invalid', async () => {
      await insertUsers([admin]);
      updateBodyOne.idType = 'invalid';

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if idType is not a string', async () => {
      await insertUsers([admin]);

      updateBodyOne.idType = 12121;

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);

      updateBodyOne.idType = {};

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if bindedTo is invalid', async () => {
      await insertUsers([admin]);
      updateBodyOne.bindedTo = 'invalid';

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if bindedTo is not a string', async () => {
      await insertUsers([admin]);

      updateBodyOne.bindedTo = 12121;

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);

      updateBodyOne.bindedTo = {};

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName is invalid', async () => {
      await insertUsers([admin]);
      updateBodyOne.paramName = 'invalid@paramName';

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName is missing', async () => {
      await insertUsers([admin]);
      delete updateBodyOne.paramName;

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName is blank', async () => {
      await insertUsers([admin]);
      updateBodyOne.paramName = '';

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName is null', async () => {
      await insertUsers([admin]);
      updateBodyOne.paramName = null;

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName is undefined', async () => {
      await insertUsers([admin]);
      updateBodyOne.paramName = undefined;

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramName is not a string', async () => {
      await insertUsers([admin]);

      updateBodyOne.paramName = 12121;

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);

      updateBodyOne.paramName = {};

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramValue is blank', async () => {
      await insertUsers([admin]);
      updateBodyOne.paramValue = '';

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramValue is missing', async () => {
      await insertUsers([admin]);
      delete updateBodyOne.paramValue;

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramValue is null', async () => {
      await insertUsers([admin]);
      updateBodyOne.paramValue = null;

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if paramValue is undefined', async () => {
      await insertUsers([admin]);
      updateBodyOne.paramValue = undefined;

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 error if isDisabled is not boolean', async () => {
      await insertUsers([admin]);
      updateBodyOne.isDisabled = 'notboolean';

      await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBodyOne)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /v1/settings/multi', () => {
    beforeEach(() => {
      route = '/v1/settings/multi';
      updateBodyOne = {
        type: 'device',
        idType: 'deviceId',
        bindedTo: settingOne.bindedTo,
        paramName: 'preferredSubDevice',
        paramValue: 'sub_tank000000000001',
      };
      updateBodyTwo = {
        type: 'device',
        idType: 'deviceId',
        bindedTo: settingTwo.bindedTo,
        paramName: 'autoShutDownTime',
        paramValue: 30,
      };
      updateBodyThree = {
        type: 'device',
        idType: 'deviceId',
        bindedTo: settingThree.bindedTo,
        paramName: 'waterLevelToStart',
        paramValue: 70,
      };
    });

    it('should return 200 and successfully update multi setting of device if data is ok and user role is admin', async () => {
      await insertUsers([admin]);
      await insertDevices([deviceOne]);
      await insertSubDevices([subDeviceOne]);
      await insertSettings([settingOne, settingTwo, settingThree]);

      const res = await request(app)
        .patch(`${route}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send([updateBodyOne, updateBodyTwo, updateBodyThree])
        .expect(httpStatus.OK);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(3);
      expect(res.body[0]).toHaveProperty('isDisabled');
      expect(res.body[0]).toHaveProperty('type');
      expect(res.body[0]).toHaveProperty('idType');
      expect(res.body[0]).toHaveProperty('bindedTo');
      expect(res.body[0]).toHaveProperty('paramName');
      expect(res.body[0]).toHaveProperty('paramValue');

      expect(res.body[1]).toHaveProperty('isDisabled');
      expect(res.body[1]).toHaveProperty('type');
      expect(res.body[1]).toHaveProperty('idType');
      expect(res.body[1]).toHaveProperty('bindedTo');
      expect(res.body[1]).toHaveProperty('paramName');
      expect(res.body[1]).toHaveProperty('paramValue');

      expect(res.body[2]).toHaveProperty('isDisabled');
      expect(res.body[2]).toHaveProperty('type');
      expect(res.body[2]).toHaveProperty('idType');
      expect(res.body[2]).toHaveProperty('bindedTo');
      expect(res.body[2]).toHaveProperty('paramName');
      expect(res.body[2]).toHaveProperty('paramValue');

      const dbSetting = await Setting.findOne({
        type: 'device',
        idType: 'deviceId',
        bindedTo: settingOne.bindedTo,
        paramName: 'preferredSubDevice',
      });
      expect(dbSetting).toBeDefined();
      expect(dbSetting.type).toBeDefined();
      expect(dbSetting.idType).toBeDefined();
      expect(dbSetting.bindedTo).toBeDefined();
      expect(dbSetting.paramName).toBeDefined();
      expect(dbSetting.paramValue).toBeDefined();
      expect(dbSetting).toMatchObject({
        ...updateBodyOne,
        isDisabled: false,
        updatedBy: admin.email,
      });

      const dbSettingTwo = await Setting.findOne({
        type: 'device',
        idType: 'deviceId',
        bindedTo: settingTwo.bindedTo,
        paramName: 'autoShutDownTime',
      });
      expect(dbSettingTwo).toBeDefined();
      expect(dbSettingTwo.type).toBeDefined();
      expect(dbSettingTwo.idType).toBeDefined();
      expect(dbSettingTwo.bindedTo).toBeDefined();
      expect(dbSettingTwo.paramName).toBeDefined();
      expect(dbSettingTwo.paramValue).toBeDefined();
      expect(dbSettingTwo).toMatchObject({
        ...updateBodyTwo,
        isDisabled: false,
        updatedBy: admin.email,
      });

      const dbSettingThree = await Setting.findOne({
        type: 'device',
        idType: 'deviceId',
        bindedTo: settingThree.bindedTo,
        paramName: 'waterLevelToStart',
      });
      expect(dbSettingThree).toBeDefined();
      expect(dbSettingThree.type).toBeDefined();
      expect(dbSettingThree.idType).toBeDefined();
      expect(dbSettingThree.bindedTo).toBeDefined();
      expect(dbSettingThree.paramName).toBeDefined();
      expect(dbSettingThree.paramValue).toBeDefined();
      expect(dbSettingThree).toMatchObject({
        ...updateBodyThree,
        isDisabled: false,
        updatedBy: admin.email,
      });
    });
  });
});
