import Joi from '@hapi/joi';
import NotificationService from '../services/notification.service';

const validateGetSystemParamsSocket = async (socket, listener) => {
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
    NotificationService.sendMessage([{ socketId: socket.id }], 'ERROR_SYSTEM_PARAM_GET', {
      error: validate.error.details[0].message,
    });
  } else {
    await listener(socket.id, socket.device);
  }
};

module.exports = {
  validateGetSystemParamsSocket,
};
