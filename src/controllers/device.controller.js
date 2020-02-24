const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {deviceService} = require('../services');

const createDevice = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.email;
  const device = await deviceService.createDevice(req.body);
  res.status(httpStatus.CREATED).send(device.transform());
});

const getDevices = catchAsync(async (req, res) => {
  const devices = await deviceService.getDevices(req.query);
  const response = devices.map(device => device.transform());
  res.send(response);
});

const getDevice = catchAsync(async (req, res) => {
  const device = await deviceService.getDeviceByDeviceId(req.params.deviceId);
  res.send(device.transform());
});

const getByDeviceOwner = catchAsync(async (req, res) => {
  const devices = await deviceService.getDevicesByDeviceOwner(req.params.deviceOwner);
  const response = devices.map(device => device.transform());
  res.send(response);
});

const updateDevice = catchAsync(async (req, res) => {
  req.body._updatedBy = req.user.email;
  const device = await deviceService.updateDevice(req.params.deviceId, req.body);
  res.send(device.transform());
});

const deleteDevice = catchAsync(async (req, res) => {
  await deviceService.deleteDevice(req.params.deviceId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createDevice,
  getDevices,
  getDevice,
  getByDeviceOwner,
  updateDevice,
  deleteDevice,
};
