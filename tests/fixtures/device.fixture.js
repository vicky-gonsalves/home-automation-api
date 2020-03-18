import mongoose from 'mongoose';
import { deviceType, deviceVariant } from '../../src/config/device';
import Device from '../../src/models/device.model';
import { admin, userOne } from './user.fixture';
import uniqid from 'uniqid';

const email1 = admin.email;
const email2 = userOne.email;

const deviceOne = {
  _id: mongoose.Types.ObjectId(),
  deviceId: uniqid(),
  name: 'Motor',
  type: deviceType[0],
  variant: deviceVariant[0],
  deviceOwner: email1,
  registeredAt: '2020-02-20T10:17:46.820Z',
  createdBy: email1,
  updatedBy: email1,
};

const deviceTwo = {
  _id: mongoose.Types.ObjectId(),
  deviceId: uniqid(),
  name: 'Light',
  type: deviceType[1],
  variant: deviceVariant[1],
  deviceOwner: email2,
  registeredAt: new Date().toISOString(),
  createdBy: email2,
  updatedBy: email2,
};

const deviceThree = {
  _id: mongoose.Types.ObjectId(),
  deviceId: uniqid(),
  name: 'Light',
  type: deviceType[1],
  variant: deviceVariant[1],
  deviceOwner: email2,
  registeredAt: new Date().toISOString(),
  createdBy: email2,
  updatedBy: email2,
};

const deviceFour = {
  _id: mongoose.Types.ObjectId(),
  deviceId: uniqid(),
  name: 'Light',
  type: deviceType[2],
  variant: deviceVariant[1],
  deviceOwner: email1,
  registeredAt: new Date().toISOString(),
  createdBy: email1,
  updatedBy: email1,
};

const insertDevices = async devices => {
  await Device.insertMany(devices.map(device => ({ ...device })));
};

module.exports = {
  insertDevices,
  deviceOne,
  deviceTwo,
  deviceThree,
  deviceFour,
};
