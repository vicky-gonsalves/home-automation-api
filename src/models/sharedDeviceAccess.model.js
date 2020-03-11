import { omit, pick } from 'lodash';
import mongoose from 'mongoose';
import validator from 'validator';

const sharedDeviceAccessSchema = mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      match: /^[A-Za-z_\d]+$/,
      minlength: 10,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    sharedBy: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    isDisabled: {
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

sharedDeviceAccessSchema.methods.toJSON = function() {
  const sharedDeviceAccess = this;
  return omit(sharedDeviceAccess.toObject(), []);
};

sharedDeviceAccessSchema.methods.transform = function() {
  const sharedDeviceAccess = this;
  return pick(sharedDeviceAccess.toJSON(), ['id', 'deviceId', 'email', 'sharedBy', 'isDisabled', 'createdAt', 'updatedAt']);
};

sharedDeviceAccessSchema.index({ deviceId: 1, email: 1 }, { unique: true });

const SharedDeviceAccess = mongoose.model('SharedDeviceAccess', sharedDeviceAccessSchema);

export default SharedDeviceAccess;
