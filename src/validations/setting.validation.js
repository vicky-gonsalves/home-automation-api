import Joi from '@hapi/joi';
import { idType, settingType } from '../config/setting';

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

module.exports = {
  updateSettingValidation,
  updateMultiSettingValidation,
};
