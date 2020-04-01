import Log from '../models/log.model';

const createLogService = (deviceId, subDeviceId, logName, logDescription, triggeredByDevice, isDevLog, createdBy) =>
  Log.create({ deviceId, subDeviceId, logName, logDescription, triggeredByDevice, isDevLog, createdBy });

module.exports = {
  createLogService,
};
