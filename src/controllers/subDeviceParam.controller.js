const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {subDeviceParamService} = require('../services');

const createSubDeviceParam = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.email;
  const subDeviceParam = await subDeviceParamService.createSubDeviceParam(req.params.deviceId, req.params.subDeviceId, req.body);
  res.status(httpStatus.CREATED).send(subDeviceParam.transform());
});

const getSubDeviceParams = catchAsync(async (req, res) => {
  const subDeviceParams = await subDeviceParamService.getSubDeviceParams(req.params.deviceId, req.params.subDeviceId, req.query);
  const response = subDeviceParams.map(subDeviceParam => subDeviceParam.transform());
  res.send(response);
});

const getSubDeviceParam = catchAsync(async (req, res) => {
  const subDeviceParam = await subDeviceParamService.getSubDeviceParamByParamName(req.params.deviceId, req.params.subDeviceId, req.params.paramName);
  res.send(subDeviceParam.transform());
});

const updateSubDeviceParam = catchAsync(async (req, res) => {
  req.body._updatedBy = req.user.email;
  const subDeviceParam = await subDeviceParamService.updateSubDeviceParam(req.params.deviceId, req.params.subDeviceId, req.params.paramName, req.body);
  res.send(subDeviceParam.transform());
});

const deleteSubDeviceParam = catchAsync(async (req, res) => {
  await subDeviceParamService.deleteSubDeviceParam(req.params.deviceId, req.params.subDeviceId, req.params.paramName);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSubDeviceParam,
  getSubDeviceParams,
  getSubDeviceParam,
  updateSubDeviceParam,
  deleteSubDeviceParam,
};
