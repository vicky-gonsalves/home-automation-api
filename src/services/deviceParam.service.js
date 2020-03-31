import httpStatus from 'http-status';
import { flatten, pick } from 'lodash';
import AppError from '../utils/AppError';
import DeviceParam from '../models/deviceParam.model';
import { getQueryOptions } from '../utils/service.util';

const checkDuplicateDeviceParamService = async (deviceId, paramName, excludeDeviceParamId) => {
  const deviceParam = await DeviceParam.findOne({
    deviceId,
    paramName,
    _id: { $ne: excludeDeviceParamId },
  });
  if (deviceParam) {
    throw new AppError(httpStatus.BAD_REQUEST, 'deviceParam already registered');
  }
};

const createDeviceParamService = async (deviceId, _deviceParamBody) => {
  const deviceParamBody = _deviceParamBody;
  await checkDuplicateDeviceParamService(deviceId, deviceParamBody.paramName);
  deviceParamBody.deviceId = deviceId;
  return DeviceParam.create(deviceParamBody);
};

const getDeviceParamsService = async (deviceId, query) => {
  const filter = pick(query, [
    'id',
    'deviceId',
    'paramName',
    'paramValue',
    'isDisabled',
    'createdBy',
    'updatedBy',
    'createdAt',
    'updatedAt',
  ]);
  filter.deviceId = deviceId;
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(filter.paramValue)) {
    filter.paramValue = parseFloat(filter.paramValue);
  }
  const options = getQueryOptions(query);
  return DeviceParam.find(filter, null, options);
};

const getDeviceParamByParamNameService = async (deviceId, paramName) => {
  const deviceParam = await DeviceParam.findOne({ deviceId, paramName });
  if (!deviceParam) {
    throw new AppError(httpStatus.NOT_FOUND, 'No deviceParam found');
  }
  return deviceParam;
};

const getActiveDeviceParamByParamNameService = (deviceId, paramName) => {
  return DeviceParam.findOne({ deviceId, paramName, isDisabled: false });
};

const updateDeviceParamService = async (deviceId, paramName, updateBody) => {
  const deviceParam = await getDeviceParamByParamNameService(deviceId, paramName);
  if (updateBody && updateBody.paramName) {
    await checkDuplicateDeviceParamService(deviceId, updateBody.paramName, deviceParam.id);
  }
  Object.assign(deviceParam, updateBody);
  await deviceParam.save();
  return deviceParam;
};

const updateDeviceParamCreatedByService = async (oldEmail, newEmail) => {
  const deviceParams = await DeviceParam.find({ createdBy: oldEmail });
  return Promise.all(
    deviceParams.map(async deviceParam => {
      Object.assign(deviceParam, { createdBy: newEmail });
      await deviceParam.save();
      return deviceParam;
    })
  );
};

const updateDeviceParamUpdatedByService = async (oldEmail, newEmail) => {
  const deviceParams = await DeviceParam.find({ updatedBy: oldEmail });
  return Promise.all(
    deviceParams.map(async deviceParam => {
      Object.assign(deviceParam, { updatedBy: newEmail });
      await deviceParam.save();
      return deviceParam;
    })
  );
};

const deleteDeviceParamService = async (deviceId, paramName) => {
  const deviceParam = await getDeviceParamByParamNameService(deviceId, paramName);
  await deviceParam.remove();
  return deviceParam;
};

const deleteDeviceParamByDeviceIdService = async deviceId => {
  const deviceParams = await DeviceParam.find({ deviceId });
  await Promise.all(deviceParams.map(deviceParam => deviceParam.remove()));
};

const getActiveDeviceParamsByDeviceIdsService = async deviceIds => {
  let deviceParams = [];
  deviceParams = await Promise.all(
    deviceIds.map(deviceId =>
      DeviceParam.find({
        deviceId,
        isDisabled: false,
      })
    )
  );
  return flatten(deviceParams);
};

module.exports = {
  createDeviceParamService,
  getDeviceParamsService,
  getDeviceParamByParamNameService,
  updateDeviceParamService,
  updateDeviceParamCreatedByService,
  deleteDeviceParamService,
  deleteDeviceParamByDeviceIdService,
  getActiveDeviceParamByParamNameService,
  getActiveDeviceParamsByDeviceIdsService,
  updateDeviceParamUpdatedByService,
};
