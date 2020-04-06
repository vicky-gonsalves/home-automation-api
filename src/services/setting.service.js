import Setting from '../models/setting.model';
import { defaultSettings } from '../config/config';
import AppError from '../utils/AppError';
import httpStatus from 'http-status';

const createDeviceSettingPayload = (bindedTo, paramName, paramValue, createdBy) => ({
  type: 'device',
  idType: 'deviceId',
  bindedTo,
  paramName,
  paramValue,
  createdBy,
});

const createSubDeviceSettingPayload = (bindedTo, paramName, paramValue, parent, createdBy) => ({
  type: 'subDevice',
  idType: 'subDeviceId',
  parent,
  bindedTo,
  paramName,
  paramValue,
  createdBy,
});

const createSettings = settings => Setting.create(settings);

const getActiveSettingsByDeviceIdsService = deviceIds =>
  Setting.find({ type: 'device', idType: 'deviceId', bindedTo: { $in: deviceIds }, isDisabled: false });

const checkIfSettingExists = (deviceId, paramName) =>
  Setting.findOne({ type: 'device', idType: 'deviceId', bindedTo: deviceId, paramName });

const checkIfSubDeviceSettingExists = (subDeviceId, paramName, parent) =>
  Setting.findOne({ type: 'subDevice', idType: 'subDeviceId', bindedTo: subDeviceId, paramName, parent });

const getActiveSettingsBySubDeviceIdsService = async subDevices => {
  const subDeviceIds = subDevices.map(subDevice => subDevice.subDeviceId);
  return Setting.find({ type: 'subDevice', idType: 'subDeviceId', bindedTo: { $in: subDeviceIds }, isDisabled: false });
};

const getPreferredSubDeviceService = (deviceId, subDeviceId) =>
  Setting.findOne({
    type: 'device',
    idType: 'deviceId',
    bindedTo: deviceId,
    paramName: 'preferredSubDevice',
    paramValue: subDeviceId,
  });

const getSettingService = async setting => {
  const _setting = await Setting.findOne(setting);
  if (!_setting) {
    throw new AppError(httpStatus.NOT_FOUND, 'No setting found');
  }
  return _setting;
};

const createTankSettingService = async subDevice => {
  const payload = [];
  // create preferredSubDevice setting
  const preferredSubDeviceExists = await checkIfSettingExists(subDevice.deviceId, 'preferredSubDevice');
  if (!preferredSubDeviceExists) {
    payload.push(
      createDeviceSettingPayload(subDevice.deviceId, 'preferredSubDevice', subDevice.subDeviceId, subDevice.createdBy)
    );
  }

  // create autoShutDownTime setting
  const autoShutDownTimeExists = await checkIfSettingExists(subDevice.deviceId, 'autoShutDownTime');
  if (!autoShutDownTimeExists) {
    payload.push(
      createDeviceSettingPayload(
        subDevice.deviceId,
        'autoShutDownTime',
        defaultSettings.defaultSubDeviceAutoShutDownTime,
        subDevice.createdBy
      )
    );
  }

  // create waterLevelToStart setting
  const waterLevelToStartExists = await checkIfSettingExists(subDevice.deviceId, 'waterLevelToStart');
  if (!waterLevelToStartExists) {
    payload.push(
      createDeviceSettingPayload(
        subDevice.deviceId,
        'waterLevelToStart',
        defaultSettings.defaultTankWaterLevelToStart,
        subDevice.createdBy
      )
    );
  }
  if (payload && payload.length) {
    return createSettings(payload);
  }
  return null;
};

const createSmartSwitchSettingService = async subDevice => {
  const payload = [];

  // create autoShutDownTime setting
  const autoShutDownTimeExists = await checkIfSubDeviceSettingExists(
    subDevice.subDeviceId,
    'autoShutDownTime',
    subDevice.deviceId
  );
  if (!autoShutDownTimeExists) {
    payload.push(
      createSubDeviceSettingPayload(subDevice.subDeviceId, 'autoShutDownTime', 0, subDevice.deviceId, subDevice.createdBy)
    );
  }
  if (payload && payload.length) {
    return createSettings(payload);
  }
  return null;
};

const updateSettingService = async (setting, updatedSetting) => {
  const _setting = await getSettingService({
    type: setting.type,
    idType: setting.idType,
    bindedTo: setting.bindedTo,
    paramName: setting.paramName,
    isDisabled: false,
  });
  await Object.assign(_setting, updatedSetting);
  await _setting.save();
  return _setting;
};

const updateSubDeviceSettingService = async (parent, subDeviceId, isDisabled, updatedBy) => {
  const settings = await Setting.find({
    type: 'subDevice',
    idType: 'subDeviceId',
    parent,
    bindedTo: subDeviceId,
  });
  return Promise.all(
    settings.map(async _setting => {
      await Object.assign(_setting, { isDisabled, updatedBy });
      await _setting.save();
      return _setting;
    })
  );
};

const deleteDeviceSettingService = async deviceId => {
  const settings = await Setting.find({
    type: 'device',
    idType: 'deviceId',
    bindedTo: deviceId,
  });
  return Promise.all(settings.map(_setting => _setting.remove()));
};

const toggleDeviceSettingService = async (setting, isDisabled, updatedBy) => {
  const _setting = await getSettingService({
    type: setting.type,
    idType: setting.idType,
    bindedTo: setting.bindedTo,
    paramName: setting.paramName,
  });
  await Object.assign(_setting, { isDisabled, updatedBy });
  await _setting.save();
  return _setting;
};

const deleteNonPreferredSubDeviceSettingService = async deviceId => {
  const settings = await Setting.find({
    type: 'device',
    idType: 'deviceId',
    bindedTo: deviceId,
    paramName: { $ne: 'preferredSubDevice' },
  });
  return Promise.all(settings.map(_setting => _setting.remove()));
};

const updateNonPreferredSubDeviceSettingService = async (deviceId, subDeviceId, isDisabled, updatedBy) => {
  const settings = await Setting.find({
    type: 'device',
    idType: 'deviceId',
    bindedTo: deviceId,
    paramName: { $ne: 'preferredSubDevice' },
  });
  return Promise.all(
    settings.map(async _setting => {
      await Object.assign(_setting, { isDisabled, updatedBy });
      await _setting.save();
      return _setting;
    })
  );
};

const deleteSubDeviceSettingService = async (parent, subDeviceId) => {
  const settings = await Setting.find({
    type: 'subDevice',
    idType: 'subDeviceId',
    parent,
    bindedTo: subDeviceId,
  });
  return Promise.all(settings.map(_setting => _setting.remove()));
};

module.exports = {
  createTankSettingService,
  createSmartSwitchSettingService,
  updateSettingService,
  getActiveSettingsByDeviceIdsService,
  getActiveSettingsBySubDeviceIdsService,
  getPreferredSubDeviceService,
  deleteDeviceSettingService,
  toggleDeviceSettingService,
  deleteNonPreferredSubDeviceSettingService,
  deleteSubDeviceSettingService,
  updateNonPreferredSubDeviceSettingService,
  updateSubDeviceSettingService,
};
