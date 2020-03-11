import Joi from '@hapi/joi';
import { subDeviceType } from '../config/device';

const createSubDeviceValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  }),
  body: Joi.object().keys({
    name: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
    type: Joi.string()
      .valid(...subDeviceType)
      .required(),
    isDisabled: Joi.boolean(),
  }),
};

const getSubDevicesValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  }),
  query: Joi.object().keys({
    subDeviceId: Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    name: Joi.string().pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
    type: Joi.string().valid(...subDeviceType),
    isDisabled: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSubDeviceValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  }),
};

const updateSubDeviceValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
      type: Joi.string().valid(...subDeviceType),
      isDisabled: Joi.boolean(),
    })
    .min(0),
};

const deleteSubDeviceValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  }),
};

module.exports = {
  createSubDeviceValidation,
  getSubDevicesValidation,
  getSubDeviceValidation,
  updateSubDeviceValidation,
  deleteSubDeviceValidation,
};
