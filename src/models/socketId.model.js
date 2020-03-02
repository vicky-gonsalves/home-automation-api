import mongoose from 'mongoose';
import { omit, pick } from 'lodash';
import { socketUserIdType, socketUserType } from '../config/socketUser';

const socketIdSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      enum: socketUserType,
    },
    idType: {
      type: String,
      required: true,
      trim: true,
      enum: socketUserIdType,
    },
    bindedTo: {
      type: String,
      required: true,
      trim: true,
    },
    socketId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
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

socketIdSchema.methods.toJSON = function() {
  const socketId = this;
  return omit(socketId.toObject(), []);
};

socketIdSchema.methods.transform = function() {
  const socketId = this;
  return pick(socketId.toJSON(), ['id', 'type', 'idType', 'bindedTo', 'socketId', 'isDisabled', 'createdAt', 'updatedAt']);
};

const SocketId = mongoose.model('SocketId', socketIdSchema);

export default SocketId;
