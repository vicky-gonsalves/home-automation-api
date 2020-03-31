'use strict';

import SubDeviceParam from '../models/subDeviceParam.model';
import logger from '../config/logger';
import config from '../config/config';

const subDeviceParams = [
  {
    deviceId: 'tank000000000001',
    subDeviceId: 'sub_tank000000000001',
    paramName: 'status',
    paramValue: 'off',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'tank000000000001',
    subDeviceId: 'sub_tank000000000002',
    paramName: 'status',
    paramValue: 'off',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'tank000000000001',
    subDeviceId: 'sub_tank000000000001',
    paramName: 'mode',
    paramValue: 'automatic',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'tank000000000001',
    subDeviceId: 'sub_tank000000000002',
    paramName: 'mode',
    paramValue: 'automatic',
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
    deviceId: 'bedroom000000001',
    subDeviceId: 'sub_bedroom000000002',
    paramName: 'status',
    paramValue: 'off',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'outdoor000000001',
    subDeviceId: 'sub_outdoor000000001',
    paramName: 'status',
    paramValue: 'off',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'outdoor000000001',
    subDeviceId: 'sub_outdoor000000002',
    paramName: 'status',
    paramValue: 'off',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'outdoor000000001',
    subDeviceId: 'sub_outdoor000000003',
    paramName: 'status',
    paramValue: 'off',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'outdoor000000001',
    subDeviceId: 'sub_outdoor000000004',
    paramName: 'status',
    paramValue: 'off',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'bedroom000000002',
    subDeviceId: 'sub_bedroom200000001',
    paramName: 'status',
    paramValue: 'off',
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
