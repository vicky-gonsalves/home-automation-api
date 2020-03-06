import moment from 'moment';
import config from '../../src/config/config';
import { generateTokenService } from '../../src/services/token.service';
import { admin, userOne, userTwo } from './user.fixture';
import { deviceOne, deviceTwo } from './device.fixture';
import { generateDeviceTokenService } from '../../src/services/deviceToken.service';

const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
const deviceAccessTokenExpires = moment().add(config.jwt.deviceAccessExpirationDays, 'days');
const userOneAccessToken = generateTokenService(userOne._id, accessTokenExpires);
const userTwoAccessToken = generateTokenService(userTwo._id, accessTokenExpires);
const adminAccessToken = generateTokenService(admin._id, accessTokenExpires);
const deviceAccessToken = generateDeviceTokenService(deviceOne.deviceId, deviceAccessTokenExpires);
const deviceTwoAccessToken = generateDeviceTokenService(deviceTwo.deviceId, deviceAccessTokenExpires);
const noDeviceAccessToken = generateDeviceTokenService(null, deviceAccessTokenExpires);
const noUserAccessToken = generateTokenService(null, accessTokenExpires);

module.exports = {
  accessTokenExpires,
  userOneAccessToken,
  userTwoAccessToken,
  adminAccessToken,
  deviceAccessToken,
  deviceTwoAccessToken,
  noDeviceAccessToken,
  noUserAccessToken,
};
