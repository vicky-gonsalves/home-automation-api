import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';
import config from '../../src/config/config';

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
    mockgoose.prepareStorage().then(function() {
      mongoose.connect(config.mongoose.url, config.mongoose.options, function(err) {
        done(err);
      });
      done();
    });
  });

  beforeEach(async done => {
    await mockgoose.helper.reset();
    done();
  });

  afterAll(async done => {
    await mockgoose.helper.reset();
    await mongoose.disconnect();
    await mockgoose.shutdown();
    done();
  });
};

const setupTestDBForSocket = () => {
  const mockgoose = new Mockgoose(mongoose);
  beforeAll(done => {
    mockgoose.prepareStorage().then(function() {
      mongoose.connect(config.mongoose.url, config.mongoose.options, function(err) {
        done(err);
      });
      done();
    });
  });

  beforeEach(async done => {
    await mockgoose.helper.reset();
    done();
  });

  afterAll(async done => {
    await mockgoose.helper.reset();
    await mongoose.disconnect();
    done();
  });
};

module.exports = { setupTestDBWithActualTestDB, setupTestDB, setupTestDBForSocket };
