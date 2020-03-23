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

const createSubDeviceSettingPayload = (bindedTo, paramName, paramValue, createdBy) => ({
  type: 'subDevice',
  idType: 'subDeviceId',
  bindedTo,
  paramName,
  paramValue,
  createdBy,
});

const createSettings = settings => Setting.create(settings);

// const getDeviceSettingService = async (bindedTo, paramName) =>
//   Setting.findOne({ type: 'device', idType: 'deviceId', bindedTo, paramName });
//
// const getSubDeviceSettingService = async (bindedTo, paramName) =>
//   Setting.findOne({ type: 'subDevice', idType: 'subDeviceId', bindedTo, paramName });

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
  payload.push(
    createDeviceSettingPayload(subDevice.deviceId, 'preferredSubDevice', subDevice.subDeviceId, subDevice.createdBy)
  );

  // create autoShutDownTime setting
  payload.push(
    createSubDeviceSettingPayload(
      subDevice.subDeviceId,
      'autoShutDownTime',
      defaultSettings.defaultSubDeviceAutoShutDownTime,
      subDevice.createdBy
    )
  );

  // create waterLevelToStart setting
  payload.push(
    createSubDeviceSettingPayload(
      subDevice.subDeviceId,
      'waterLevelToStart',
      defaultSettings.defaultTankWaterLevelToStart,
      subDevice.createdBy
    )
  );
  return createSettings(payload);
};

const createSmartSwitchSettingService = async subDevice => {
  const payload = [];

  // create autoShutDownTime setting
  payload.push(createSubDeviceSettingPayload(subDevice.subDeviceId, 'autoShutDownTime', 0, subDevice.createdBy));
  return createSettings(payload);
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

module.exports = {
  createTankSettingService,
  createSmartSwitchSettingService,
  updateSettingService,
};
