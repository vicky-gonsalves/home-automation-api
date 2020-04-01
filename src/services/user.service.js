import httpStatus from 'http-status';
import { pick } from 'lodash';
import User from '../models/user.model';
import AppError from '../utils/AppError';
import { getQueryOptions } from '../utils/service.util';
import {
  deleteDevicesByDeviceOwnerService,
  updateDeviceCreatedByService,
  updateDeviceOwnerService,
  updateDeviceUpdatedByService,
} from './device.service';
import { deleteSocketIdByUserEmailService, updateSocketEmailService } from './socketId.service';
import { updateSubDeviceCreatedByService, updateSubDeviceUpdatedByService } from './subDevice.service';
import { updateSubDeviceParamCreatedByService, updateSubDeviceParamUpdatedByService } from './subDeviceParam.service';
import {
  deleteSharedDeviceAccessByUserEmailService,
  updateSharedDeviceAccessEmailService,
} from './sharedDeviceAccess.service';
import { updateDeviceParamCreatedByService, updateDeviceParamUpdatedByService } from './deviceParam.service';

const checkDuplicateEmailService = async (email, excludeUserId) => {
  const user = await User.findOne({ email, _id: { $ne: excludeUserId } });
  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
};

const createUserService = async userBody => {
  await checkDuplicateEmailService(userBody.email);
  return User.create(userBody);
};

const getUsersService = async query => {
  const filter = pick(query, ['name', 'role']);
  const options = getQueryOptions(query);
  return User.find(filter, null, options);
};

const getUserByIdService = async userId => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

const getUserByEmailService = async email => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found with this email');
  }
  return user;
};

const getUserByEmailForLogService = async email => User.findOne({ email });

const updateUserService = async (userId, updateBody) => {
  const user = await getUserByIdService(userId);
  const oldEmail = user.email;
  if (updateBody.email) {
    await checkDuplicateEmailService(updateBody.email, userId);
  }
  Object.assign(user, updateBody);
  await user.save();
  if (updateBody.email) {
    await updateDeviceOwnerService(oldEmail, updateBody.email);
    await updateDeviceCreatedByService(oldEmail, updateBody.email);
    await updateDeviceUpdatedByService(oldEmail, updateBody.email);
    await updateDeviceParamCreatedByService(oldEmail, updateBody.email);
    await updateDeviceParamUpdatedByService(oldEmail, updateBody.email);
    await updateSubDeviceCreatedByService(oldEmail, updateBody.email);
    await updateSubDeviceUpdatedByService(oldEmail, updateBody.email);
    await updateSubDeviceParamCreatedByService(oldEmail, updateBody.email);
    await updateSubDeviceParamUpdatedByService(oldEmail, updateBody.email);
    await updateSocketEmailService(oldEmail, updateBody.email);
    await updateSharedDeviceAccessEmailService(oldEmail, updateBody.email);
  }
  return user;
};

const deleteUserService = async userId => {
  const user = await getUserByIdService(userId);
  await deleteDevicesByDeviceOwnerService(user.email);
  await deleteSocketIdByUserEmailService(user.email);
  await deleteSharedDeviceAccessByUserEmailService(user.email);
  await user.remove();
  return user;
};

module.exports = {
  createUserService,
  getUsersService,
  getUserByIdService,
  getUserByEmailService,
  updateUserService,
  deleteUserService,
  getUserByEmailForLogService,
};
