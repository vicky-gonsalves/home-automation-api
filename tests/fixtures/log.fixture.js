import mongoose from 'mongoose';
import { deviceOne, deviceTwo } from './device.fixture';
import { subDeviceOne, subDeviceThree } from './subDevice.fixture';
import { deviceParamOne } from './deviceParam.fixture';
import { admin } from './user.fixture';
import Log from '../../src/models/log.model';

const email1 = `device@${deviceOne.deviceId}.com`;
const email2 = `device@${deviceTwo.deviceId}.com`;
const email4 = admin.email;

const logOne = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  subDeviceId: subDeviceOne.subDeviceId,
  logName: 'status_UPDATED',
  logDescription: `${subDeviceOne.name} turned on when water level was ${deviceParamOne.paramValue}%`,
  isDevLog: false,
  createdBy: email4,
  triggeredByDevice: false,
};

const logTwo = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  subDeviceId: subDeviceOne.subDeviceId,
  logName: 'status_UPDATED',
  logDescription: `${subDeviceOne.name} turned off when water level was ${deviceParamOne.paramValue}%`,
  isDevLog: false,
  createdBy: email4,
  triggeredByDevice: false,
};

const logThree = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceTwo.deviceId,
  subDeviceId: subDeviceThree.subDeviceId,
  logName: 'status_UPDATED',
  logDescription: `${subDeviceThree.name} turned on`,
  isDevLog: false,
  createdBy: email4,
  triggeredByDevice: false,
};

const logFour = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceTwo.deviceId,
  subDeviceId: subDeviceThree.subDeviceId,
  logName: 'status_UPDATED',
  logDescription: `${subDeviceThree.name} turned off`,
  isDevLog: false,
  createdBy: email4,
  triggeredByDevice: false,
};

const logFive = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceTwo.deviceId,
  subDeviceId: subDeviceThree.subDeviceId,
  logName: 'status_UPDATED',
  logDescription: `${subDeviceThree.name} turned off`,
  isDevLog: false,
  createdBy: email2,
  triggeredByDevice: true,
};

const logSix = {
  _id: mongoose.Types.ObjectId(),
  deviceId: deviceOne.deviceId,
  subDeviceId: subDeviceOne.subDeviceId,
  logName: 'waterLevel_UPDATED',
  logDescription: `${subDeviceOne.name} turned on when water level was ${deviceParamOne.paramValue}%`,
  isDevLog: true,
  createdBy: email1,
  triggeredByDevice: true,
};

const insertlogs = async logs => {
  await Log.insertMany(logs.map(log => ({ ...log })));
};

module.exports = {
  insertlogs,
  logOne,
  logTwo,
  logThree,
  logFour,
  logFive,
  logSix,
};
