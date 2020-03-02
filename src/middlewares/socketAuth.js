import jwtAuth from 'socketio-jwt-auth';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import AppError from '../utils/AppError';
import { getUserByIdService } from '../services/user.service';
import { registerDeviceSocket, registerUserSocket } from '../controllers/socketId.controller';

const verifySocketCallback = (socket, resolve, reject) => async payload => {
  if (payload.device) {
    try {
      // eslint-disable-next-line no-param-reassign
      socket.device = await registerDeviceSocket('device', 'deviceId', payload.device, socket.id);
      return resolve(socket);
    } catch (err) {
      return reject(err);
    }
  } else if (payload.sub) {
    try {
      const user = await getUserByIdService(payload.sub);
      // eslint-disable-next-line no-param-reassign
      socket.user = user;
      await registerUserSocket('user', 'email', user.email, socket.id);
      return resolve(socket);
    } catch (err) {
      return reject(err);
    }
  }
  return reject(new AppError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
};

const socketAuth = (socket, next) => {
  if (
    socket &&
    socket.handshake &&
    ((socket.handshake.headers &&
      socket.handshake.headers['x-auth-token'] &&
      socket.handshake.headers['x-auth-token'].length) ||
      (socket.handshake.query && socket.handshake.query.auth_token && socket.handshake.query.auth_token.length))
  ) {
    let token;
    if (
      socket &&
      socket.handshake &&
      socket.handshake.headers &&
      socket.handshake.headers['x-auth-token'] &&
      socket.handshake.headers['x-auth-token'].length
    ) {
      token = socket.handshake.headers['x-auth-token'];
    } else {
      token = socket.handshake.query.auth_token;
    }
    try {
      jwt.verify(token, config.jwt.secret);
      return new Promise((resolve, reject) => {
        jwtAuth.authenticate(
          {
            secret: config.jwt.secret,
            algorithm: 'HS256',
          },
          verifySocketCallback(socket, resolve, reject)
        )(socket, next);
      })
        .then(_socket => next(null, _socket))
        .catch(err => next(err));
    } catch (e) {
      return next(new AppError(httpStatus.BAD_REQUEST, 'invalid auth token'));
    }
  }
  return next(new AppError(httpStatus.BAD_REQUEST, 'missing auth token'));
};

module.exports = socketAuth;
