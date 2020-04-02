import Log from '../models/log.model';
import { flatten } from 'lodash';
import { getSocketIdsByEmailsService } from './socketId.service';
import { getSharedDeviceAccessByDeviceIdService } from './sharedDeviceAccess.service';
import NotificationService from './notification.service';
import { getUserByEmailForLogService } from './user.service';

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
  let user = { name: 'system' };
  const payload = {
    deviceId: device.deviceId,
    subDeviceId,
    logName,
    logDescription,
    triggeredByDevice,
    isDevLog,
    createdBy,
  };
  const log = await Log.create(payload);
  if (!triggeredByDevice) {
    user = await getUserByEmailForLogService(createdBy);
  }
  await sendLogNotification(device, 'LOG_CREATED', isDevLog ? log : { ...log.transform(), userName: user.name });
  return log;
};

const getLogsByDeviceIdService = async deviceIds => {
  const logs = await Promise.all(
    deviceIds.map(deviceId =>
      Log.aggregate([
        {
          $match: { deviceId, isDevLog: false },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: 'email',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $project: {
            userName: '$user.name',
            isDevLog: 1,
            triggeredByDevice: 1,
            deviceId: 1,
            subDeviceId: 1,
            logName: 1,
            logDescription: 1,
            createdBy: 1,
            createdAt: 1,
          },
        },
      ]).exec()
    )
  );
  return flatten(logs);
};

module.exports = {
  createLogService,
  getLogsByDeviceIdService,
};
