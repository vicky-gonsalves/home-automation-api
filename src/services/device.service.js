const httpStatus = require('http-status');
const {pick} = require('lodash');
const AppError = require('../utils/AppError');
const {Device} = require('../models');
const {getQueryOptions} = require('../utils/service.util');

const checkDuplicateDeviceId = async (deviceId, excludeDeviceId) => {
  const device = await Device.findOne({deviceId, _id: {$ne: excludeDeviceId}});
  if (device) {
    throw new AppError(httpStatus.BAD_REQUEST, 'deviceId already registered');
  }
};

const createDevice = async deviceBody => {
  await checkDuplicateDeviceId(deviceBody.deviceId);
  const device = await Device.create(deviceBody);
  return device;
};

const getDevices = async query => {
  const filter = pick(query, ['id', 'deviceId', 'name', 'type', 'registeredAt', 'isDisabled', 'deviceOwner', 'createdBy', 'updatedBy']);
  const options = getQueryOptions(query);
  const devices = await Device.find(filter, null, options);
  return devices;
};

const getDeviceByDeviceId = async deviceId => {
  const device = await Device.findOne({deviceId});
  if (!device) {
    throw new AppError(httpStatus.NOT_FOUND, 'No device found with this deviceId');
  }
  return device;
};

const getDevicesByDeviceOwner = async deviceOwner => {
  const devices = await Device.find({deviceOwner});
  return devices;
};

const updateDevice = async (id, updateBody) => {
  const device = await getDeviceByDeviceId(id);
  if (updateBody.deviceId) {
    await checkDuplicateDeviceId(updateBody.deviceId, device.id);
  }
  Object.assign(device, updateBody);
  await device.save();
  return device;
};

const deleteDevice = async id => {
  const device = await getDeviceByDeviceId(id);
  await device.remove();
  return device;
};

module.exports = {
  createDevice,
  getDevices,
  getDeviceByDeviceId,
  getDevicesByDeviceOwner,
  updateDevice,
  deleteDevice
};
