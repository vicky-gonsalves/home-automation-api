'use strict';

import Setting from '../models/setting.model';
import logger from '../config/logger';

const settings = [
  {
    type: 'device',
    idType: 'deviceId',
    bindedTo: 'tank000000000001',
    paramName: 'preferredSubDevice',
    paramValue: 'sub_tank000000000002',
  },
  {
    type: 'device',
    idType: 'deviceId',
    bindedTo: 'tank000000000001',
    paramName: 'autoShutDownTime',
    paramValue: 30,
  },
  {
    type: 'device',
    idType: 'deviceId',
    bindedTo: 'tank000000000001',
    paramName: 'waterLevelToStart',
    paramValue: 70,
  },
  {
    type: 'subDevice',
    idType: 'subDeviceId',
    parent: 'bedroom000000001',
    bindedTo: 'sub_bedroom000000001',
    paramName: 'autoShutDownTime',
    paramValue: 0,
  },
  {
    type: 'subDevice',
    idType: 'subDeviceId',
    parent: 'bedroom000000001',
    bindedTo: 'sub_bedroom000000002',
    paramName: 'autoShutDownTime',
    paramValue: 0,
  },
  {
    type: 'subDevice',
    idType: 'subDeviceId',
    parent: 'outdoor000000001',
    bindedTo: 'sub_outdoor000000001',
    paramName: 'autoShutDownTime',
    paramValue: 0,
  },
  {
    type: 'subDevice',
    idType: 'subDeviceId',
    parent: 'outdoor000000001',
    bindedTo: 'sub_outdoor000000002',
    paramName: 'autoShutDownTime',
    paramValue: 0,
  },
  {
    type: 'subDevice',
    idType: 'subDeviceId',
    parent: 'outdoor000000001',
    bindedTo: 'sub_outdoor000000003',
    paramName: 'autoShutDownTime',
    paramValue: 0,
  },
  {
    type: 'subDevice',
    idType: 'subDeviceId',
    parent: 'outdoor000000001',
    bindedTo: 'sub_outdoor000000004',
    paramName: 'autoShutDownTime',
    paramValue: 0,
  },
  {
    type: 'subDevice',
    idType: 'subDeviceId',
    parent: 'bedroom000000002',
    bindedTo: 'sub_bedroom200000001',
    paramName: 'autoShutDownTime',
    paramValue: 0,
  },
];

const SeedSettingFn = async () => {
  await Setting.find({}).deleteMany();
  await Setting.create(settings);
  logger.info('Setting Seed Done');
};

module.exports = SeedSettingFn;
