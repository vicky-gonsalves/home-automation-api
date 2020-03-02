import { registerDeviceService } from '../services/device.service';
import {
  deleteSocketIdByDeviceIdService,
  deleteSocketIdBySocketIdService,
  registerSocketService,
} from '../services/socketId.service';

const registerDeviceSocket = async (type, idType, bindedTo, socketId) => {
  await deleteSocketIdByDeviceIdService(bindedTo);
  const device = await registerDeviceService(bindedTo);
  await registerSocketService(type, idType, device.deviceId, socketId);
  return device;
};

const registerUserSocket = async (type, idType, bindedTo, socketId) => {
  // no deletion of existing socketIds as user can have multiple socketIds
  return registerSocketService(type, idType, bindedTo, socketId);
};

const handleDisconnection = async socketId => {
  return deleteSocketIdBySocketIdService(socketId);
};

module.exports = {
  registerDeviceSocket,
  registerUserSocket,
  handleDisconnection,
};
