import { getDeviceByDeviceIdService } from '../services/device.service';
import { getSubDeviceBySubDeviceIdService } from '../services/subDevice.service';
import {
  createSubDeviceParamService,
  deleteSubDeviceParamService,
  getSubDeviceParamByParamNameService,
  getSubDeviceParamsService,
  updateSubDeviceParamService,
} from '../services/subDeviceParam.service';

const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const createSubDeviceParam = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.email;
  await getDeviceByDeviceIdService(req.params.deviceId);
  await getSubDeviceBySubDeviceIdService(req.params.deviceId, req.params.subDeviceId);
  const subDeviceParam = await createSubDeviceParamService(req.params.deviceId, req.params.subDeviceId, req.body);
  res.status(httpStatus.CREATED).send(subDeviceParam.transform());
});

const getSubDeviceParams = catchAsync(async (req, res) => {
  const subDeviceParams = await getSubDeviceParamsService(req.params.deviceId, req.params.subDeviceId, req.query);
  const response = subDeviceParams.map(subDeviceParam => subDeviceParam.transform());
  res.send(response);
});

const getSubDeviceParam = catchAsync(async (req, res) => {
  const subDeviceParam = await getSubDeviceParamByParamNameService(
    req.params.deviceId,
    req.params.subDeviceId,
    req.params.paramName
  );
  res.send(subDeviceParam.transform());
});

const updateSubDeviceParam = catchAsync(async (req, res) => {
  req.body._updatedBy = req.user.email;
  await getDeviceByDeviceIdService(req.params.deviceId);
  await getSubDeviceBySubDeviceIdService(req.params.deviceId, req.params.subDeviceId);
  const subDeviceParam = await updateSubDeviceParamService(
    req.params.deviceId,
    req.params.subDeviceId,
    req.params.paramName,
    req.body
  );
  res.send(subDeviceParam.transform());
});

const deleteSubDeviceParam = catchAsync(async (req, res) => {
  await deleteSubDeviceParamService(req.params.deviceId, req.params.subDeviceId, req.params.paramName);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSubDeviceParam,
  getSubDeviceParams,
  getSubDeviceParam,
  updateSubDeviceParam,
  deleteSubDeviceParam,
};
