import Joi from '@hapi/joi';
import { deviceType, deviceVariant } from '../config/device';

const createDeviceValidation = {
  body: Joi.object().keys({
    name: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
    type: Joi.string()
      .valid(...deviceType)
      .required(),
    variant: Joi.string()
      .valid(...deviceVariant)
      .required(),
    deviceOwner: Joi.string()
      .email()
      .required(),
    isDisabled: Joi.boolean(),
  }),
};

const getDevicesValidation = {
  query: Joi.object().keys({
    deviceId: Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    name: Joi.string().pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
    type: Joi.string().valid(...deviceType),
    variant: Joi.string().valid(...deviceVariant),
    registeredAt: Joi.date().iso(),
    deviceOwner: Joi.string().email(),
    isDisabled: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getDeviceValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  }),
};

const getDeviceByDeviceOwnerValidation = {
  params: Joi.object().keys({
    deviceOwner: Joi.string()
      .email()
      .required(),
  }),
};

const updateDeviceValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
      type: Joi.string().valid(...deviceType),
      variant: Joi.string().valid(...deviceVariant),
      deviceOwner: Joi.string().email(),
      isDisabled: Joi.boolean(),
    })
    .min(0),
};

const deleteDeviceValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  }),
};

const registerDeviceValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  }),
};

const authorizeDeviceValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  }),
};

module.exports = {
  createDeviceValidation,
  getDevicesValidation,
  getDeviceValidation,
  getDeviceByDeviceOwnerValidation,
  updateDeviceValidation,
  deleteDeviceValidation,
  registerDeviceValidation,
  authorizeDeviceValidation,
};
