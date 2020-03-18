import mongoose from 'mongoose';
import { admin, userOne } from './user.fixture';
import { deviceFour, deviceOne, deviceTwo } from './device.fixture';
import SubDeviceParam from '../../src/models/subDeviceParam.model';
import { subDeviceFive, subDeviceFour, subDeviceOne, subDeviceSix, subDeviceThree, subDeviceTwo } from './subDevice.fixture';

const email1 = admin.email;
const email2 = userOne.email;

const subDeviceParamOne = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  subDeviceId: subDeviceOne.subDeviceId,
  paramName: 'waterLevel',
  paramValue: 50,
  createdBy: email1,
  updatedBy: email1,
};

const subDeviceParamTwo = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  subDeviceId: subDeviceTwo.subDeviceId,
  paramName: 'lastFilledAt',
  paramValue: '2020-02-21T08:46:06.124Z',
  createdBy: email1,
  updatedBy: email1,
};

const subDeviceParamThree = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  subDeviceId: subDeviceOne.subDeviceId,
  paramName: 'status',
  paramValue: 'off',
  createdBy: email1,
  updatedBy: email1,
};

const subDeviceParamFour = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceTwo.deviceId,
  subDeviceId: subDeviceThree.subDeviceId,
  paramName: 'status',
  paramValue: 'off',
  createdBy: email2,
  updatedBy: email2,
};

const subDeviceParamFive = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceTwo.deviceId,
  subDeviceId: subDeviceFour.subDeviceId,
  paramName: 'status',
  paramValue: 'off',
  createdBy: email2,
  updatedBy: email2,
};

const subDeviceParamSix = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceFour.deviceId,
  subDeviceId: subDeviceFive.subDeviceId,
  paramName: 'status',
  paramValue: 'off',
  createdBy: email1,
  updatedBy: email1,
};

const subDeviceParamSeven = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceFour.deviceId,
  subDeviceId: subDeviceFive.subDeviceId,
  paramName: 'status',
  paramValue: 'off',
  createdBy: email1,
  updatedBy: email1,
};

const subDeviceParamEight = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceFour.deviceId,
  subDeviceId: subDeviceSix.subDeviceId,
  paramName: 'status',
  paramValue: 'off',
  createdBy: email1,
  updatedBy: email1,
};

const insertSubDeviceParams = async subDeviceParams => {
  await SubDeviceParam.insertMany(subDeviceParams.map(subDeviceParam => ({ ...subDeviceParam })));
};

module.exports = {
  insertSubDeviceParams,
  subDeviceParamOne,
  subDeviceParamTwo,
  subDeviceParamThree,
  subDeviceParamFour,
  subDeviceParamFive,
  subDeviceParamSix,
  subDeviceParamSeven,
  subDeviceParamEight,
};
