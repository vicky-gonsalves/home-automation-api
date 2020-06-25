import NotificationService from '../services/notification.service';
import moment from 'moment';

const getSystemParams = async socketId => {
  const systemParams = {
    sysTime: moment().valueOf(),
  };
  NotificationService.sendMessage([{ socketId }], 'GET_ALL_SYSTEM_PARAMS', systemParams);
};

module.exports = {
  getSystemParams,
};
