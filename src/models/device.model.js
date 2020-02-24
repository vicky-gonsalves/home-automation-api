const {deviceStatus, deviceType} = require('../config/device');
const validator = require('validator');

const mongoose = require('mongoose');
const {omit, pick} = require('lodash');

const deviceSchema = mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: /^[A-Za-z_\d]+$/,
      minlength: 16,
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
      enum: deviceType,
      required: true,
      trim: true
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    deviceOwner: {
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
    registeredAt: {
      type: Date,
      required: true
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
    }
  },
  {
    timestamps: true,
    toObject: {getters: true},
    toJSON: {getters: true},
  }
);

deviceSchema.methods.toJSON = function() {
  const device = this;
  return omit(device.toObject(), []);
};

deviceSchema.methods.transform = function() {
  const device = this;
  return pick(device.toJSON(), ['id', 'deviceId', 'name', 'type', 'registeredAt', 'isDisabled', 'deviceOwner', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt']);
};

deviceSchema.pre('save', function(next) {
  if (this.isModified('updatedAt') && this._updatedBy) {
    this.updatedBy = this._updatedBy;
  }
  return next();
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
