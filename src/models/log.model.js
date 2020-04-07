import mongoose from 'mongoose';
import { omit, pick } from 'lodash';
import validator from 'validator';

const logSchema = mongoose.Schema(
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
      trim: true,
      match: /^[A-Za-z_\d]+$/,
      minlength: 10,
      maxlength: 20,
    },
    logName: {
      type: String,
      required: true,
      trim: true,
      match: /^[A-Za-z_\d]+$/,
      minlength: 1,
      maxlength: 20,
    },
    logDescription: {
      type: String,
      required: true,
      trim: true,
    },
    isDevLog: {
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
    triggeredByDevice: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
  }
);

logSchema.methods.toJSON = function() {
  const log = this;
  return omit(log.toObject(), []);
};

logSchema.methods.transform = function() {
  const log = this;
  return pick(log.toJSON(), [
    'id',
    'deviceId',
    'subDeviceId',
    'logName',
    'logDescription',
    'isDevLog',
    'createdBy',
    'triggeredByDevice',
    'createdAt',
  ]);
};

const Log = mongoose.model('Log', logSchema);

export default Log;
