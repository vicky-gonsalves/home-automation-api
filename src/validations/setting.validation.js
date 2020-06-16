import Joi from '@hapi/joi';
import { idType, settingType } from '../config/setting';
import NotificationService from '../services/notification.service';

const settingValidation = Joi.object().keys({
  type: Joi.string()
    .valid(...settingType)
    .required(),
  idType: Joi.string()
    .valid(...idType)
    .required(),
  parent: Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')),
  bindedTo: Joi.alternatives(Joi.string().pattern(new RegExp('^[A-Za-z_\\d]{10,20}$')), Joi.string().email()).required(),
  paramName: Joi.string()
    .required()
    .pattern(new RegExp('^[A-Za-z_\\d]{1,50}$')),
  paramValue: Joi.alternatives(Joi.string(), Joi.number(), Joi.object(), Joi.array()).required(),
});

const updateSettingValidation = {
  body: settingValidation,
};

const updateMultiSettingValidation = {
  body: Joi.array()
    .items(settingValidation)
    .min(1),
};

const validateGetDeviceSettingsSocket = async (socket, listener) => {
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
    NotificationService.sendMessage([{ socketId: socket.id }], 'ERROR_DEVICE_SETTING_GET', {
      error: validate.error.details[0].message,
    });
  } else {
    await listener(socket.id, socket.device);
  }
};

module.exports = {
  updateSettingValidation,
  updateMultiSettingValidation,
  validateGetDeviceSettingsSocket,
};
