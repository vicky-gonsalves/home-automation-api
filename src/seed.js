"use strict";

const {SeedUserFn} = require('./seed-scripts/user.seed');

const seedUser = true;

if (seedUser) {
  SeedUserFn();
}
