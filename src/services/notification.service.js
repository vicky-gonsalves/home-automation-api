import { BehaviorSubject } from 'rxjs';

class NotificationService {
  static _message = new BehaviorSubject({ recipients: [], event: null, data: null });

  static _serviceMessage = new BehaviorSubject({ command: '' });

  static get message() {
    return NotificationService._message.asObservable();
  }

  static get serviceMessage() {
    return NotificationService._serviceMessage.asObservable();
  }

  static sendMessage(recipients, event, data) {
    NotificationService._message.next({ recipients, event, data });
  }

  static sendCommand(command) {
    NotificationService._serviceMessage.next({ command });
  }
}

export default NotificationService;
