import config from './config/config';
import logger from './config/logger';

class Server {
  constructor(_httpServer) {
    this.httpServer = _httpServer;
    this.createServer();
  }

  createServer() {
    this.server = this.httpServer.listen(config.port, function() {
      logger.info(`Listening to port ${config.port}`);
    });

    const exitHandler = () => {
      if (this.server) {
        this.server.close(() => {
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
      if (this.server) {
        this.server.close();
      }
    });
  }
}

export default Server;
