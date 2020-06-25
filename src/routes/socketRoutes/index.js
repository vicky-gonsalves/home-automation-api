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
import { validateGetSubDeviceSocket } from '../../validations/subDevice.validation';
import { getAllSubDeviceOfDevice } from '../../controllers/subDevice.controller';
import { validateGetDeviceSettingsSocket } from '../../validations/setting.validation';
import { getAllDeviceSettingsOfDevice } from '../../controllers/setting.controller';
import { validateGetSystemParamsSocket } from '../../validations/system.validation';
import { getSystemParams } from '../../controllers/system.controller';

const systemGetEvents = [{ name: 'systemParam/getAll', listener: getSystemParams }];
const deviceParamGetEvents = [{ name: 'deviceParam/getAll', listener: getAllDeviceParamsOfDevice }];
const deviceSettingGetEvents = [{ name: 'deviceSetting/getAll', listener: getAllDeviceSettingsOfDevice }];
const deviceParamPutEvents = [{ name: 'deviceParam/update', listener: updateDeviceParamsToSocketUsers }];
const subDeviceGetEvents = [{ name: 'subDevice/getAll', listener: getAllSubDeviceOfDevice }];
const subDeviceParamGetEvents = [{ name: 'subDeviceParam/getAll', listener: getAllSubDeviceParamsOfDevice }];
const subDeviceParamPutEvents = [{ name: 'subDeviceParam/update', listener: updateSubDeviceParamsToSocketUsers }];

const reRouteMessages = socket => {
  systemGetEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, () => validateGetSystemParamsSocket(socket, listener));
  });
  subDeviceParamGetEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, () => validateGetSubDeviceParamsSocket(socket, listener));
  });
  subDeviceGetEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, () => validateGetSubDeviceSocket(socket, listener));
  });
  subDeviceParamPutEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, data => validatePutSubDeviceParamsSocket(socket, data, listener));
  });
  deviceParamGetEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, () => validateGetDeviceParamsSocket(socket, listener));
  });
  deviceSettingGetEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, () => validateGetDeviceSettingsSocket(socket, listener));
  });
  deviceParamPutEvents.forEach(event => {
    const { listener, name } = event;
    socket.on(name, data => validatePutDeviceParamsSocket(socket, data, listener));
  });
};

export default reRouteMessages;
