import mongoose from 'mongoose';
import http from 'http';
import config from './config/config';
import logger from './config/logger';
import SocketId from './models/socketId.model';
import Seed from './seed';
import Server from './server';
import SocketServer from './socketServer';
import app from './app';

const httpServer = http.createServer(app);

// eslint-disable-next-line no-unused-vars
let socketServer;

mongoose.connect(config.mongoose.url, config.mongoose.options).then(async () => {
  logger.info('Connected to MongoDB');
  if (config.env !== 'development') {
    await SocketId.find({}).deleteMany();
  }
  if (config.env !== 'test' && config.seedDB === 'true') {
    await Seed();
  }
  const _server = new Server(httpServer);
  socketServer = new SocketServer(_server.httpServer);
});

mongoose.set('debug', config.env === 'development');
