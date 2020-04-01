import Log from '../models/log.model';
import { flatten } from 'lodash';

const createLogService = (deviceId, subDeviceId, logName, logDescription, triggeredByDevice, isDevLog, createdBy) =>
  Log.create({ deviceId, subDeviceId, logName, logDescription, triggeredByDevice, isDevLog, createdBy });

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
