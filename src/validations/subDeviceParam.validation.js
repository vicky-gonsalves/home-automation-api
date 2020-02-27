import Joi from '@hapi/joi';

const createSubDeviceParamValidation = {
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

const getSubDeviceParamsValidation = {
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

const getSubDeviceParamValidation = {
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

const updateSubDeviceParamValidation = {
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

const deleteSubDeviceParamValidation = {
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
  createSubDeviceParamValidation,
  getSubDeviceParamsValidation,
  getSubDeviceParamValidation,
  updateSubDeviceParamValidation,
  deleteSubDeviceParamValidation,
};
