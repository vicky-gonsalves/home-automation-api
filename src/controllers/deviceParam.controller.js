import { getActiveDeviceByDeviceIdService, getDeviceByDeviceIdService } from '../services/device.service';
import NotificationService from '../services/notification.service';
import {
  createDeviceParamService,
  deleteDeviceParamService,
  getActiveDeviceParamByParamNameService,
  getActiveDeviceParamsByDeviceIdsService,
  getDeviceParamByParamNameService,
  getDeviceParamsService,
  updateDeviceParamService,
} from '../services/deviceParam.service';
import { getSocketIdsByDeviceIdService, getSocketIdsByEmailsService } from '../services/socketId.service';
import { checkAccessIfExists, getSharedDeviceAccessByDeviceIdService } from '../services/sharedDeviceAccess.service';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import { createLogService } from '../services/log.service';

const generateDeviceLog = async (device, params, body) => {
  return `${device.name} ${params.paramName} updated to ${body.paramValue}`;
};

const sendDeviceParamSocketNotification = async (device, event, deviceParam, sendOnlyToDevice = false) => {
  let socketIds = [];
  const deviceSocketIds = await getSocketIdsByDeviceIdService(device.deviceId);
  if (sendOnlyToDevice) {
    socketIds = [...deviceSocketIds];
  } else {
    const deviceAccees = await getSharedDeviceAccessByDeviceIdService(device.deviceId);
    const emails = [device.deviceOwner, ...deviceAccees.map(access => access.email)];
    socketIds = [
      ...deviceSocketIds, // send to device
      ...(await getSocketIdsByEmailsService(emails)), // send to users
    ];
  }
  if (socketIds.length) {
    NotificationService.sendMessage(socketIds, event, deviceParam);
  }
};

const createDeviceParam = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.email;
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  const deviceParam = await createDeviceParamService(req.params.deviceId, req.body);
  await sendDeviceParamSocketNotification(device, 'DEVICE_PARAM_CREATED', deviceParam);
  res.status(httpStatus.CREATED).send(deviceParam.transform());
});

const getDeviceParams = catchAsync(async (req, res) => {
  const deviceParams = await getDeviceParamsService(req.params.deviceId, req.query);
  const response = deviceParams.map(deviceParam => deviceParam.transform());
  res.send(response);
});

const getDeviceParam = catchAsync(async (req, res) => {
  const deviceParam = await getDeviceParamByParamNameService(req.params.deviceId, req.params.paramName);
  res.send(deviceParam.transform());
});

const updateDeviceParam = catchAsync(async (req, res) => {
  req.body._updatedBy = req.user.email;
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  const deviceParam = await updateDeviceParamService(req.params.deviceId, req.params.paramName, req.body);
  await sendDeviceParamSocketNotification(device, 'DEVICE_PARAM_UPDATED', deviceParam);
  res.send(deviceParam.transform());
});

const deleteDeviceParam = catchAsync(async (req, res) => {
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  const deviceParam = await getDeviceParamByParamNameService(req.params.deviceId, req.params.paramName);
  await sendDeviceParamSocketNotification(device, 'DEVICE_PARAM_DELETED', deviceParam);
  await deleteDeviceParamService(req.params.deviceId, req.params.paramName);
  res.status(httpStatus.NO_CONTENT).send();
});

const updateDeviceParamValue = catchAsync(async (req, res) => {
  req.body._updatedBy = req.user.email;
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  if (req.user.role !== 'admin' && req.user.email !== device.deviceOwner) {
    await checkAccessIfExists(device.deviceId, req.user.email);
  }
  const deviceParam = await updateDeviceParamService(req.params.deviceId, req.params.paramName, req.body);
  await sendDeviceParamSocketNotification(device, 'DEVICE_PARAM_UPDATED', deviceParam);
  await createLogService(
    device,
    null,
    `${req.params.paramName}_UPDATED`,
    await generateDeviceLog(device, req.params, req.body),
    false,
    true,
    req.user.email
  );
  res.send(deviceParam.transform());
});

const getAllDeviceParamsOfDevice = async (socketId, device) => {
  let data;
  let deviceParams = [];
  deviceParams = await getActiveDeviceParamsByDeviceIdsService([device.deviceId]);
  if (deviceParams.length) {
    data = deviceParams;
  } else {
    data = { error: 'no device params' };
  }
  NotificationService.sendMessage([{ socketId }], 'GET_ALL_DEVICE_PARAMS', data);
};

const updateDeviceParamsToSocketUsers = async (socketDevice, __updateData) => {
  const errorEvent = 'ERROR_DEVICE_PARAM_UPDATE';
  const _updateData = __updateData;
  _updateData.updatedBody.updatedBy = `device@${socketDevice.deviceId}.com`;
  const device = await getActiveDeviceByDeviceIdService(socketDevice.deviceId);
  if (!device) {
    return sendDeviceParamSocketNotification(socketDevice, errorEvent, { error: 'no active device' }, true);
  }
  const deviceParam = await getActiveDeviceParamByParamNameService(device.deviceId, _updateData.paramName);
  if (!deviceParam) {
    return sendDeviceParamSocketNotification(device, errorEvent, { error: 'no active device param' }, true);
  }
  const updatedSubDeviceParam = await updateDeviceParamService(
    device.deviceId,
    _updateData.paramName,
    _updateData.updatedBody
  );
  await createLogService(
    device,
    null,
    `${_updateData.paramName}_UPDATED`,
    await generateDeviceLog(device, { paramName: _updateData.paramName }, _updateData.updatedBody),
    true,
    true,
    _updateData.updatedBody.updatedBy
  );
  await sendDeviceParamSocketNotification(device, 'DEVICE_PARAM_UPDATED', updatedSubDeviceParam);
};

module.exports = {
  createDeviceParam,
  getDeviceParams,
  getDeviceParam,
  updateDeviceParam,
  deleteDeviceParam,
  updateDeviceParamValue,
  getAllDeviceParamsOfDevice,
  updateDeviceParamsToSocketUsers,
};
