const mongoose = require('mongoose');
const config = require('../../src/config/config');
const Mockgoose = require('mockgoose').Mockgoose;

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
  var mockgoose = new Mockgoose(mongoose);
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

module.exports = setupTestDB;
