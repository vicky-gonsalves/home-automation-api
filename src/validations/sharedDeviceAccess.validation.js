import Joi from '@hapi/joi';
import { objectIdValidation } from './custom.validation';

const createSharedDeviceAccessValidation = {
  body: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    email: Joi.string()
      .email()
      .required(),
    isDisabled: Joi.boolean(),
  }),
};

const getSharedDeviceAccessesValidation = {
  query: Joi.object().keys({
    deviceId: Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    email: Joi.string().email(),
    sharedBy: Joi.string().email(),
    isDisabled: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSharedDeviceAccessValidation = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectIdValidation),
  }),
};

const updateSharedDeviceAccessValidation = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectIdValidation),
  }),
  body: Joi.object()
    .keys({
      deviceId: Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
      email: Joi.string().email(),
      isDisabled: Joi.boolean(),
    })
    .min(0),
};

const deleteSharedDeviceAccessValidation = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectIdValidation),
  }),
};

module.exports = {
  createSharedDeviceAccessValidation,
  getSharedDeviceAccessesValidation,
  getSharedDeviceAccessValidation,
  updateSharedDeviceAccessValidation,
  deleteSharedDeviceAccessValidation,
};
