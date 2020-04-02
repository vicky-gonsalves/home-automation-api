import { getActiveDeviceByDeviceIdService, registerDeviceService } from '../services/device.service';
import {
  deleteSocketIdByDeviceIdService,
  deleteSocketIdBySocketIdService,
  getOnlineDeviceBySocketIdService,
  getSocketIdsByEmailsService,
  registerSocketService,
} from '../services/socketId.service';
import { getSharedDeviceAccessByDeviceIdService } from '../services/sharedDeviceAccess.service';
import NotificationService from '../services/notification.service';
import { updateStatusToOff } from './subDeviceParam.controller';

const sendOnlineDeviceNotification = async (device, event, onlineDevice) => {
  const deviceAccees = await getSharedDeviceAccessByDeviceIdService(device.deviceId);
  const emails = [device.deviceOwner, ...deviceAccees.map(access => access.email)];
  const socketIds = [
    ...(await getSocketIdsByEmailsService(emails)), // send to users
  ];
  if (socketIds.length) {
    NotificationService.sendMessage(socketIds, event, onlineDevice);
  }
};

const registerDeviceSocket = async (type, idType, bindedTo, socketId) => {
  await deleteSocketIdByDeviceIdService(bindedTo);
  const device = await registerDeviceService(bindedTo);
  const onlineDevice = await registerSocketService(type, idType, device.deviceId, socketId);
  await sendOnlineDeviceNotification(device, 'SOCKET_ID_CREATED', onlineDevice);
  return device;
};

const registerUserSocket = async (type, idType, bindedTo, socketId) => {
  // no deletion of existing socketIds as user can have multiple socketIds
  return registerSocketService(type, idType, bindedTo, socketId);
};

const handleDisconnection = async socketId => {
  const onlineDevice = await getOnlineDeviceBySocketIdService(socketId);
  if (onlineDevice) {
    const device = await getActiveDeviceByDeviceIdService(onlineDevice.bindedTo);
    await sendOnlineDeviceNotification(device, 'SOCKET_ID_DELETED', onlineDevice);
    await updateStatusToOff(device);
  }
  return deleteSocketIdBySocketIdService(socketId);
};

module.exports = {
  registerDeviceSocket,
  registerUserSocket,
  handleDisconnection,
};
