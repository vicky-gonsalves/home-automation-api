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
  if (updateBody.paramName) {
    await checkDuplicateSubDeviceParamService(deviceId, subDeviceId, updateBody.paramName, subDeviceParam.id);
  }
  Object.assign(subDeviceParam, updateBody);
  await subDeviceParam.save();
  return subDeviceParam;
};

const updateSubDeviceParamDeviceIdService = async (oldDeviceId, newDeviceId) => {
  const subDeviceParams = await SubDeviceParam.find({ deviceId: oldDeviceId });
  return Promise.all(
    subDeviceParams.map(async subDeviceParam => {
      Object.assign(subDeviceParam, { deviceId: newDeviceId });
      await subDeviceParam.save();
      return subDeviceParam;
    })
  );
};

const updateSubDeviceParamSubDeviceIdService = async (oldSubDeviceId, newSubDeviceId) => {
  const subDeviceParams = await SubDeviceParam.find({ subDeviceId: oldSubDeviceId });
  return Promise.all(
    subDeviceParams.map(async subDeviceParam => {
      Object.assign(subDeviceParam, { subDeviceId: newSubDeviceId });
      await subDeviceParam.save();
      return subDeviceParam;
    })
  );
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

module.exports = {
  createSubDeviceParamService,
  getSubDeviceParamsService,
  getSubDeviceParamByParamNameService,
  updateSubDeviceParamService,
  updateSubDeviceParamDeviceIdService,
  updateSubDeviceParamSubDeviceIdService,
  updateSubDeviceParamCreatedByService,
  updateSubDeviceParamUpdatedByService,
  deleteSubDeviceParamService,
  deleteSubDeviceParamByDeviceIdService,
  getActiveSubDeviceParamsByDeviceIdAndSubDeviceIdService,
  getActiveSubDeviceParamByParamNameService,
};
