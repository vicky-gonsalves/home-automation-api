import mongoose from 'mongoose';
import config from '../../src/config/config';
import { MongoMemoryServer } from 'mongodb-memory-server';

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
  const mongod = new MongoMemoryServer();
  beforeAll(async done => {
    const uri = await mongod.getUri();
    await mongoose.connect(uri, config.mongoose.options);
    done();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async done => {
    await mongoose.connection.dropDatabase();
    mongoose.connection.close();
    await mongod.stop();
    done();
  });
};

module.exports = { setupTestDBWithActualTestDB, setupTestDB };
