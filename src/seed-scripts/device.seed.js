'use strict';

import Device from '../models/device.model';
import logger from '../config/logger';
import config from '../config/config';

const devices = [
  {
    deviceId: 'tank000000000001',
    name: 'Tank',
    type: 'arduino',
    deviceOwner: config.defaultAdmin.email,
    registeredAt: new Date(),
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'bedroom000000001',
    name: 'Bedroom',
    type: 'arduino',
    deviceOwner: config.defaultAdmin.email,
    registeredAt: new Date(),
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'outdoor000000001',
    name: 'Outdoor Lights',
    type: 'arduino',
    deviceOwner: config.defaultAdmin.email,
    registeredAt: new Date(),
    createdBy: config.defaultAdmin.email,
    updatedBy: config.defaultAdmin.email,
  },
];

const SeedDeviceFn = async () => {
  await Device.find({}).deleteMany();
  await Device.create(devices);
  logger.info('Device Seed Done');
};

module.exports = SeedDeviceFn;
