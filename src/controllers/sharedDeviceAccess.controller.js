import httpStatus from 'http-status';
import {
  createSharedDeviceAccessService,
  deleteSharedDeviceAccessService,
  getSharedDeviceAccessByIdService,
  getSharedDeviceAccessesService,
  updateSharedDeviceAccessService,
} from '../services/sharedDeviceAccess.service';
import catchAsync from '../utils/catchAsync';
import { checkIfEmailIsDeviceOwnerAndFail, getDeviceByDeviceIdService } from '../services/device.service';
import { getUserByEmailService } from '../services/user.service';
import { getSocketIdsByEmailsService } from '../services/socketId.service';
import NotificationService from '../services/notification.service';

const sendSharedDeviceSocketNotification = async (device, socketIds, event) => {
  if (socketIds.length) {
    NotificationService.sendMessage(socketIds, event, device);
  }
};

const createSharedDeviceAccess = catchAsync(async (req, res) => {
  req.body.sharedBy = req.user.email;
  const device = await getDeviceByDeviceIdService(req.body.deviceId);
  const user = await getUserByEmailService(req.body.email);
  const socketIds = await getSocketIdsByEmailsService(user.email);
  await checkIfEmailIsDeviceOwnerAndFail(req.body.deviceId, req.body.email);
  const sharedDeviceAccess = await createSharedDeviceAccessService(req.body);
  await sendSharedDeviceSocketNotification(device, socketIds, 'SHARED_DEVICE_ACCESS_CREATED');
  res.status(httpStatus.CREATED).send(sharedDeviceAccess.transform());
});

const getSharedDeviceAccesses = catchAsync(async (req, res) => {
  const sharedDeviceAccesses = await getSharedDeviceAccessesService(req.query);
  const response = sharedDeviceAccesses.map(sharedDeviceAccess => sharedDeviceAccess.transform());
  res.send(response);
});

const getSharedDeviceAccess = catchAsync(async (req, res) => {
  const sharedDeviceAccess = await getSharedDeviceAccessByIdService(req.params.id);
  res.send(sharedDeviceAccess.transform());
});

// Not going to use this api
const updateSharedDeviceAccess = catchAsync(async (req, res) => {
  const sharedDeviceAccess = await getSharedDeviceAccessByIdService(req.params.id);
  const device = await getDeviceByDeviceIdService(sharedDeviceAccess.deviceId);
  if (req.body.deviceId || req.body.email) {
    await checkIfEmailIsDeviceOwnerAndFail(device.deviceId, req.body.email);
  }
  const updatedSharedDeviceAccess = await updateSharedDeviceAccessService(req.params.id, req.body);
  res.send(updatedSharedDeviceAccess.transform());
});

const deleteSharedDeviceAccess = catchAsync(async (req, res) => {
  const sharedDeviceAccess = await getSharedDeviceAccessByIdService(req.params.id);
  const device = await getDeviceByDeviceIdService(sharedDeviceAccess.deviceId);
  const socketIds = await getSocketIdsByEmailsService(sharedDeviceAccess.email);
  await sendSharedDeviceSocketNotification(device, socketIds, 'SHARED_DEVICE_ACCESS_DELETED');
  await deleteSharedDeviceAccessService(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSharedDeviceAccess,
  getSharedDeviceAccesses,
  getSharedDeviceAccess,
  updateSharedDeviceAccess,
  deleteSharedDeviceAccess,
};
