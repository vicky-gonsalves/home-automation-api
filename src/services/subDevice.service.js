const httpStatus = require('http-status');
const { pick } = require('lodash');
const { getDeviceByDeviceId } = require('./device.service');
const AppError = require('../utils/AppError');
const { SubDevice } = require('../models');
const { getQueryOptions } = require('../utils/service.util');

const checkDuplicateSubDeviceId = async (subDeviceId, excludeSubDeviceId) => {
  const subDevice = await SubDevice.findOne({ subDeviceId, _id: { $ne: excludeSubDeviceId } });
  if (subDevice) {
    throw new AppError(httpStatus.BAD_REQUEST, 'subDeviceId already registered');
  }
};

const createSubDevice = async (deviceId, _subDeviceBody) => {
  const subDeviceBody = _subDeviceBody;
  await getDeviceByDeviceId(deviceId);
  await checkDuplicateSubDeviceId(subDeviceBody.subDeviceId);
  subDeviceBody.deviceId = deviceId;
  return SubDevice.create(subDeviceBody);
};

const getSubDevices = async (deviceId, query) => {
  const filter = pick(query, [
    'id',
    'subDeviceId',
    'name',
    'type',
    'registeredAt',
    'isDisabled',
    'subDeviceOwner',
    'createdBy',
    'updatedBy',
  ]);
  filter.deviceId = deviceId;
  const options = getQueryOptions(query);
  return SubDevice.find(filter, null, options);
};

const getSubDeviceBySubDeviceId = async (deviceId, subDeviceId) => {
  const subDevice = await SubDevice.findOne({ deviceId, subDeviceId });
  if (!subDevice) {
    throw new AppError(httpStatus.NOT_FOUND, 'No subDevice found');
  }
  return subDevice;
};

const updateSubDevice = async (deviceId, subDeviceId, updateBody) => {
  const subDevice = await getSubDeviceBySubDeviceId(deviceId, subDeviceId);
  if (updateBody.subDeviceId) {
    await getDeviceByDeviceId(deviceId);
    await checkDuplicateSubDeviceId(updateBody.subDeviceId, subDevice.id);
  }
  Object.assign(subDevice, updateBody);
  await subDevice.save();
  return subDevice;
};

const deleteSubDevice = async (deviceId, subDeviceId) => {
  const subDevice = await getSubDeviceBySubDeviceId(deviceId, subDeviceId);
  await subDevice.remove();
  return subDevice;
};

module.exports = {
  createSubDevice,
  getSubDevices,
  getSubDeviceBySubDeviceId,
  updateSubDevice,
  deleteSubDevice,
};
