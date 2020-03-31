import validator from 'validator';
import mongoose from 'mongoose';
import { omit, pick } from 'lodash';

const deviceParamsSchema = mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      match: /^[A-Za-z_\d]+$/,
      minlength: 10,
      maxlength: 20,
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

deviceParamsSchema.methods.toJSON = function() {
  const deviceParam = this;
  return omit(deviceParam.toObject(), []);
};

deviceParamsSchema.methods.transform = function() {
  const deviceParam = this;
  return pick(deviceParam.toJSON(), [
    'id',
    'deviceId',
    'paramName',
    'paramValue',
    'isDisabled',
    'createdBy',
    'updatedBy',
    'createdAt',
    'updatedAt',
  ]);
};

deviceParamsSchema.pre('save', function(next) {
  if (this.isModified('updatedAt') && this._updatedBy) {
    this.updatedBy = this._updatedBy;
  }
  return next();
});

deviceParamsSchema.index({ deviceId: 1, paramName: 1 }, { unique: true });

const DeviceParam = mongoose.model('DeviceParam', deviceParamsSchema);

export default DeviceParam;
