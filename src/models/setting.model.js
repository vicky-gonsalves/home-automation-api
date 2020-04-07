import mongoose from 'mongoose';
import { omit, pick } from 'lodash';
import { idType, settingType } from '../config/setting';
import validator from 'validator';

const settingSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      enum: settingType,
    },
    idType: {
      type: String,
      required: true,
      trim: true,
      enum: idType,
    },
    parent: {
      type: String,
      trim: true,
      match: /^[A-Za-z_\d]+$/,
      minlength: 10,
      maxlength: 20,
    },
    bindedTo: {
      type: String,
      required: true,
      trim: true,
    },
    paramName: {
      type: String,
      required: true,
      trim: true,
      match: /^[A-Za-z_\d]+$/,
      minlength: 1,
      maxlength: 50,
    },
    paramValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate(value) {
        if (value === '') {
          throw new Error('Invalid paramValue');
        }
      },
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    updatedBy: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
  },
  {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
  }
);

settingSchema.methods.toJSON = function() {
  const setting = this;
  return omit(setting.toObject(), []);
};

settingSchema.methods.transform = function() {
  const setting = this;
  return pick(setting.toJSON(), [
    'id',
    'type',
    'idType',
    'parent',
    'bindedTo',
    'paramName',
    'paramValue',
    'isDisabled',
    'createdBy',
    'updatedBy',
    'createdAt',
    'updatedAt',
  ]);
};

settingSchema.pre('save', function(next) {
  if (this.isModified('updatedAt') && this._updatedBy) {
    this.updatedBy = this._updatedBy;
  }
  return next();
});

settingSchema.index({ type: 1, idType: 1, bindedTo: 1, paramName: 1 }, { unique: true });

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
