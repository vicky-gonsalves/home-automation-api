import jwt from 'jsonwebtoken';
import moment from 'moment';
import config from '../config/config';

const generateDeviceTokenService = (deviceId, expires, secret = config.jwt.secret) => {
  const payload = {
    device: deviceId,
    iat: moment().unix(),
    exp: expires.unix(),
  };
  return jwt.sign(payload, secret);
};

module.exports = {
  generateDeviceTokenService,
};
