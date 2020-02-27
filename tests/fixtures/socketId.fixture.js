import mongoose from 'mongoose';
import faker from 'faker';
import { admin, userOne } from './user.fixture';
import SocketId from '../../src/models/socketId.model';
import { deviceOne, deviceTwo } from './device.fixture';
import { socketUserType, socketUserIdType } from '../../src/config/socketUser';

const email1 = admin.email;
const email2 = userOne.email;

const socketIdOne = {
  _id: mongoose.Types.ObjectId(),
  type: socketUserType[0],
  idType: socketUserIdType[0],
  bindedTo: deviceOne.deviceId,
  socketId: faker.random.uuid(),
};

const socketIdTwo = {
  _id: mongoose.Types.ObjectId(),
  type: socketUserType[1],
  idType: socketUserIdType[1],
  bindedTo: email1,
  socketId: faker.random.uuid(),
};

const socketIdThree = {
  _id: mongoose.Types.ObjectId(),
  type: socketUserType[1],
  idType: socketUserIdType[1],
  bindedTo: email1,
  socketId: faker.random.uuid(),
};

const socketIdFour = {
  _id: mongoose.Types.ObjectId(),
  type: socketUserType[1],
  idType: socketUserIdType[1],
  bindedTo: email2,
  socketId: faker.random.uuid(),
};

const socketIdFive = {
  _id: mongoose.Types.ObjectId(),
  type: socketUserType[1],
  idType: socketUserIdType[1],
  bindedTo: email2,
  socketId: faker.random.uuid(),
};

// -----------------------deviceTwo---------------------------

const socketIdSix = {
  _id: mongoose.Types.ObjectId(),
  type: socketUserType[0],
  idType: socketUserIdType[0],
  bindedTo: deviceTwo.deviceId,
  socketId: faker.random.uuid(),
};

const insertSocketIds = async socketIds => {
  await SocketId.insertMany(socketIds.map(socketId => ({ ...socketId })));
};

module.exports = {
  socketIdOne,
  socketIdTwo,
  socketIdThree,
  socketIdFour,
  socketIdFive,
  socketIdSix,
  insertSocketIds,
};
