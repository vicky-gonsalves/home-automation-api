'use strict';

import SeedUserFn from './seed-scripts/user.seed';
import SeedDeviceFn from './seed-scripts/device.seed';
import SeedSubDeviceFn from './seed-scripts/subDevice.seed';
import SeedSubDeviceParamFn from './seed-scripts/subDeviceParam.seed';
import SeedSharedDeviceAccessFn from './seed-scripts/sharedDeviceAccess.seed';
import SeedSocketIdFn from './seed-scripts/socketId.seed';

const seedUser = true;
const seedDevice = true;
const seedSubDevice = true;
const seedSharedDevice = true;
const seedSeedSocketId = true;
const seedSubDeviceParam = true;

const Seed = async () => {
  if (seedUser) await SeedUserFn();
  if (seedDevice) await SeedDeviceFn();
  if (seedSubDevice) await SeedSubDeviceFn();
  if (seedSubDeviceParam) await SeedSubDeviceParamFn();
  if (seedSharedDevice) await SeedSharedDeviceAccessFn();
  if (seedSeedSocketId) await SeedSocketIdFn();
};

module.exports = Seed;
