import {
  getAllSubDeviceParamsOfDevice,
  updateSubDeviceParamsToSocketUsers,
} from '../../controllers/subDeviceParam.controller';

const getEvents = [{ name: 'subDeviceParam/getAll', listener: getAllSubDeviceParamsOfDevice }];
const putEvents = [{ name: 'subDeviceParam/update', listener: updateSubDeviceParamsToSocketUsers }];

const reRouteMessages = socket => {
  getEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, () => listener(socket.id, socket.device));
  });
  putEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, data => listener(socket.device, data));
  });
};

export default reRouteMessages;
