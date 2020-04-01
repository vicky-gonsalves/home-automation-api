'use strict';

import SeedUserFn from './seed-scripts/user.seed';
import SeedDeviceFn from './seed-scripts/device.seed';
import SeedSubDeviceFn from './seed-scripts/subDevice.seed';
import SeedDeviceParamFn from './seed-scripts/deviceParam.seed';
import SeedSubDeviceParamFn from './seed-scripts/subDeviceParam.seed';
import SeedSharedDeviceAccessFn from './seed-scripts/sharedDeviceAccess.seed';
import SeedSocketIdFn from './seed-scripts/socketId.seed';
import SeedSettingFn from './seed-scripts/setting.seed';

const seedUser = true;
const seedDevice = true;
const seedSubDevice = true;
const seedSharedDevice = true;
const seedSeedSocketId = true;
const seedDeviceParam = true;
const seedSubDeviceParam = true;
const seedSetting = true;

const Seed = async () => {
  if (seedUser) await SeedUserFn();
  if (seedDevice) await SeedDeviceFn();
  if (seedSubDevice) await SeedSubDeviceFn();
  if (seedDeviceParam) await SeedDeviceParamFn();
  if (seedSubDeviceParam) await SeedSubDeviceParamFn();
  if (seedSharedDevice) await SeedSharedDeviceAccessFn();
  if (seedSeedSocketId) await SeedSocketIdFn();
  if (seedSetting) await SeedSettingFn();
};

module.exports = Seed;
