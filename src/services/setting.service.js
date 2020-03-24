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

const getActiveSettingsByDeviceIdsService = deviceIds =>
  Setting.find({ type: 'device', idType: 'deviceId', bindedTo: { $in: deviceIds }, isDisabled: false });

const getActiveSettingsBySubDeviceIdsService = async subDevices => {
  const subDeviceIds = subDevices.map(subDevice => subDevice.subDeviceId);
  return Setting.find({ type: 'subDevice', idType: 'subDeviceId', bindedTo: { $in: subDeviceIds }, isDisabled: false });
};

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
  getActiveSettingsByDeviceIdsService,
  getActiveSettingsBySubDeviceIdsService,
};
