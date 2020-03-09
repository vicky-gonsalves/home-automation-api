import {
  getAllSubDeviceParamsOfDevice,
  updateSubDeviceParamsToSocketUsers,
} from '../../controllers/subDeviceParam.controller';
import {
  validateGetSubDeviceParamsSocket,
  validatePutSubDeviceParamsSocket,
} from '../../validations/subDeviceParam.validation';

const getEvents = [{ name: 'subDeviceParam/getAll', listener: getAllSubDeviceParamsOfDevice }];
const putEvents = [{ name: 'subDeviceParam/update', listener: updateSubDeviceParamsToSocketUsers }];

const reRouteMessages = socket => {
  getEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, () => validateGetSubDeviceParamsSocket(socket, listener));
  });
  putEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, data => validatePutSubDeviceParamsSocket(socket, data, listener));
  });
};

export default reRouteMessages;
