const {deviceStatus, deviceType} = require('../config/device');

const Joi = require('@hapi/joi');

const createDevice = {
  body: Joi.object().keys({
    deviceId: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    name: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
    type: Joi.string().valid(...deviceType).required(),
    registeredAt: Joi.date().iso().required(),
    deviceOwner: Joi.string().email().required(),
    isDisabled: Joi.boolean()
  }),
};

const getDevices = {
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

const getDevice = {
  params: Joi.object().keys({
    deviceId: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
  }),
};

const getDeviceByDeviceOwner = {
  params: Joi.object().keys({
    deviceOwner: Joi.string().email().required(),
  }),
};

const updateDevice = {
  params: Joi.object().keys({
    deviceId: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
  }),
  body: Joi.object()
    .keys({
      deviceId: Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
      name: Joi.string().pattern(new RegExp('^[A-Za-z_\\s\\d]{1,20}$')),
      type: Joi.string().valid(...deviceType),
      deviceOwner: Joi.string().email(),
      isDisabled: Joi.boolean()
    })
    .min(0),
};

const deleteDevice = {
  params: Joi.object().keys({
    deviceId: Joi.string().required().pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
  }),
};

module.exports = {
  createDevice,
  getDevices,
  getDevice,
  getDeviceByDeviceOwner,
  updateDevice,
  deleteDevice,
};
