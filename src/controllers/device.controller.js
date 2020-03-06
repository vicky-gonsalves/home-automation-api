import httpStatus from 'http-status';
import {
  createDeviceService,
  deleteDeviceService,
  getActiveDeviceByDeviceIdService,
  getDeviceByDeviceIdService,
  getDevicesByDeviceOwnerService,
  getDevicesService,
  updateDeviceService,
} from '../services/device.service';
import catchAsync from '../utils/catchAsync';
import { generateDeviceAuthTokensService } from '../services/deviceAuth.service';
import { getSharedDeviceAccessByDeviceIdService } from '../services/sharedDeviceAccess.service';
import { getSocketIdsByDeviceIdService, getSocketIdsByEmailsService } from '../services/socketId.service';
import NotificationService from '../services/notification.service';

const commonSocketNotification = async (device, event) => {
  const deviceAccees = await getSharedDeviceAccessByDeviceIdService(device.deviceId);
  const emails = [device.deviceOwner, ...deviceAccees.map(access => access.email)];
  const socketIds = [
    ...(await getSocketIdsByDeviceIdService(device.deviceId)), // send to device
    ...(await getSocketIdsByEmailsService(emails)), // send to users
  ];
  if (socketIds.length) {
    NotificationService.sendMessage(socketIds, event, device);
  }
};

const notifyDeletionOfDevice = async deviceId => {
  const device = await getActiveDeviceByDeviceIdService(deviceId);
  await commonSocketNotification(device, 'DEVICE_DELETED');
  return device;
};

const notifyCreationOfDevice = async device => {
  await commonSocketNotification(device, 'DEVICE_CREATED');
  return device;
};

const notifyUpdationOfDevice = async device => {
  await commonSocketNotification(device, 'DEVICE_UPDATED');
  return device;
};

const createDevice = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.email;
  const device = await createDeviceService(req.body);
  await notifyCreationOfDevice(device);
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
  await notifyUpdationOfDevice(device);
  res.send(device.transform());
});

const deleteDevice = catchAsync(async (req, res) => {
  await notifyDeletionOfDevice(req.params.deviceId);
  await deleteDeviceService(req.params.deviceId);
  res.status(httpStatus.NO_CONTENT).send();
});

const authorizeDevice = catchAsync(async (req, res) => {
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  const deviceAuth = generateDeviceAuthTokensService(device.deviceId);
  res.send(deviceAuth);
});

module.exports = {
  createDevice,
  getDevices,
  getDevice,
  getByDeviceOwner,
  updateDevice,
  deleteDevice,
  authorizeDevice,
};
