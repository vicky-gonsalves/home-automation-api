import mongoose from 'mongoose';
import { subDeviceType } from '../../src/config/device';
import { admin, userOne } from './user.fixture';
import { deviceOne, deviceTwo, deviceFour } from './device.fixture';
import SubDevice from '../../src/models/subDevice.model';
import uniqid from 'uniqid';

const email1 = admin.email;
const email2 = userOne.email;
const type1 = subDeviceType[0];
const type2 = subDeviceType[1];

const subDeviceOne = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  subDeviceId: uniqid(),
  name: 'ASomeName',
  type: type1,
  createdBy: email1,
  updatedBy: email1,
};

const subDeviceTwo = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  subDeviceId: uniqid(),
  name: 'BSomeOtherName',
  type: type1,
  createdBy: email1,
  updatedBy: email1,
};

const subDeviceThree = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceTwo.deviceId,
  subDeviceId: uniqid(),
  name: 'CSomething',
  type: type2,
  createdBy: email2,
  updatedBy: email2,
};

const subDeviceFour = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceTwo.deviceId,
  subDeviceId: uniqid(),
  name: 'DSomeMore',
  type: type2,
  createdBy: email2,
  updatedBy: email2,
};

const subDeviceFive = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceFour.deviceId,
  subDeviceId: uniqid(),
  name: 'ESomeMore',
  type: type2,
  createdBy: email1,
  updatedBy: email1,
};

const subDeviceSix = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceFour.deviceId,
  subDeviceId: uniqid(),
  name: 'FSomeMore',
  type: type2,
  createdBy: email1,
  updatedBy: email1,
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
  subDeviceFive,
  subDeviceSix,
};
