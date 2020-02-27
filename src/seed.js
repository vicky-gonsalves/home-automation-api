'use strict';

import SeedUserFn from './seed-scripts/user.seed';

const seedUser = true;

const Seed = async () => {
  if (seedUser) {
    await SeedUserFn();
  }
};

module.exports = Seed;
