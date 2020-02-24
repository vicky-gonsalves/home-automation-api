const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {subDeviceService} = require('../services');

const createSubDevice = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.email;
  const subDevice = await subDeviceService.createSubDevice(req.params.deviceId, req.body);
  res.status(httpStatus.CREATED).send(subDevice.transform());
});

const getSubDevices = catchAsync(async (req, res) => {
  const subDevices = await subDeviceService.getSubDevices(req.params.deviceId, req.query);
  const response = subDevices.map(subDevice => subDevice.transform());
  res.send(response);
});

const getSubDevice = catchAsync(async (req, res) => {
  const subDevice = await subDeviceService.getSubDeviceBySubDeviceId(req.params.deviceId, req.params.subDeviceId);
  res.send(subDevice.transform());
});

const updateSubDevice = catchAsync(async (req, res) => {
  req.body._updatedBy = req.user.email;
  const subDevice = await subDeviceService.updateSubDevice(req.params.deviceId, req.params.subDeviceId, req.body);
  res.send(subDevice.transform());
});

const deleteSubDevice = catchAsync(async (req, res) => {
  await subDeviceService.deleteSubDevice(req.params.deviceId, req.params.subDeviceId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSubDevice,
  getSubDevices,
  getSubDevice,
  updateSubDevice,
  deleteSubDevice,
};
