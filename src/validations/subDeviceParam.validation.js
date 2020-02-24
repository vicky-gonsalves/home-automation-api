const Joi = require('@hapi/joi');

const createSubDeviceParam = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
  }),
  body: Joi.object().keys({
    paramName: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
    paramValue: Joi.any().required(),
    isDisabled: Joi.boolean(),
  }),
};

const getSubDeviceParams = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
  }),
  query: Joi.object().keys({
    paramName: Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
    paramValue: Joi.any(),
    isDisabled: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSubDeviceParam = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    paramName: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
  }),
};

const updateSubDeviceParam = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    paramName: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
  }),
  body: Joi.object()
    .keys({
      paramName: Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
      paramValue: Joi.any(),
      isDisabled: Joi.boolean(),
    })
    .min(0),
};

const deleteSubDeviceParam = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{16,20}$')),
    paramName: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
  }),
};

module.exports = {
  createSubDeviceParam,
  getSubDeviceParams,
  getSubDeviceParam,
  updateSubDeviceParam,
  deleteSubDeviceParam,
};
