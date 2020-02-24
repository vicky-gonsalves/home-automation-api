const mongoose = require('mongoose');
const faker = require('faker');
const { deviceType } = require('../../src/config/device');
const Device = require('../../src/models/device.model');
const { admin, userOne } = require('./user.fixture');

const email1 = admin.email;
const email2 = userOne.email;

const deviceOne = {
  _id: mongoose.Types.ObjectId(),
  deviceId: faker.random.alphaNumeric(16),
  name: 'Motor',
  type: deviceType[0],
  deviceOwner: email1,
  registeredAt: '2020-02-20T10:17:46.820Z',
  createdBy: email1,
  updatedBy: email1,
};

const deviceTwo = {
  _id: mongoose.Types.ObjectId(),
  deviceId: faker.random.alphaNumeric(16),
  name: 'Light',
  type: deviceType[1],
  deviceOwner: email2,
  registeredAt: new Date().toISOString(),
  createdBy: email2,
  updatedBy: email2,
};

const insertDevices = async devices => {
  await Device.insertMany(devices.map(device => ({ ...device })));
};

module.exports = {
  insertDevices,
  deviceOne,
  deviceTwo,
};
