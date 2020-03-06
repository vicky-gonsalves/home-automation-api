'use strict';

import User from '../models/user.model';
import logger from '../config/logger';
import config from '../config/config';

const users = [
  config.defaultAdmin,
  {
    name: 'John Doe',
    email: 'johndoe@email.com',
    password: 'Somepass@1',
    role: 'user',
  },
  {
    name: 'John Doe2',
    email: 'johndoe2@email.com',
    password: 'Somepass@1',
    role: 'user',
  },
];

const SeedUserFn = async () => {
  await User.find({}).deleteMany();
  await User.create(users);
  logger.info('User Seed Done');
};

module.exports = SeedUserFn;
