import mongoose from 'mongoose';
import Seed from './seed';
import config from './config/config';
import logger from './config/logger';
import connectSocketAndServer from './socket';
import SocketId from './models/socketId.model';

mongoose.connect(config.mongoose.url, config.mongoose.options).then(async () => {
  logger.info('Connected to MongoDB');
  if (config.env !== 'test' && config.seedDB === 'true') {
    await Seed();
  }
  await SocketId.find({}).deleteMany();
  connectSocketAndServer();
});
mongoose.set('debug', config.env === 'development');
