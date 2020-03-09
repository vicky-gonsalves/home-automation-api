import Joi from '@hapi/joi';
import { deviceType } from '../config/device';

const createDeviceValidation = {
  body: Joi.object().keys({
    name: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
    type: Joi.string()
      .valid(...deviceType)
      .required(),
    deviceOwner: Joi.string()
      .email()
      .required(),
    isDisabled: Joi.boolean(),
  }),
};

const getDevicesValidation = {
  query: Joi.object().keys({
    deviceId: Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    name: Joi.string().pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
    type: Joi.string().valid(...deviceType),
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
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
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
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
      type: Joi.string().valid(...deviceType),
      deviceOwner: Joi.string().email(),
      isDisabled: Joi.boolean(),
    })
    .min(0),
};

const deleteDeviceValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
  }),
};

const registerDeviceValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
  }),
};

const authorizeDeviceValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
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
