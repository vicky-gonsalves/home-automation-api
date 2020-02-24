const validator = require('validator');

const mongoose = require('mongoose');
const { omit, pick } = require('lodash');

const logSchema = mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      match: /^[A-Za-z_\d]+$/,
      minlength: 16,
      maxlength: 20,
    },
    subDeviceId: {
      type: String,
      required: true,
      trim: true,
      match: /^[A-Za-z_\d]+$/,
      minlength: 16,
      maxlength: 20,
    },
    logName: {
      type: String,
      required: true,
      trim: true,
      match: /^[A-Za-z_\d]+$/,
      minlength: 1,
      maxlength: 50,
    },
    logDescription: {
      type: String,
      required: true,
      trim: true,
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

logSchema.methods.toJSON = function() {
  const log = this;
  return omit(log.toObject(), []);
};

logSchema.methods.transform = function() {
  const log = this;
  return pick(log.toJSON(), ['id', 'deviceId', 'subDeviceId', 'logName', 'logDescription', 'createdBy', 'updatedBy']);
};

logSchema.pre('save', function(next) {
  if (this.isModified('updatedAt') && this._updatedBy) {
    this.updatedBy = this._updatedBy;
  }
  return next();
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
