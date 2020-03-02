import httpStatus from 'http-status';
import {
  createDeviceService,
  deleteDeviceService,
  getDeviceByDeviceIdService,
  getDevicesByDeviceOwnerService,
  getDevicesService,
  registerDeviceService,
  updateDeviceService,
} from '../services/device.service';
import catchAsync from '../utils/catchAsync';

const createDevice = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.email;
  const device = await createDeviceService(req.body);
  res.status(httpStatus.CREATED).send(device.transform());
});

const getDevices = catchAsync(async (req, res) => {
  const devices = await getDevicesService(req.query);
  const response = devices.map(device => device.transform());
  res.send(response);
});

const getDevice = catchAsync(async (req, res) => {
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  res.send(device.transform());
});

const getByDeviceOwner = catchAsync(async (req, res) => {
  const devices = await getDevicesByDeviceOwnerService(req.params.deviceOwner);
  const response = devices.map(device => device.transform());
  res.send(response);
});

const updateDevice = catchAsync(async (req, res) => {
  req.body._updatedBy = req.user.email;
  const device = await updateDeviceService(req.params.deviceId, req.body);
  res.send(device.transform());
});

const deleteDevice = catchAsync(async (req, res) => {
  await deleteDeviceService(req.params.deviceId);
  res.status(httpStatus.NO_CONTENT).send();
});

const registerDevice = catchAsync(async (req, res) => {
  await registerDeviceService(req.params.deviceId);
  res.send({ registered: true });
});

module.exports = {
  createDevice,
  getDevices,
  getDevice,
  getByDeviceOwner,
  updateDevice,
  deleteDevice,
  registerDevice,
};
