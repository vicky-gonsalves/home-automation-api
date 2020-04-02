import SocketIO from 'socket.io';
import reRouteMessages from './routes/socketRoutes';
import { handleDisconnection } from './controllers/socketId.controller';
import socketAuth from './middlewares/socketAuth';
import NotificationService from './services/notification.service';
import { updateUpdatedAt } from './controllers/subDeviceParam.controller';

class SocketServer {
  constructor(_httpServer) {
    this.httpServer = _httpServer;
    this.startSocketServer();
  }

  startSocketServer() {
    // eslint-disable-next-line import/prefer-default-export
    const sockIO = new SocketIO(this.httpServer, {
      serveClient: true,
    });

    const emitMessage = messagePayload => {
      if (
        messagePayload &&
        messagePayload.recipients &&
        messagePayload.recipients.length &&
        messagePayload.event &&
        messagePayload.data
      ) {
        messagePayload.recipients.forEach(recipient =>
          sockIO.to(recipient.socketId).emit(messagePayload.event, messagePayload.data)
        );
      }
    };

    const execCommand = async notification => {
      if (notification && notification.command === 'shutdownSocketServer') {
        await sockIO.close();
        await this.httpServer.close();
      }
    };

    NotificationService.message.subscribe(emitMessage);
    NotificationService.serviceMessage.subscribe(execCommand);

    // eslint-disable-next-line no-unused-vars
    const handleSocketConnection = async (socket, next) => {
      if (socket.user) {
        NotificationService.sendMessage([{ socketId: socket.id }], 'CONNECTED', socket.user.transform());
      } else {
        NotificationService.sendMessage([{ socketId: socket.id }], 'CONNECTED', socket.device.transform());
      }
      reRouteMessages(socket);
      if (socket.device) {
        await updateUpdatedAt(socket.device);
      }
      socket.on('disconnect', () => handleDisconnection(socket.id));
    };

    sockIO.use(socketAuth);
    sockIO.on('connection', handleSocketConnection);
  }
}

export default SocketServer;
