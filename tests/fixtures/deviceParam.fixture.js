import mongoose from 'mongoose';
import { deviceOne, deviceTwo } from './device.fixture';
import { userOne, admin } from './user.fixture';
import DeviceParam from '../../src/models/deviceParam.model';

const email1 = `device@${deviceOne.deviceId}.com`;
const email2 = `device@${deviceTwo.deviceId}.com`;
const email3 = userOne.email;
const email4 = admin.email;

const deviceParamOne = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  paramName: 'waterLevel',
  paramValue: 50,
  createdBy: email1,
  updatedBy: email1,
};

const deviceParamTwo = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  paramName: 'waterHeight',
  paramValue: 104,
  createdBy: email1,
  updatedBy: email1,
};

const deviceParamThree = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceTwo.deviceId,
  paramName: 'waterHeight',
  paramValue: 104,
  createdBy: email2,
  updatedBy: email2,
};

const deviceParamFour = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceTwo.deviceId,
  paramName: 'waterHeight',
  paramValue: 104,
  createdBy: email3,
  updatedBy: email3,
};

const deviceParamFive = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  paramName: 'waterHeight',
  paramValue: 104,
  createdBy: email4,
  updatedBy: email4,
};

const deviceParamSix = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  paramName: 'waterLevel',
  paramValue: 50,
  createdBy: email4,
  updatedBy: email4,
};

const insertDeviceParams = async deviceParams => {
  await DeviceParam.insertMany(deviceParams.map(deviceParam => ({ ...deviceParam })));
};

module.exports = {
  insertDeviceParams,
  deviceParamOne,
  deviceParamTwo,
  deviceParamThree,
  deviceParamFour,
  deviceParamFive,
  deviceParamSix,
};
