import { omit, pick } from 'lodash';
import mongoose from 'mongoose';
import validator from 'validator';

const userDeviceAccessSchema = mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      match: /^[A-Za-z_\d]+$/,
      minlength: 16,
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

userDeviceAccessSchema.methods.toJSON = function() {
  const userDeviceAccess = this;
  return omit(userDeviceAccess.toObject(), []);
};

userDeviceAccessSchema.methods.transform = function() {
  const userDeviceAccess = this;
  return pick(userDeviceAccess.toJSON(), ['id', 'deviceId', 'email', 'sharedBy', 'isDisabled', 'createdAt', 'updatedAt']);
};

const UserDeviceAccess = mongoose.model('UserDeviceAccess', userDeviceAccessSchema);

export default UserDeviceAccess;
