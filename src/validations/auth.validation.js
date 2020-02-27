import Joi from '@hapi/joi';
import { passwordValidation } from './custom.validation';

const registerValidation = {
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .required()
      .custom(passwordValidation),
    name: Joi.string().required(),
  }),
};

const loginValidation = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const refreshTokensValidation = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPasswordValidation = {
  body: Joi.object().keys({
    email: Joi.string()
      .email()
      .required(),
  }),
};

const resetPasswordValidation = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string()
      .required()
      .custom(passwordValidation),
  }),
};

module.exports = {
  registerValidation,
  loginValidation,
  refreshTokensValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
