import SocketIO from 'socket.io';
import http from 'http';
import app from './app';
import config from './config/config';
import logger from './config/logger';
import socketAuth from './middlewares/socketAuth';
import { handleDisconnection } from './controllers/socketId.controller';

let sockIO;
const connectSocketAndServer = () => {
  const httpServer = http.createServer(app);
  sockIO = SocketIO(httpServer, {
    serveClient: true,
  });

  sockIO.use(socketAuth);
  sockIO.on('connection', function(socket) {
    socket.on('disconnect', () => handleDisconnection(socket.id));
  });

  const server = httpServer.listen(config.port, function() {
    logger.info(`Listening to port ${config.port}`);
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        logger.info('Server closed');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  const unexpectedErrorHandler = error => {
    logger.error(error);
    exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
      server.close();
    }
  });
};

module.exports = connectSocketAndServer;
