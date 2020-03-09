import httpStatus from 'http-status';
import { pick } from 'lodash';
import SharedDeviceAccess from '../models/sharedDeviceAccess.model';
import AppError from '../utils/AppError';
import { getQueryOptions } from '../utils/service.util';

const checkDuplicateSharedDeviceAccessService = async (deviceId, email, excludeDeviceId) => {
  const sharedDeviceAccess = await SharedDeviceAccess.findOne({ deviceId, email, _id: { $ne: excludeDeviceId } });
  if (sharedDeviceAccess) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already have access to device');
  }
};

const checkAccessIfExists = async (deviceId, email) => {
  const sharedDeviceAccess = await SharedDeviceAccess.findOne({ deviceId, email });
  if (!sharedDeviceAccess) {
    throw new AppError(httpStatus.FORBIDDEN, "User doesn't have access to the device");
  }
  return sharedDeviceAccess;
};

const createSharedDeviceAccessService = async sharedDeviceAccessBody => {
  await checkDuplicateSharedDeviceAccessService(sharedDeviceAccessBody.deviceId, sharedDeviceAccessBody.email);
  return SharedDeviceAccess.create(sharedDeviceAccessBody);
};

const getSharedDeviceAccessByIdService = async id => {
  const sharedDeviceAccess = await SharedDeviceAccess.findById(id);
  if (!sharedDeviceAccess) {
    throw new AppError(httpStatus.NOT_FOUND, 'No shared device access found with this id');
  }
  return sharedDeviceAccess;
};

const getSharedDeviceAccessesService = async query => {
  const filter = pick(query, ['id', 'deviceId', 'email', 'sharedBy', 'isDisabled']);
  const options = getQueryOptions(query);
  return SharedDeviceAccess.find(filter, null, options);
};

const deleteSharedDeviceAccessByDeviceIdService = async deviceId => {
  const sharedDeviceAccesses = await SharedDeviceAccess.find({ deviceId });
  return Promise.all(sharedDeviceAccesses.map(sharedDeviceAccess => sharedDeviceAccess.remove()));
};

const updateSharedDeviceAccessService = async (id, updateBody) => {
  const sharedDeviceAccess = await getSharedDeviceAccessByIdService(id);
  if (updateBody.deviceId || updateBody.email) {
    await checkDuplicateSharedDeviceAccessService(updateBody.deviceId, updateBody.email, id);
  }
  Object.assign(sharedDeviceAccess, updateBody);
  await sharedDeviceAccess.save();
  return sharedDeviceAccess;
};

const updateSharedDeviceAccessEmailService = async (oldEmail, newEmail) => {
  const sharedDeviceAccesses = await SharedDeviceAccess.find({ email: oldEmail });
  return Promise.all(
    sharedDeviceAccesses.map(async sharedDeviceAccess => {
      Object.assign(sharedDeviceAccess, { email: newEmail });
      await sharedDeviceAccess.save();
      return sharedDeviceAccess;
    })
  );
};

const deleteSharedDeviceAccessService = async id => {
  const sharedDeviceAccess = await getSharedDeviceAccessByIdService(id);
  await sharedDeviceAccess.remove();
  return sharedDeviceAccess;
};

const checkAndDeleteAccessIfExists = async (deviceId, email) => {
  const sharedDeviceAccesses = await SharedDeviceAccess.find({ deviceId, email });
  return Promise.all(sharedDeviceAccesses.map(sharedDeviceAccess => sharedDeviceAccess.remove()));
};

const deleteSharedDeviceAccessByUserEmailService = async email => {
  const sharedDeviceAccesses = await SharedDeviceAccess.find({ email });
  return Promise.all(sharedDeviceAccesses.map(sharedDeviceAccess => sharedDeviceAccess.remove()));
};

const getSharedDeviceAccessByDeviceIdService = deviceId => {
  return SharedDeviceAccess.find({ deviceId, isDisabled: false });
};

const getSharedDeviceAccessByEmailService = email => {
  return SharedDeviceAccess.find({ email, isDisabled: false });
};

module.exports = {
  checkDuplicateSharedDeviceAccessService,
  createSharedDeviceAccessService,
  getSharedDeviceAccessByIdService,
  getSharedDeviceAccessesService,
  updateSharedDeviceAccessService,
  updateSharedDeviceAccessEmailService,
  deleteSharedDeviceAccessByDeviceIdService,
  deleteSharedDeviceAccessService,
  deleteSharedDeviceAccessByUserEmailService,
  checkAndDeleteAccessIfExists,
  getSharedDeviceAccessByDeviceIdService,
  getSharedDeviceAccessByEmailService,
  checkAccessIfExists,
};
