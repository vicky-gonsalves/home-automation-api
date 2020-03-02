import Joi from '@hapi/joi';
import { objectIdValidation, passwordValidation } from './custom.validation';

const createUserValidation = {
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .required()
      .custom(passwordValidation),
    name: Joi.string().required(),
    role: Joi.string()
      .required()
      .valid('user', 'admin'),
  }),
};

const getUsersValidation = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUserValidation = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectIdValidation),
  }),
};

const updateUserValidation = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectIdValidation),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(passwordValidation),
      name: Joi.string(),
    })
    .min(1),
};

const deleteUserValidation = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectIdValidation),
  }),
};

module.exports = {
  createUserValidation,
  getUsersValidation,
  getUserValidation,
  updateUserValidation,
  deleteUserValidation,
};
