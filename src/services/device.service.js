import httpStatus from 'http-status';
import { pick } from 'lodash';
import Device from '../models/device.model';
import AppError from '../utils/AppError';
import { getQueryOptions } from '../utils/service.util';
import {
  checkAndDeleteAccessIfExists,
  deleteSharedDeviceAccessByDeviceIdService,
  updateSharedDeviceAccessDeviceIdService,
} from './sharedDeviceAccess.service';
import { deleteSocketIdByDeviceIdService, updateSocketDeviceIdService } from './socketId.service';
import { deleteSubDevicesByDeviceIdService, updateDeviceIdService } from './subDevice.service';
import { updateSubDeviceParamDeviceIdService } from './subDeviceParam.service';

const checkDuplicateDeviceIdService = async (deviceId, excludeDeviceId) => {
  const device = await Device.findOne({ deviceId, _id: { $ne: excludeDeviceId } });
  if (device) {
    throw new AppError(httpStatus.BAD_REQUEST, 'deviceId already registered');
  }
};

const checkIfEmailIsDeviceOwnerAndFail = async (deviceId, deviceOwner) => {
  const device = await Device.findOne({ deviceId, deviceOwner });
  if (device) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Since user owns the device, user already have access to it');
  }
};

const createDeviceService = async deviceBody => {
  await checkDuplicateDeviceIdService(deviceBody.deviceId);
  return Device.create(deviceBody);
};

const getDevicesService = async query => {
  const filter = pick(query, [
    'id',
    'deviceId',
    'name',
    'type',
    'registeredAt',
    'isDisabled',
    'deviceOwner',
    'createdBy',
    'updatedBy',
  ]);
  const options = getQueryOptions(query);
  return Device.find(filter, null, options);
};

const getDeviceByDeviceIdService = async deviceId => {
  const device = await Device.findOne({ deviceId });
  if (!device) {
    throw new AppError(httpStatus.NOT_FOUND, 'No device found with this deviceId');
  }
  return device;
};

const getActiveDeviceByDeviceIdForRegistrationService = async deviceId => {
  const device = await Device.findOne({ deviceId, isDisabled: false });
  if (!device) {
    throw new AppError(httpStatus.NOT_FOUND, 'No active device found with this deviceId');
  }
  return device;
};

const getActiveDeviceByDeviceIdService = deviceId => {
  return Device.findOne({ deviceId, isDisabled: false });
};

const getDevicesByDeviceOwnerService = deviceOwner => {
  return Device.find({ deviceOwner });
};

const getActiveDevicesByDeviceIdService = async deviceIds => {
  const devices = await Device.find({ deviceId: { $in: deviceIds }, isDisabled: false });
  return devices.map(device => device.transform());
};

const getActiveDevicesByDeviceOwnerService = async deviceOwner => {
  const devices = await Device.find({ deviceOwner, isDisabled: false });
  return devices.map(device => device.transform());
};

const updateDeviceService = async (id, updateBody) => {
  let _dId;
  let _dOwner;
  const device = await getDeviceByDeviceIdService(id);
  const oldDeviceId = device.deviceId;
  if (updateBody && updateBody.deviceId) {
    await checkDuplicateDeviceIdService(updateBody.deviceId, device.id);
  }
  Object.assign(device, updateBody);
  await device.save();
  if (updateBody && updateBody.deviceId) {
    _dId = updateBody.deviceId;
  } else {
    _dId = device.deviceId;
  }
  if (updateBody && updateBody.deviceOwner) {
    _dOwner = updateBody.deviceOwner;
  } else {
    _dOwner = device.deviceOwner;
  }
  if ((updateBody && updateBody.deviceId) || (updateBody && updateBody.deviceOwner)) {
    await checkAndDeleteAccessIfExists(_dId, _dOwner);
  }
  if (updateBody && updateBody.deviceId) {
    await updateDeviceIdService(oldDeviceId, updateBody.deviceId);
    await updateSubDeviceParamDeviceIdService(oldDeviceId, updateBody.deviceId);
    await updateSocketDeviceIdService(oldDeviceId, updateBody.deviceId);
    await updateSharedDeviceAccessDeviceIdService(oldDeviceId, updateBody.deviceId);
  }
  return device;
};

const updateDeviceOwnerService = async (oldEmail, newEmail) => {
  const devices = await Device.find({ deviceOwner: oldEmail });
  return Promise.all(
    devices.map(async device => {
      Object.assign(device, { deviceOwner: newEmail });
      await device.save();
      return device;
    })
  );
};

const updateDeviceCreatedByService = async (oldEmail, newEmail) => {
  const devices = await Device.find({ createdBy: oldEmail });
  return Promise.all(
    devices.map(async device => {
      Object.assign(device, { createdBy: newEmail });
      await device.save();
      return device;
    })
  );
};

const updateDeviceUpdatedByService = async (oldEmail, newEmail) => {
  const devices = await Device.find({ updatedBy: oldEmail });
  return Promise.all(
    devices.map(async device => {
      Object.assign(device, { updatedBy: newEmail });
      await device.save();
      return device;
    })
  );
};

const deleteDeviceService = async id => {
  const device = await getDeviceByDeviceIdService(id);
  await deleteSubDevicesByDeviceIdService(device.deviceId);
  await deleteSocketIdByDeviceIdService(device.deviceId);
  await deleteSharedDeviceAccessByDeviceIdService(device.deviceId);
  await device.remove();
  return device;
};

const deleteDevicesByDeviceOwnerService = async deviceOwner => {
  const devices = await getDevicesByDeviceOwnerService(deviceOwner);
  return Promise.all(
    devices.map(async device => {
      await deleteDeviceService(device.deviceId);
    })
  );
};

const registerDeviceService = async deviceId => {
  const device = await getActiveDeviceByDeviceIdForRegistrationService(deviceId);
  if (device && !device.registeredAt) {
    Object.assign(device, { registeredAt: new Date() });
    device.save();
  } else {
    device.save();
  }
  return device;
};

module.exports = {
  checkIfEmailIsDeviceOwnerAndFail,
  createDeviceService,
  getDevicesService,
  getDeviceByDeviceIdService,
  getDevicesByDeviceOwnerService,
  updateDeviceService,
  updateDeviceOwnerService,
  updateDeviceCreatedByService,
  updateDeviceUpdatedByService,
  deleteDeviceService,
  deleteDevicesByDeviceOwnerService,
  registerDeviceService,
  getActiveDeviceByDeviceIdForRegistrationService,
  getActiveDevicesByDeviceIdService,
  getActiveDevicesByDeviceOwnerService,
  getActiveDeviceByDeviceIdService,
};
