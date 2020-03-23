'use strict';

import SharedDeviceAccess from '../models/sharedDeviceAccess.model';
import logger from '../config/logger';
import config from '../config/config';

const sharedDeviceAccess = [
  {
    deviceId: 'tank000000000001',
    email: 'johndoe@email.com',
    sharedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'tank000000000001',
    email: 'johndoe2@email.com',
    sharedBy: config.defaultAdmin.email,
  },
  {
    deviceId: 'bedroom000000002',
    email: config.defaultAdmin.email,
    sharedBy: config.defaultAdmin.email,
  },
];

const SeedSharedDeviceAccessFn = async () => {
  await SharedDeviceAccess.find({}).deleteMany();
  await SharedDeviceAccess.create(sharedDeviceAccess);
  logger.info('Shared Device Access Seed Done');
};

module.exports = SeedSharedDeviceAccessFn;
