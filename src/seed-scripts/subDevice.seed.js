'use strict';

import SubDevice from '../models/subDevice.model';
import logger from '../config/logger';
import config from '../config/config';

const subDevices = [
  {
    deviceId: 'tank000000000001',
    subDeviceId: 'sub_tank000000000001',
    name: 'Motor 1',
    type: 'motorSwitch',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'tank000000000001',
    subDeviceId: 'sub_tank000000000002',
    name: 'Motor 2',
    type: 'motorSwitch',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'bedroom000000001',
    subDeviceId: 'sub_bedroom000000001',
    name: 'Fan',
    type: 'switch',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'bedroom000000001',
    subDeviceId: 'sub_bedroom000000002',
    name: 'Light',
    type: 'switch',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'outdoor000000001',
    subDeviceId: 'sub_outdoor000000001',
    name: 'Light 1',
    type: 'switch',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'outdoor000000001',
    subDeviceId: 'sub_outdoor000000002',
    name: 'Light 2',
    type: 'switch',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'outdoor000000001',
    subDeviceId: 'sub_outdoor000000003',
    name: 'Light 3',
    type: 'switch',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'outdoor000000001',
    subDeviceId: 'sub_outdoor000000004',
    name: 'Street Lights',
    type: 'switch',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'bedroom000000002',
    subDeviceId: 'sub_bedroom200000001',
    name: 'Light',
    type: 'switch',
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
];

const SeedSubDeviceFn = async () => {
  await SubDevice.find({}).deleteMany();
  await SubDevice.create(subDevices);
  logger.info('SubDevice Seed Done');
};

module.exports = SeedSubDeviceFn;
