import httpStatus from 'http-status';
import { pick } from 'lodash';
import { updateSubDeviceParamSubDeviceIdService, deleteSubDeviceParamByDeviceIdService } from './subDeviceParam.service';
import AppError from '../utils/AppError';
import SubDevice from '../models/subDevice.model';
import { getQueryOptions } from '../utils/service.util';

const checkDuplicateSubDeviceIdService = async (subDeviceId, excludeSubDeviceId) => {
  const subDevice = await SubDevice.findOne({ subDeviceId, _id: { $ne: excludeSubDeviceId } });
  if (subDevice) {
    throw new AppError(httpStatus.BAD_REQUEST, 'subDeviceId already registered');
  }
};

const createSubDeviceService = async (deviceId, _subDeviceBody) => {
  const subDeviceBody = _subDeviceBody;
  await checkDuplicateSubDeviceIdService(subDeviceBody.subDeviceId);
  subDeviceBody.deviceId = deviceId;
  return SubDevice.create(subDeviceBody);
};

const getSubDevicesService = async (deviceId, query) => {
  const filter = pick(query, [
    'id',
    'subDeviceId',
    'name',
    'type',
    'registeredAt',
    'isDisabled',
    'subDeviceOwner',
    'createdBy',
    'updatedBy',
  ]);
  filter.deviceId = deviceId;
  const options = getQueryOptions(query);
  return SubDevice.find(filter, null, options);
};

const getSubDeviceBySubDeviceIdService = async (deviceId, subDeviceId) => {
  const subDevice = await SubDevice.findOne({ deviceId, subDeviceId });
  if (!subDevice) {
    throw new AppError(httpStatus.NOT_FOUND, 'No subDevice found');
  }
  return subDevice;
};

const updateSubDeviceService = async (deviceId, subDeviceId, updateBody) => {
  const subDevice = await getSubDeviceBySubDeviceIdService(deviceId, subDeviceId);
  const oldSubDeviceId = subDevice.subDeviceId;
  if (updateBody.subDeviceId) {
    await checkDuplicateSubDeviceIdService(updateBody.subDeviceId, subDevice.id);
  }
  await Object.assign(subDevice, updateBody);
  await subDevice.save();
  if (updateBody.subDeviceId) {
    await updateSubDeviceParamSubDeviceIdService(oldSubDeviceId, updateBody.subDeviceId);
  }
  return subDevice;
};

const updateDeviceIdService = async (oldDeviceId, newDeviceId) => {
  const subDevices = await SubDevice.find({ deviceId: oldDeviceId });
  return Promise.all(
    subDevices.map(async subDevice => {
      Object.assign(subDevice, { deviceId: newDeviceId });
      await subDevice.save();
      return subDevice;
    })
  );
};

const updateSubDeviceCreatedByService = async (oldEmail, newEmail) => {
  const subDevices = await SubDevice.find({ createdBy: oldEmail });
  return Promise.all(
    subDevices.map(async subDevice => {
      Object.assign(subDevice, { createdBy: newEmail });
      await subDevice.save();
      return subDevice;
    })
  );
};

const updateSubDeviceUpdatedByService = async (oldEmail, newEmail) => {
  const subDevices = await SubDevice.find({ updatedBy: oldEmail });
  return Promise.all(
    subDevices.map(async subDevice => {
      Object.assign(subDevice, { updatedBy: newEmail });
      await subDevice.save();
      return subDevice;
    })
  );
};

const deleteSubDeviceService = async (deviceId, subDeviceId) => {
  await deleteSubDeviceParamByDeviceIdService(deviceId);
  const subDevice = await getSubDeviceBySubDeviceIdService(deviceId, subDeviceId);
  await subDevice.remove();
  return subDevice;
};

const deleteSubDevicesByDeviceIdService = async deviceId => {
  await deleteSubDeviceParamByDeviceIdService(deviceId);
  const subDevices = await SubDevice.find({ deviceId });
  return Promise.all(subDevices.map(subDevice => subDevice.remove()));
};

module.exports = {
  createSubDeviceService,
  getSubDevicesService,
  getSubDeviceBySubDeviceIdService,
  updateSubDeviceService,
  updateDeviceIdService,
  updateSubDeviceCreatedByService,
  updateSubDeviceUpdatedByService,
  deleteSubDeviceService,
  deleteSubDevicesByDeviceIdService,
};
