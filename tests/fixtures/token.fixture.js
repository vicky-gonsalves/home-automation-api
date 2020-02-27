import moment from 'moment';
import config from '../../src/config/config';
import { generateTokenService } from '../../src/services/token.service';
import { userOne, admin } from './user.fixture';

const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
const userOneAccessToken = generateTokenService(userOne._id, accessTokenExpires);
const adminAccessToken = generateTokenService(admin._id, accessTokenExpires);

module.exports = {
  userOneAccessToken,
  adminAccessToken,
};
