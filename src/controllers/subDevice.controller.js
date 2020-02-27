import httpStatus from 'http-status';
import { getDeviceByDeviceIdService } from '../services/device.service';
import {
  createSubDeviceService,
  deleteSubDeviceService,
  getSubDeviceBySubDeviceIdService,
  getSubDevicesService,
  updateSubDeviceService,
} from '../services/subDevice.service';
import catchAsync from '../utils/catchAsync';

const createSubDevice = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.email;
  await getDeviceByDeviceIdService(req.params.deviceId);
  const subDevice = await createSubDeviceService(req.params.deviceId, req.body);
  res.status(httpStatus.CREATED).send(subDevice.transform());
});

const getSubDevices = catchAsync(async (req, res) => {
  const subDevices = await getSubDevicesService(req.params.deviceId, req.query);
  const response = subDevices.map(subDevice => subDevice.transform());
  res.send(response);
});

const getSubDevice = catchAsync(async (req, res) => {
  const subDevice = await getSubDeviceBySubDeviceIdService(req.params.deviceId, req.params.subDeviceId);
  res.send(subDevice.transform());
});

const updateSubDevice = catchAsync(async (req, res) => {
  req.body._updatedBy = req.user.email;
  await getDeviceByDeviceIdService(req.params.deviceId);
  const subDevice = await updateSubDeviceService(req.params.deviceId, req.params.subDeviceId, req.body);
  res.send(subDevice.transform());
});

const deleteSubDevice = catchAsync(async (req, res) => {
  await deleteSubDeviceService(req.params.deviceId, req.params.subDeviceId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSubDevice,
  getSubDevices,
  getSubDevice,
  updateSubDevice,
  deleteSubDevice,
};
