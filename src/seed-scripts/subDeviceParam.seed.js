'use strict';

import SubDeviceParam from '../models/subDeviceParam.model';
import logger from '../config/logger';
import config from '../config/config';

const subDeviceParams = [
  {
    deviceId: 'tank000000000001',
    subDeviceId: 'sub_tank000000000001',
    paramName: 'waterLevel',
    paramValue: 80,
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'tank000000000001',
    subDeviceId: 'sub_tank000000000001',
    paramName: 'tankHeight',
    paramValue: 124,
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'tank000000000001',
    subDeviceId: 'sub_tank000000000001',
    paramName: 'status',
    paramValue: 'off',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'bedroom000000001',
    subDeviceId: 'sub_bedroom000000001',
    paramName: 'status',
    paramValue: 'off',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'bedroom000000002',
    subDeviceId: 'sub_bedroom200000001',
    paramName: 'status',
    paramValue: 'on',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
];

const SeedSubDeviceParamFn = async () => {
  await SubDeviceParam.find({}).deleteMany();
  await SubDeviceParam.create(subDeviceParams);
  logger.info('SubDeviceParam Seed Done');
};

module.exports = SeedSubDeviceParamFn;
