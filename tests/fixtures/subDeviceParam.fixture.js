const mongoose = require('mongoose');
const { admin, userOne } = require('./user.fixture');
const { deviceOne, deviceTwo } = require('./device.fixture');
const SubDeviceParam = require('../../src/models/subDeviceParam.model');
const { subDeviceOne, subDeviceTwo } = require('./subDevice.fixture');

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
  subDeviceId: subDeviceOne.subDeviceId,
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
  subDeviceId: subDeviceTwo.subDeviceId,
  paramName: 'status',
  paramValue: 'off',
  createdBy: email2,
  updatedBy: email2,
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
};
