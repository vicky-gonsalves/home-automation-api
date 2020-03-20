import Joi from '@hapi/joi';
import NotificationService from '../services/notification.service';

const createSubDeviceParamValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  }),
  body: Joi.object().keys({
    paramName: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
    paramValue: Joi.alternatives(Joi.string(), Joi.number(), Joi.object(), Joi.array()).required(),
    isDisabled: Joi.boolean(),
  }),
};

const getSubDeviceParamsValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  }),
  query: Joi.object().keys({
    paramName: Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
    paramValue: Joi.alternatives(Joi.string(), Joi.number(), Joi.object(), Joi.array()),
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
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    paramName: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
  }),
};

const updateSubDeviceParamValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    paramName: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
  }),
  body: Joi.object()
    .keys({
      paramName: Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
      paramValue: Joi.alternatives(Joi.string(), Joi.number(), Joi.object(), Joi.array()),
      isDisabled: Joi.boolean(),
    })
    .min(0),
};

const updateSubDeviceParamValueValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    paramName: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
  }),
  body: Joi.object()
    .keys({
      paramValue: Joi.any().required(),
    })
    .min(1),
};

const deleteSubDeviceParamValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    paramName: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
  }),
};

const validateGetSubDeviceParamsSocket = async (socket, listener) => {
  const schema = Joi.object({
    id: Joi.string().required(),
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  });

  const validate = schema.validate({
    id: socket.id,
    deviceId: socket && socket.device && socket.device.deviceId ? socket.device.deviceId : null,
  });

  if (validate.error) {
    NotificationService.sendMessage([{ socketId: socket.id }], 'ERROR_SUB_DEVICE_PARAM_GET', {
      error: validate.error.details[0].message,
    });
  } else {
    await listener(socket.id, socket.device);
  }
};

const validatePutSubDeviceParamsSocket = async (socket, data, listener) => {
  const schema = Joi.object({
    id: Joi.string().required(),
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    subDeviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
    paramName: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
    paramValue: Joi.alternatives(Joi.string(), Joi.number(), Joi.object(), Joi.array()).required(),
  });

  const validate = schema.validate({
    id: socket.id,
    deviceId: socket && socket.device && socket.device.deviceId ? socket.device.deviceId : null,
    subDeviceId: data && data.subDeviceId ? data.subDeviceId : null,
    paramName: data && data.paramName ? data.paramName : null,
    paramValue: data && data.updatedBody && data.updatedBody.paramValue ? data.updatedBody.paramValue : null,
  });

  if (validate.error) {
    NotificationService.sendMessage([{ socketId: socket.id }], 'ERROR_SUB_DEVICE_PARAM_UPDATE', {
      error: validate.error.details[0].message,
    });
  } else {
    await listener(socket.device, data, listener);
  }
};

const updateMultiStatusValidation = {
  params: Joi.object().keys({
    deviceId: Joi.string()
      .required()
      .pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  }),
  body: Joi.object().keys({
    paramValue: Joi.string()
      .valid('on', 'off')
      .required(),
  }),
};

module.exports = {
  createSubDeviceParamValidation,
  getSubDeviceParamsValidation,
  getSubDeviceParamValidation,
  updateSubDeviceParamValidation,
  deleteSubDeviceParamValidation,
  updateSubDeviceParamValueValidation,
  validateGetSubDeviceParamsSocket,
  validatePutSubDeviceParamsSocket,
  updateMultiStatusValidation,
};
