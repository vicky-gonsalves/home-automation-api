import mongoose from 'mongoose';
import SharedDeviceAccess from '../../src/models/sharedDeviceAccess.model';
import { deviceFour, deviceOne, deviceTwo } from './device.fixture';
import { admin, userOne, userTwo } from './user.fixture';

const email1 = admin.email;
const email2 = userOne.email;
const email3 = userTwo.email;

const accessOne = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  email: email2,
  sharedBy: email1,
};

const accessTwo = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  email: email3,
  sharedBy: email1,
};

const accessThree = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceTwo.deviceId,
  email: email3,
  sharedBy: email1,
};

const accessFour = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceTwo.deviceId,
  email: email2,
  sharedBy: email1,
};

const accessFive = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceFour.deviceId,
  email: email2,
  sharedBy: email1,
};

const insertSharedDeviceAccess = async accesses => {
  await SharedDeviceAccess.insertMany(accesses.map(access => ({ ...access })));
};

module.exports = {
  accessOne,
  accessTwo,
  accessThree,
  accessFour,
  accessFive,
  insertSharedDeviceAccess,
};
