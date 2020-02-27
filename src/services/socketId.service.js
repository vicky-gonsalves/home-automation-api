import SocketId from '../models/socketId.model';

const updateSocketDeviceIdService = async (oldDeviceId, newDeviceId) => {
  const socketIds = await SocketId.find({ type: 'device', idType: 'deviceId', bindedTo: oldDeviceId });
  return Promise.all(
    socketIds.map(async socketId => {
      Object.assign(socketId, { bindedTo: newDeviceId });
      await socketId.save();
      return socketId;
    })
  );
};

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

module.exports = {
  updateSocketEmailService,
  updateSocketDeviceIdService,
  deleteSocketIdByDeviceIdService,
  deleteSocketIdByUserEmailService,
};