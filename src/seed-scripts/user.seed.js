'use strict';

import User from '../models/user.model';
import logger from '../config/logger';
import config from '../config/config';

const SeedUserFn = async () => {
  await User.find({}).deleteMany();
  await User.create(config.defaultAdmin);
  logger.info('User Seed Done');
};

module.exports = SeedUserFn;
