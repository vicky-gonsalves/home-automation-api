import Joi from '@hapi/joi';
import { objectIdValidation } from './custom.validation';

const createSharedDeviceAccessValidation = {
  body: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    email: Joi.string()
      .email()
      .required(),
    isDisabled: Joi.boolean(),
  }),
};

const deleteSharedDeviceAccessValidation = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectIdValidation),
  }),
};

module.exports = {
  createSharedDeviceAccessValidation,
  deleteSharedDeviceAccessValidation,
};
