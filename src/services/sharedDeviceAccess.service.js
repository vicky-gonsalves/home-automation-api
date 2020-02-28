import httpStatus from 'http-status';
import SharedDeviceAccess from '../models/sharedDeviceAccess.model';
import { getDeviceByDeviceIdService } from './device.service';
import AppError from '../utils/AppError';
import { getUserByEmailService } from './user.service';

const createSharedDeviceAccessService = async sharedDeviceAccessBody => {
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
  createSharedDeviceAccessService,
  getSharedDeviceAccessByIdService,
  deleteSharedDeviceAccessService,
};
