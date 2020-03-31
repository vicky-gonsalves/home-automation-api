import DeviceParam from '../models/deviceParam.model';
import logger from '../config/logger';
import config from '../config/config';

const deviceParams = [
  {
    deviceId: 'tank000000000001',
    paramName: 'waterLevel',
    paramValue: 78,
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
];

const SeedDeviceParamFn = async () => {
  await DeviceParam.find({}).deleteMany();
  await DeviceParam.create(deviceParams);
  logger.info('DeviceParam Seed Done');
};

module.exports = SeedDeviceParamFn;
