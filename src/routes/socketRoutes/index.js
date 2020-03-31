import {
  getAllSubDeviceParamsOfDevice,
  updateSubDeviceParamsToSocketUsers,
} from '../../controllers/subDeviceParam.controller';
import { getAllDeviceParamsOfDevice, updateDeviceParamsToSocketUsers } from '../../controllers/deviceParam.controller';
import {
  validateGetSubDeviceParamsSocket,
  validatePutSubDeviceParamsSocket,
} from '../../validations/subDeviceParam.validation';
import { validateGetDeviceParamsSocket, validatePutDeviceParamsSocket } from '../../validations/deviceParam.validation';

const deviceParamGetEvents = [{ name: 'deviceParam/getAll', listener: getAllDeviceParamsOfDevice }];
const deviceParamPutEvents = [{ name: 'deviceParam/update', listener: updateDeviceParamsToSocketUsers }];
const subDeviceParamGetEvents = [{ name: 'subDeviceParam/getAll', listener: getAllSubDeviceParamsOfDevice }];
const subDeviceParamPutEvents = [{ name: 'subDeviceParam/update', listener: updateSubDeviceParamsToSocketUsers }];

const reRouteMessages = socket => {
  subDeviceParamGetEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, () => validateGetSubDeviceParamsSocket(socket, listener));
  });
  subDeviceParamPutEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, data => validatePutSubDeviceParamsSocket(socket, data, listener));
  });
  deviceParamGetEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, () => validateGetDeviceParamsSocket(socket, listener));
  });
  deviceParamPutEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, data => validatePutDeviceParamsSocket(socket, data, listener));
  });
};

export default reRouteMessages;
