import Log from '../models/log.model';
import { flatten } from 'lodash';
import { getSocketIdsByEmailsService } from './socketId.service';
import { getSharedDeviceAccessByDeviceIdService } from './sharedDeviceAccess.service';
import NotificationService from './notification.service';

const sendLogNotification = async (device, event, log) => {
  const deviceAccees = await getSharedDeviceAccessByDeviceIdService(device.deviceId);
  const emails = [device.deviceOwner, ...deviceAccees.map(access => access.email)];
  const socketIds = [
    ...(await getSocketIdsByEmailsService(emails)), // send to users
  ];
  if (socketIds.length) {
    NotificationService.sendMessage(socketIds, event, log);
  }
};

const createLogService = async (device, subDeviceId, logName, logDescription, triggeredByDevice, isDevLog, createdBy) => {
  const log = await Log.create({
    deviceId: device.deviceId,
    subDeviceId,
    logName,
    logDescription,
    triggeredByDevice,
    isDevLog,
    createdBy,
  });
  await sendLogNotification(device, 'LOG_CREATED', log.transform());
  return log;
};

const getLogsByDeviceIdService = async deviceIds => {
  const logs = await Promise.all(
    deviceIds.map(deviceId =>
      Log.find({ deviceId, isDevLog: false })
        .sort({ createdAt: -1 })
        .limit(5)
    )
  );
  return flatten(logs).map(log => log.transform());
};

module.exports = {
  createLogService,
  getLogsByDeviceIdService,
};
