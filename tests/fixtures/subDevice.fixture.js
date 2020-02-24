const mongoose = require('mongoose');
const faker = require('faker');
const { subDeviceType } = require('../../src/config/device');
const { userOne, admin } = require('./user.fixture');
const { deviceOne, deviceTwo } = require('./device.fixture');
const SubDevice = require('../../src/models/subDevice.model');

const email1 = admin.email;
const email2 = userOne.email;
const type1 = subDeviceType[0];
const type2 = subDeviceType[1];

const subDeviceOne = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  subDeviceId: faker.random.alphaNumeric(16),
  name: 'ASomeName',
  type: type1,
  createdBy: email1,
  updatedBy: email1,
};

const subDeviceTwo = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  subDeviceId: faker.random.alphaNumeric(16),
  name: 'BSomeOtherName',
  type: type1,
  createdBy: email1,
  updatedBy: email1,
};

const subDeviceThree = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceTwo.deviceId,
  subDeviceId: faker.random.alphaNumeric(16),
  name: 'CSomething',
  type: type2,
  createdBy: email2,
  updatedBy: email2,
};

const subDeviceFour = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceTwo.deviceId,
  subDeviceId: faker.random.alphaNumeric(16),
  name: 'DSomeMore',
  type: type2,
  createdBy: email2,
  updatedBy: email2,
};

const insertSubDevices = async subDevices => {
  await SubDevice.insertMany(subDevices.map(subDevice => ({ ...subDevice })));
};

module.exports = {
  insertSubDevices,
  subDeviceOne,
  subDeviceTwo,
  subDeviceThree,
  subDeviceFour,
};
