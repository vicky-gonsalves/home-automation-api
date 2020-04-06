import { admin } from './user.fixture';
import mongoose from 'mongoose';
import { idType, settingType } from '../../src/config/setting';
import { deviceOne } from './device.fixture';
import { subDeviceOne, subDeviceThree, subDeviceFour, subDeviceFive } from './subDevice.fixture';
import { defaultSettings } from '../../src/config/config';
import Setting from '../../src/models/setting.model';

const email1 = admin.email;

const settingOne = {
  _id: mongoose.Types.ObjectId(),
  type: settingType[0],
  idType: idType[0],
  bindedTo: deviceOne.deviceId,
  paramName: 'preferredSubDevice',
  paramValue: subDeviceOne.subDeviceId,
  createdBy: email1,
  updatedBy: email1,
};

const settingTwo = {
  _id: mongoose.Types.ObjectId(),
  type: settingType[0],
  idType: idType[0],
  bindedTo: deviceOne.deviceId,
  paramName: 'autoShutDownTime',
  paramValue: defaultSettings.defaultSubDeviceAutoShutDownTime,
  createdBy: email1,
  updatedBy: email1,
};

const settingThree = {
  _id: mongoose.Types.ObjectId(),
  type: settingType[0],
  idType: idType[0],
  bindedTo: deviceOne.deviceId,
  paramName: 'waterLevelToStart',
  paramValue: defaultSettings.defaultTankWaterLevelToStart,
  createdBy: email1,
  updatedBy: email1,
};

const settingFour = {
  _id: mongoose.Types.ObjectId(),
  type: settingType[1],
  idType: idType[1],
  bindedTo: subDeviceThree.subDeviceId,
  parent: subDeviceThree.deviceId,
  paramName: 'autoShutDownTime',
  paramValue: defaultSettings.defaultSubDeviceAutoShutDownTime,
  createdBy: email1,
  updatedBy: email1,
};

const settingFive = {
  _id: mongoose.Types.ObjectId(),
  type: settingType[1],
  idType: idType[1],
  bindedTo: subDeviceFive.subDeviceId,
  parent: subDeviceFive.deviceId,
  paramName: 'autoShutDownTime',
  paramValue: 0,
  createdBy: email1,
  updatedBy: email1,
};

const settingSix = {
  _id: mongoose.Types.ObjectId(),
  type: settingType[1],
  idType: idType[1],
  bindedTo: subDeviceFour.subDeviceId,
  parent: subDeviceFour.deviceId,
  paramName: 'autoShutDownTime',
  paramValue: 0,
  createdBy: email1,
  updatedBy: email1,
};

const insertSettings = async settings => {
  await Setting.insertMany(settings.map(setting => ({ ...setting })));
};

module.exports = {
  insertSettings,
  settingOne,
  settingTwo,
  settingThree,
  settingFour,
  settingFive,
  settingSix,
};
