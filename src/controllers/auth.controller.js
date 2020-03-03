import httpStatus from 'http-status';
import {
  generateAuthTokensService,
  generateResetPasswordTokenService,
  getMeService,
  loginUserService,
  refreshAuthTokensService,
  resetUserPasswordService,
} from '../services/auth.service';
import { sendResetPasswordEmailService } from '../services/email.service';
import { createUserService } from '../services/user.service';

import catchAsync from '../utils/catchAsync';

const register = catchAsync(async (req, res) => {
  const user = await createUserService(req.body);
  const tokens = await generateAuthTokensService(user.id);
  const response = { user: user.transform(), tokens };
  res.status(httpStatus.CREATED).send(response);
});

const login = catchAsync(async (req, res) => {
  const user = await loginUserService(req.body.email, req.body.password);
  const tokens = await generateAuthTokensService(user.id);
  const response = { user: user.transform(), tokens };
  res.send(response);
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await refreshAuthTokensService(req.body.refreshToken);
  const response = { ...tokens };
  res.send(response);
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await generateResetPasswordTokenService(req.body.email);
  await sendResetPasswordEmailService(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await resetUserPasswordService(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const me = catchAsync(async (req, res) => {
  const user = await getMeService(req.user);
  res.status(httpStatus.OK).send(user);
});

module.exports = {
  register,
  login,
  refreshTokens,
  forgotPassword,
  resetPassword,
  me,
};
