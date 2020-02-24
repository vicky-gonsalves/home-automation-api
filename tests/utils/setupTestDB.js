const mongoose = require('mongoose');
const { Mockgoose } = require('mockgoose');
const config = require('../../src/config/config');

const setupTestDBWithActualTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
  });

  beforeEach(async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map(async collection => collection.deleteMany()));
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
};

const setupTestDB = () => {
  const mockgoose = new Mockgoose(mongoose);
  beforeAll(async done => {
    await mockgoose.prepareStorage();
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    done();
  });

  beforeEach(async done => {
    await mockgoose.helper.reset();
    done();
  });

  afterAll(async done => {
    await mongoose.disconnect();
    await mockgoose.shutdown();
    done();
  });
};

module.exports = { setupTestDBWithActualTestDB, setupTestDB };