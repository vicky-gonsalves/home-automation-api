import validator from 'validator';
import mongoose from 'mongoose';
import { omit, pick } from 'lodash';
import { subDeviceType } from '../config/device';

const subDeviceSchema = mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      match: /^[A-Za-z_\d]+$/,
      minlength: 10,
      maxlength: 20,
    },
    subDeviceId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      match: /^[A-Za-z_\d]+$/,
      minlength: 10,
      maxlength: 20,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      match: /^[A-Za-z\s\d]+$/,
      minlength: 1,
      maxlength: 20,
    },
    type: {
      type: String,
      enum: subDeviceType,
      required: true,
      trim: true,
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

subDeviceSchema.methods.toJSON = function() {
  const subDevice = this;
  return omit(subDevice.toObject(), []);
};

subDeviceSchema.methods.transform = function() {
  const subDevice = this;
  return pick(subDevice.toJSON(), [
    'id',
    'deviceId',
    'subDeviceId',
    'name',
    'type',
    'isDisabled',
    'createdBy',
    'updatedBy',
    'createdAt',
    'updatedAt',
  ]);
};

subDeviceSchema.pre('save', function(next) {
  if (this.isModified('updatedAt') && this._updatedBy) {
    this.updatedBy = this._updatedBy;
  }
  return next();
});

const SubDevice = mongoose.model('SubDevice', subDeviceSchema);

export default SubDevice;
