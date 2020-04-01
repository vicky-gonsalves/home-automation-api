import SocketId from '../models/socketId.model';

const updateSocketEmailService = async (oldEmail, newEmail) => {
  const socketIds = await SocketId.find({ type: 'user', idType: 'email', bindedTo: oldEmail });
  return Promise.all(
    socketIds.map(async socketId => {
      Object.assign(socketId, { bindedTo: newEmail });
      await socketId.save();
      return socketId;
    })
  );
};

const deleteSocketIdByDeviceIdService = async deviceId => {
  const socketIds = await SocketId.find({ type: 'device', idType: 'deviceId', bindedTo: deviceId });
  return Promise.all(socketIds.map(socketId => socketId.remove()));
};

const deleteSocketIdByUserEmailService = async email => {
  const socketIds = await SocketId.find({ type: 'user', idType: 'email', bindedTo: email });
  return Promise.all(socketIds.map(socketId => socketId.remove()));
};

const deleteSocketIdBySocketIdService = async socketId => {
  const socketIds = await SocketId.find({ socketId });
  return Promise.all(socketIds.map(_socketId => _socketId.remove()));
};

const registerSocketService = async (type, idType, bindedTo, socketId) => {
  return SocketId.create({ type, idType, bindedTo, socketId });
};

const getSocketIdsByEmailsService = emails => {
  return SocketId.find({ type: 'user', idType: 'email', bindedTo: { $in: emails } }).select('socketId');
};

const getSocketIdsByDeviceIdService = deviceId => {
  return SocketId.find({ type: 'device', idType: 'deviceId', bindedTo: deviceId }).select('socketId');
};

const getOnlineDevicesService = deviceIds => {
  return SocketId.find({ type: 'device', idType: 'deviceId', bindedTo: { $in: deviceIds } }).select('bindedTo');
};

const getOnlineDeviceBySocketIdService = socketId => {
  return SocketId.findOne({ type: 'device', idType: 'deviceId', socketId }).select('bindedTo');
};

module.exports = {
  updateSocketEmailService,
  deleteSocketIdByDeviceIdService,
  deleteSocketIdByUserEmailService,
  registerSocketService,
  deleteSocketIdBySocketIdService,
  getSocketIdsByEmailsService,
  getSocketIdsByDeviceIdService,
  getOnlineDevicesService,
  getOnlineDeviceBySocketIdService,
};
