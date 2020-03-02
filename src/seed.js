'use strict';

import SeedUserFn from './seed-scripts/user.seed';
import SeedDeviceFn from './seed-scripts/device.seed';

const seedUser = true;
const seedDevice = true;

const Seed = async () => {
  if (seedUser) await SeedUserFn();
  if (seedDevice) await SeedDeviceFn();
};

module.exports = Seed;
