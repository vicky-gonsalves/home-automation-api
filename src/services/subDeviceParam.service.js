import httpStatus from 'http-status';
import { flatten, pick } from 'lodash';
import AppError from '../utils/AppError';
import SubDeviceParam from '../models/subDeviceParam.model';
import { getQueryOptions } from '../utils/service.util';

const checkDuplicateSubDeviceParamService = async (deviceId, subDeviceId, paramName, excludeSubDeviceParamId) => {
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

const createSubDeviceParamService = async (deviceId, subDeviceId, _subDeviceParamBody) => {
  const subDeviceParamBody = _subDeviceParamBody;
  await checkDuplicateSubDeviceParamService(deviceId, subDeviceId, subDeviceParamBody.paramName);
  subDeviceParamBody.deviceId = deviceId;
  subDeviceParamBody.subDeviceId = subDeviceId;
  return SubDeviceParam.create(subDeviceParamBody);
};

const getSubDeviceParamsService = async (deviceId, subDeviceId, query) => {
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
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(filter.paramValue)) {
    filter.paramValue = parseFloat(filter.paramValue);
  }
  return SubDeviceParam.find(filter, null, options);
};

const getSubDeviceParamByParamNameService = async (deviceId, subDeviceId, paramName) => {
  const subDeviceParam = await SubDeviceParam.findOne({ deviceId, subDeviceId, paramName });
  if (!subDeviceParam) {
    throw new AppError(httpStatus.NOT_FOUND, 'No subDeviceParam found');
  }
  return subDeviceParam;
};

const getActiveSubDeviceParamByParamNameService = (deviceId, subDeviceId, paramName) => {
  return SubDeviceParam.findOne({ deviceId, subDeviceId, paramName, isDisabled: false });
};

const updateSubDeviceParamService = async (deviceId, subDeviceId, paramName, updateBody) => {
  const subDeviceParam = await getSubDeviceParamByParamNameService(deviceId, subDeviceId, paramName);
  if (updateBody && updateBody.paramName) {
    await checkDuplicateSubDeviceParamService(deviceId, subDeviceId, updateBody.paramName, subDeviceParam.id);
  }
  Object.assign(subDeviceParam, updateBody);
  await subDeviceParam.save();
  return subDeviceParam;
};

const updateMultiStatusService = async (deviceId, subDeviceId, status, updatedBy) => {
  const subDeviceParam = await getActiveSubDeviceParamByParamNameService(deviceId, subDeviceId, 'status');
  Object.assign(subDeviceParam, { paramValue: status, updatedBy });
  await subDeviceParam.save();
  return subDeviceParam.transform();
};

const updateSubDeviceParamCreatedByService = async (oldEmail, newEmail) => {
  const subDeviceParams = await SubDeviceParam.find({ createdBy: oldEmail });
  return Promise.all(
    subDeviceParams.map(async subDeviceParam => {
      Object.assign(subDeviceParam, { createdBy: newEmail });
      await subDeviceParam.save();
      return subDeviceParam;
    })
  );
};

const updateSubDeviceParamUpdatedByService = async (oldEmail, newEmail) => {
  const subDeviceParams = await SubDeviceParam.find({ updatedBy: oldEmail });
  return Promise.all(
    subDeviceParams.map(async subDeviceParam => {
      Object.assign(subDeviceParam, { updatedBy: newEmail });
      await subDeviceParam.save();
      return subDeviceParam;
    })
  );
};

const deleteSubDeviceParamService = async (deviceId, subDeviceId, paramName) => {
  const subDeviceParam = await getSubDeviceParamByParamNameService(deviceId, subDeviceId, paramName);
  await subDeviceParam.remove();
  return subDeviceParam;
};

const deleteSubDeviceParamByDeviceIdService = async deviceId => {
  const subDeviceParams = await SubDeviceParam.find({ deviceId });
  await Promise.all(subDeviceParams.map(subDeviceParam => subDeviceParam.remove()));
};

const deleteSubDeviceParamBySubDeviceIdService = async (deviceId, subDeviceId) => {
  const subDeviceParams = await SubDeviceParam.find({ deviceId, subDeviceId });
  await Promise.all(subDeviceParams.map(subDeviceParam => subDeviceParam.remove()));
};

const getActiveSubDeviceParamsByDeviceIdAndSubDeviceIdService = async subDevices => {
  let subDeviceParams = [];
  subDeviceParams = await Promise.all(
    subDevices.map(subDevice =>
      SubDeviceParam.find({
        deviceId: subDevice.deviceId,
        subDeviceId: subDevice.subDeviceId,
        isDisabled: false,
      })
    )
  );
  return flatten(subDeviceParams);
};

const updateUpdatedAtAndNotifyService = async deviceId => {
  const subDeviceParams = await SubDeviceParam.find({ deviceId, isDisabled: false, paramName: 'status' });
  return Promise.all(
    subDeviceParams.map(async subDeviceParam => {
      Object.assign(subDeviceParam, { _updatedBy: `device@${deviceId}.com`, updatedAt: new Date() });
      await subDeviceParam.save();
      return subDeviceParam;
    })
  );
};

const updateStatusToOffAndNotifyService = async deviceId => {
  const subDeviceParams = await SubDeviceParam.find({ deviceId, isDisabled: false, paramName: 'status' });
  return Promise.all(
    subDeviceParams.map(async subDeviceParam => {
      Object.assign(subDeviceParam, { _updatedBy: `device@${deviceId}.com`, paramValue: 'off' });
      await subDeviceParam.save();
      return subDeviceParam;
    })
  );
};

module.exports = {
  createSubDeviceParamService,
  getSubDeviceParamsService,
  getSubDeviceParamByParamNameService,
  updateSubDeviceParamService,
  updateSubDeviceParamCreatedByService,
  updateSubDeviceParamUpdatedByService,
  deleteSubDeviceParamService,
  deleteSubDeviceParamByDeviceIdService,
  getActiveSubDeviceParamsByDeviceIdAndSubDeviceIdService,
  getActiveSubDeviceParamByParamNameService,
  updateMultiStatusService,
  updateUpdatedAtAndNotifyService,
  updateStatusToOffAndNotifyService,
  deleteSubDeviceParamBySubDeviceIdService,
};
