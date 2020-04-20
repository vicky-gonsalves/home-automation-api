const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { omit, pick } = require('lodash');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
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

userSchema.methods.toJSON = function() {
  const user = this;
  return omit(user.toObject(), ['password']);
};

userSchema.methods.transform = function(full = false) {
  const user = this;
  const basic = ['id', 'email', 'name', 'role'];
  const all = [...basic, 'isDisabled', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'];
  return pick(user.toJSON(), full ? all : basic);
};

userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
