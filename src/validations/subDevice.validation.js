const {subDeviceType} = require('../config/device');

const Joi = require('@hapi/joi');

const createSubDevice = {
  params: Joi.object().keys({
    deviceId: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
  }),
  body: Joi.object().keys({
    subDeviceId: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    name: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
    type: Joi.string().valid(...subDeviceType).required(),
    isDisabled: Joi.boolean()
  }),
};

const getSubDevices = {
  params: Joi.object().keys({
    deviceId: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
  }),
  query: Joi.object().keys({
    subDeviceId: Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    name: Joi.string().pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
    type: Joi.string().valid(...subDeviceType),
    isDisabled: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSubDevice = {
  params: Joi.object().keys({
    deviceId: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    subDeviceId: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
  }),
};

const updateSubDevice = {
  params: Joi.object().keys({
    deviceId: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    subDeviceId: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
  }),
  body: Joi.object()
    .keys({
      subDeviceId: Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
      name: Joi.string().pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
      type: Joi.string().valid(...subDeviceType),
      subDeviceOwner: Joi.string().email(),
      isDisabled: Joi.boolean()
    })
    .min(0),
};

const deleteSubDevice = {
  params: Joi.object().keys({
    deviceId: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    subDeviceId: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
  }),
};

module.exports = {
  createSubDevice,
  getSubDevices,
  getSubDevice,
  updateSubDevice,
  deleteSubDevice
};
