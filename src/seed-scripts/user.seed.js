const { User } = require('../../src/models');
const logger = require('../config/logger');
const config = require('../config/config');

const SeedUserFn = async () => {
  await User.find({}).deleteMany();
  await User.create(config.defaultAdmin);
  logger.info('User Seed Done');
};

module.exports = { SeedUserFn };
