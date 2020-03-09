import httpStatus from 'http-status';
import {
  createDeviceService,
  deleteDeviceService,
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
import uniqid from 'uniqid';

const sendDeviceSocketNotification = async (device, event) => {
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

const createDevice = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.email;
  req.body.deviceId = uniqid();
  const device = await createDeviceService(req.body);
  await sendDeviceSocketNotification(device, 'DEVICE_CREATED');
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
  await sendDeviceSocketNotification(device, 'DEVICE_UPDATED');
  res.send(device.transform());
});

const deleteDevice = catchAsync(async (req, res) => {
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  await sendDeviceSocketNotification(device, 'DEVICE_DELETED');
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
