import moment from 'moment';
import config from '../config/config';
import { generateDeviceTokenService } from './deviceToken.service';

const generateDeviceAuthTokensService = deviceId => {
  const accessTokenExpires = moment().add(config.jwt.deviceAccessExpirationDays, 'days');
  const accessToken = generateDeviceTokenService(deviceId, accessTokenExpires);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
  };
};

module.exports = {
  generateDeviceAuthTokensService,
};
