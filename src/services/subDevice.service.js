import httpStatus from 'http-status';
import { pick } from 'lodash';
import { deleteSubDeviceParamByDeviceIdService, deleteSubDeviceParamBySubDeviceIdService } from './subDeviceParam.service';
import AppError from '../utils/AppError';
import SubDevice from '../models/subDevice.model';
import { getQueryOptions } from '../utils/service.util';

const createSubDeviceService = async (deviceId, _subDeviceBody) => {
  const subDeviceBody = _subDeviceBody;
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

const getSubDeviceByOnlySubDeviceIdService = async subDeviceId => {
  const subDevice = await SubDevice.findOne({ subDeviceId });
  if (!subDevice) {
    throw new AppError(httpStatus.NOT_FOUND, 'No subDevice found');
  }
  return subDevice;
};

const updateSubDeviceService = async (deviceId, subDeviceId, updateBody) => {
  const subDevice = await getSubDeviceBySubDeviceIdService(deviceId, subDeviceId);
  await Object.assign(subDevice, updateBody);
  await subDevice.save();
  return subDevice;
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
  await deleteSubDeviceParamBySubDeviceIdService(deviceId, subDeviceId);
  const subDevice = await getSubDeviceBySubDeviceIdService(deviceId, subDeviceId);
  await subDevice.remove();
  return subDevice;
};

const deleteSubDevicesByDeviceIdService = async deviceId => {
  await deleteSubDeviceParamByDeviceIdService(deviceId);
  const subDevices = await SubDevice.find({ deviceId });
  return Promise.all(subDevices.map(subDevice => subDevice.remove()));
};

const getActiveSubDevicesByDeviceIdService = async deviceIds => {
  const subDevices = await SubDevice.find({ deviceId: { $in: deviceIds }, isDisabled: false });
  return subDevices.map(subDevice => subDevice.transform());
};

const getActiveSubDevicesByDeviceIdAndSortService = async deviceId => {
  const subDevices = await SubDevice.find({ deviceId, isDisabled: false }).sort({ createdAt: 1, name: 1 });
  return subDevices.map(subDevice => subDevice.transform());
};

const getActiveSubDeviceByDeviceIdAndSubDeviceIdService = (deviceId, subDeviceId) => {
  return SubDevice.findOne({ deviceId, subDeviceId, isDisabled: false });
};

const getActiveSubDeviceByDeviceIdAndSubDeviceIdForMultiStatusChangeService = async deviceId => {
  const subDevices = await SubDevice.find({ deviceId, isDisabled: false });
  if (!subDevices.length) {
    throw new AppError(httpStatus.NOT_FOUND, 'No subDevice found');
  }
  return subDevices;
};

module.exports = {
  createSubDeviceService,
  getSubDevicesService,
  getSubDeviceByOnlySubDeviceIdService,
  getSubDeviceBySubDeviceIdService,
  updateSubDeviceService,
  updateSubDeviceCreatedByService,
  updateSubDeviceUpdatedByService,
  deleteSubDeviceService,
  deleteSubDevicesByDeviceIdService,
  getActiveSubDevicesByDeviceIdService,
  getActiveSubDeviceByDeviceIdAndSubDeviceIdService,
  getActiveSubDeviceByDeviceIdAndSubDeviceIdForMultiStatusChangeService,
  getActiveSubDevicesByDeviceIdAndSortService,
};
