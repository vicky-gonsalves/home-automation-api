import moment from 'moment';
import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import config from '../config/config';
import { generateTokenService, saveTokenService, verifyTokenService } from './token.service';
import Token from '../models/token.model';
import AppError from '../utils/AppError';
import { getUserByEmailService, getUserByIdService, updateUserService } from './user.service';

const generateAuthTokensService = async userId => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateTokenService(userId, accessTokenExpires);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateTokenService(userId, refreshTokenExpires);
  await saveTokenService(refreshToken, userId, refreshTokenExpires, 'refresh');

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

const checkPasswordService = async (password, correctPassword) => {
  const isPasswordMatch = await bcrypt.compare(password, correctPassword);
  if (!isPasswordMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Passwords do not match');
  }
};

const loginUserService = async (email, password) => {
  try {
    const user = await getUserByEmailService(email);
    await checkPasswordService(password, user.password);
    return user;
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
};

const refreshAuthTokensService = async refreshToken => {
  try {
    const refreshTokenDoc = await verifyTokenService(refreshToken, 'refresh');
    const userId = refreshTokenDoc.user;
    await getUserByIdService(userId);
    await refreshTokenDoc.remove();
    return await generateAuthTokensService(userId);
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

const generateResetPasswordTokenService = async email => {
  const user = await getUserByEmailService(email);
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateTokenService(user._id, expires);
  await saveTokenService(resetPasswordToken, user._id, expires, 'resetPassword');
  return resetPasswordToken;
};

const resetUserPasswordService = async (resetPasswordToken, newPassword) => {
  let userId;
  try {
    const resetPasswordTokenDoc = await verifyTokenService(resetPasswordToken, 'resetPassword');
    userId = resetPasswordTokenDoc.user;
    await updateUserService(userId, { password: newPassword });
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
  await Token.deleteMany({ user: userId, type: 'resetPassword' });
};

const getMeService = async user => {
  return user.transform();
};

module.exports = {
  generateAuthTokensService,
  loginUserService,
  refreshAuthTokensService,
  generateResetPasswordTokenService,
  resetUserPasswordService,
  getMeService,
};
