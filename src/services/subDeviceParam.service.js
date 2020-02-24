const httpStatus = require('http-status');
const { pick } = require('lodash');
const { getDeviceByDeviceId } = require('./device.service');
const AppError = require('../utils/AppError');
const { SubDeviceParam } = require('../models');
const { getQueryOptions } = require('../utils/service.util');

const checkDuplicateSubDeviceParam = async (deviceId, subDeviceId, paramName, excludeSubDeviceParamId) => {
  const subDeviceParam = await SubDeviceParam.findOne({
    deviceId,
    subDeviceId,
    paramName,
    _id: { $ne: excludeSubDeviceParamId },
  });
  if (subDeviceParam) {
    throw new AppError(httpStatus.BAD_REQUEST, 'subDeviceParam already registered');
  }
};

const createSubDeviceParam = async (deviceId, subDeviceId, _subDeviceParamBody) => {
  const subDeviceParamBody = _subDeviceParamBody;
  await getDeviceByDeviceId(deviceId);
  await checkDuplicateSubDeviceParam(deviceId, subDeviceId, subDeviceParamBody.paramName);
  subDeviceParamBody.deviceId = deviceId;
  subDeviceParamBody.subDeviceId = subDeviceId;
  return SubDeviceParam.create(subDeviceParamBody);
};

const getSubDeviceParams = async (deviceId, subDeviceId, query) => {
  const filter = pick(query, [
    'id',
    'deviceId',
    'subDeviceId',
    'paramName',
    'paramValue',
    'isDisabled',
    'createdBy',
    'updatedBy',
    'createdAt',
    'updatedAt',
  ]);
  filter.deviceId = deviceId;
  filter.subDeviceId = subDeviceId;
  const options = getQueryOptions(query);
  return SubDeviceParam.find(filter, null, options);
};

const getSubDeviceParamByParamName = async (deviceId, subDeviceId, paramName) => {
  const subDeviceParam = await SubDeviceParam.findOne({ deviceId, subDeviceId, paramName });
  if (!subDeviceParam) {
    throw new AppError(httpStatus.NOT_FOUND, 'No subDeviceParam found');
  }
  return subDeviceParam;
};

const updateSubDeviceParam = async (deviceId, subDeviceId, paramName, updateBody) => {
  const subDeviceParam = await getSubDeviceParamByParamName(deviceId, subDeviceId, paramName);
  if (updateBody.paramName) {
    await getDeviceByDeviceId(deviceId);
    await checkDuplicateSubDeviceParam(deviceId, subDeviceId, updateBody.paramName, subDeviceParam.id);
  }
  Object.assign(subDeviceParam, updateBody);
  await subDeviceParam.save();
  return subDeviceParam;
};

const deleteSubDeviceParam = async (deviceId, subDeviceId, paramName) => {
  const subDeviceParam = await getSubDeviceParamByParamName(deviceId, subDeviceId, paramName);
  await subDeviceParam.remove();
  return subDeviceParam;
};

module.exports = {
  createSubDeviceParam,
  getSubDeviceParams,
  getSubDeviceParamByParamName,
  updateSubDeviceParam,
  deleteSubDeviceParam,
};
