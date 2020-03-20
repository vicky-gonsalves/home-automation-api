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
import { getSharedDeviceAccessByDeviceIdService } from '../services/sharedDeviceAccess.service';
import { getSocketIdsByDeviceIdService, getSocketIdsByEmailsService } from '../services/socketId.service';
import NotificationService from '../services/notification.service';
import uniqid from 'uniqid';
import { createTankSettingService, createSmartSwitchSettingService } from '../services/setting.service';
import { deviceVariant } from '../config/device';

const sendSubDeviceSocketNotification = async (device, event, subDevice) => {
  const deviceAccees = await getSharedDeviceAccessByDeviceIdService(device.deviceId);
  const emails = [device.deviceOwner, ...deviceAccees.map(access => access.email)];
  const socketIds = [
    ...(await getSocketIdsByDeviceIdService(device.deviceId)), // send to device
    ...(await getSocketIdsByEmailsService(emails)), // send to users
  ];
  if (socketIds.length) {
    NotificationService.sendMessage(socketIds, event, subDevice);
  }
};

const createSubDevice = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.email;
  req.body.subDeviceId = uniqid();
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  const subDevice = await createSubDeviceService(req.params.deviceId, req.body);
  if (device.variant === deviceVariant[0]) {
    await createTankSettingService(subDevice);
  } else {
    await createSmartSwitchSettingService(subDevice);
  }
  await sendSubDeviceSocketNotification(device, 'SUB_DEVICE_CREATED', subDevice);
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
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  const subDevice = await updateSubDeviceService(req.params.deviceId, req.params.subDeviceId, req.body);
  await sendSubDeviceSocketNotification(device, 'SUB_DEVICE_UPDATED', subDevice);
  res.send(subDevice.transform());
});

const deleteSubDevice = catchAsync(async (req, res) => {
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  const subDevice = await getSubDeviceBySubDeviceIdService(req.params.deviceId, req.params.subDeviceId);
  await sendSubDeviceSocketNotification(device, 'SUB_DEVICE_DELETED', subDevice);
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
