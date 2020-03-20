import Setting from '../models/setting.model';
import { defaultSettings } from '../config/config';

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

// const updateTankSettingService = async subDevice => {
//   const payload = [];
//   let skip = 0;
//   // create preferredSubDevice setting
//   const preferredSubDeviceSetting = await getDeviceSettingService(subDevice.deviceId, 'preferredSubDevice');
//   if (!preferredSubDeviceSetting) {
//     payload.push(
//       createDeviceSettingPayload(subDevice.deviceId, 'preferredSubDevice', subDevice.subDeviceId, subDevice.createdBy)
//     );
//   } else {
//     skip = 1;
//   }
//
//   // create autoShutDownTime setting
//   const autoShutDownTimeSetting = await getSubDeviceSettingService(subDevice.subDeviceId, 'autoShutDownTime');
//   if (!autoShutDownTimeSetting) {
//     payload.push(
//       createSubDeviceSettingPayload(
//         subDevice.subDeviceId,
//         'autoShutDownTime',
//         defaultSettings.defaultSubDeviceAutoShutDownTime,
//         subDevice.createdBy
//       )
//     );
//   } else {
//     skip = 2;
//   }
//
//   // create waterLevelToStart setting
//   const waterLevelToStartSetting = await getSubDeviceSettingService(subDevice.subDeviceId, 'waterLevelToStart');
//   console.log(waterLevelToStartSetting);
//   if (!waterLevelToStartSetting) {
//     payload.push(
//       createSubDeviceSettingPayload(
//         subDevice.subDeviceId,
//         'waterLevelToStart',
//         defaultSettings.defaultTankWaterLevelToStart,
//         subDevice.createdBy
//       )
//     );
//   } else {
//     skip = 3;
//   }
//   if (skip === 3) {
//     return null;
//   }
//   return createSettings(payload);
// };

const createSmartSwitchSettingService = async subDevice => {
  const payload = [];

  // create autoShutDownTime setting
  payload.push(
    createSubDeviceSettingPayload(
      subDevice.subDeviceId,
      'autoShutDownTime',
      defaultSettings.defaultSubDeviceAutoShutDownTime,
      subDevice.createdBy
    )
  );
  return createSettings(payload);
};

// const updateSmartSwitchSettingService = async subDevice => {
//   const payload = [];
//   let skip = 0;
//
//   // create autoShutDownTime setting
//   const autoShutDownTimeSetting = await getSubDeviceSettingService(subDevice.subDeviceId, 'autoShutDownTime');
//   if (!autoShutDownTimeSetting) {
//     payload.push(
//       createSubDeviceSettingPayload(
//         subDevice.subDeviceId,
//         'autoShutDownTime',
//         defaultSettings.defaultSubDeviceAutoShutDownTime,
//         subDevice.createdBy
//       )
//     );
//   } else {
//     skip = 1;
//   }
//   if (skip === 1) {
//     return null;
//   }
//   return createSettings(payload);
// };

module.exports = {
  createTankSettingService,
  createSmartSwitchSettingService,
};
