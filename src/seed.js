const { SeedUserFn } = require('./seed-scripts/user.seed');

const seedUser = true;

const Seed = () => {
  if (seedUser) {
    SeedUserFn();
  }
};

module.exports = { Seed };
