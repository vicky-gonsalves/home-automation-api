import httpStatus from 'http-status';
import SharedDeviceAccess from '../models/sharedDeviceAccess.model';
import { getDeviceByDeviceIdService } from './device.service';
import AppError from '../utils/AppError';
import { getUserByEmailService } from './user.service';

const checkDuplicateSharedDeviceAccessService = async (deviceId, email, excludeDeviceId) => {
  const sharedDeviceAccess = await SharedDeviceAccess.findOne({ deviceId, email, _id: { $ne: excludeDeviceId } });
  if (sharedDeviceAccess) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already have access to device');
  }
};

const createSharedDeviceAccessService = async sharedDeviceAccessBody => {
  await checkDuplicateSharedDeviceAccessService(sharedDeviceAccessBody.deviceId, sharedDeviceAccessBody.email);
  await getDeviceByDeviceIdService(sharedDeviceAccessBody.deviceId);
  await getUserByEmailService(sharedDeviceAccessBody.email);
  return SharedDeviceAccess.create(sharedDeviceAccessBody);
};

const getSharedDeviceAccessByIdService = async sharedDeviceAccessId => {
  const sharedDeviceAccess = await SharedDeviceAccess.findById(sharedDeviceAccessId);
  if (!sharedDeviceAccess) {
    throw new AppError(httpStatus.NOT_FOUND, 'No shared device access found with this id');
  }
  return sharedDeviceAccess;
};

const deleteSharedDeviceAccessService = async id => {
  const sharedDeviceAccess = await getSharedDeviceAccessByIdService(id);
  await sharedDeviceAccess.remove();
  return sharedDeviceAccess;
};

module.exports = {
  checkDuplicateSharedDeviceAccessService,
  createSharedDeviceAccessService,
  getSharedDeviceAccessByIdService,
  deleteSharedDeviceAccessService,
};
