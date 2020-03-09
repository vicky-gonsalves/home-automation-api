import httpStatus from 'http-status';
import { getActiveDeviceByDeviceIdService, getDeviceByDeviceIdService } from '../services/device.service';
import {
  getActiveSubDeviceByDeviceIdAndSubDeviceIdService,
  getActiveSubDevicesByDeviceIdService,
  getSubDeviceBySubDeviceIdService,
} from '../services/subDevice.service';
import {
  createSubDeviceParamService,
  deleteSubDeviceParamService,
  getActiveSubDeviceParamByParamNameService,
  getActiveSubDeviceParamsByDeviceIdAndSubDeviceIdService,
  getSubDeviceParamByParamNameService,
  getSubDeviceParamsService,
  updateSubDeviceParamService,
} from '../services/subDeviceParam.service';
import NotificationService from '../services/notification.service';
import catchAsync from '../utils/catchAsync';
import { checkAccessIfExists, getSharedDeviceAccessByDeviceIdService } from '../services/sharedDeviceAccess.service';
import { getSocketIdsByDeviceIdService, getSocketIdsByEmailsService } from '../services/socketId.service';

const sendSubDeviceParamSocketNotification = async (device, event, subDeviceParam, sendOnlyToDevice = false) => {
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
    NotificationService.sendMessage(socketIds, event, subDeviceParam);
  }
};

const createSubDeviceParam = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.email;
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  await getSubDeviceBySubDeviceIdService(req.params.deviceId, req.params.subDeviceId);
  const subDeviceParam = await createSubDeviceParamService(req.params.deviceId, req.params.subDeviceId, req.body);
  await sendSubDeviceParamSocketNotification(device, 'SUB_DEVICE_PARAM_CREATED', subDeviceParam);
  res.status(httpStatus.CREATED).send(subDeviceParam.transform());
});

const getSubDeviceParams = catchAsync(async (req, res) => {
  const subDeviceParams = await getSubDeviceParamsService(req.params.deviceId, req.params.subDeviceId, req.query);
  const response = subDeviceParams.map(subDeviceParam => subDeviceParam.transform());
  res.send(response);
});

const getSubDeviceParam = catchAsync(async (req, res) => {
  const subDeviceParam = await getSubDeviceParamByParamNameService(
    req.params.deviceId,
    req.params.subDeviceId,
    req.params.paramName
  );
  res.send(subDeviceParam.transform());
});

const updateSubDeviceParam = catchAsync(async (req, res) => {
  req.body._updatedBy = req.user.email;
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  await getSubDeviceBySubDeviceIdService(req.params.deviceId, req.params.subDeviceId);
  const subDeviceParam = await updateSubDeviceParamService(
    req.params.deviceId,
    req.params.subDeviceId,
    req.params.paramName,
    req.body
  );
  await sendSubDeviceParamSocketNotification(device, 'SUB_DEVICE_PARAM_UPDATED', subDeviceParam);
  res.send(subDeviceParam.transform());
});

const updateSubDeviceParamValue = catchAsync(async (req, res) => {
  req.body._updatedBy = req.user.email;
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  await getSubDeviceBySubDeviceIdService(req.params.deviceId, req.params.subDeviceId);
  if (req.user.role !== 'admin' && req.user.email !== device.deviceOwner) {
    await checkAccessIfExists(device.deviceId, req.user.email);
  }
  const subDeviceParam = await updateSubDeviceParamService(
    req.params.deviceId,
    req.params.subDeviceId,
    req.params.paramName,
    req.body
  );
  await sendSubDeviceParamSocketNotification(device, 'SUB_DEVICE_PARAM_UPDATED', subDeviceParam);
  res.send(subDeviceParam.transform());
});

const deleteSubDeviceParam = catchAsync(async (req, res) => {
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  const subDeviceParam = await getSubDeviceParamByParamNameService(
    req.params.deviceId,
    req.params.subDeviceId,
    req.params.paramName
  );
  await sendSubDeviceParamSocketNotification(device, 'SUB_DEVICE_PARAM_DELETED', subDeviceParam);
  await deleteSubDeviceParamService(req.params.deviceId, req.params.subDeviceId, req.params.paramName);
  res.status(httpStatus.NO_CONTENT).send();
});

const getAllSubDeviceParamsOfDevice = async (socketId, device) => {
  let data;
  let subDeviceParams = [];
  const subDevices = await getActiveSubDevicesByDeviceIdService([device.deviceId]);
  if (subDevices && subDevices.length) {
    subDeviceParams = await getActiveSubDeviceParamsByDeviceIdAndSubDeviceIdService(subDevices);
    if (subDeviceParams.length) {
      data = subDeviceParams;
    } else {
      data = { error: 'no sub device params' };
    }
  } else {
    data = { error: 'no sub device' };
  }
  NotificationService.sendMessage([{ socketId }], 'GET_ALL_SUB_DEVICE_PARAMS', data);
};

const updateSubDeviceParamsToSocketUsers = async (socketDevice, _updateData) => {
  const errorEvent = 'ERROR_SUB_DEVICE_PARAM_UPDATE';
  const device = await getActiveDeviceByDeviceIdService(socketDevice.deviceId);
  if (!device) {
    return sendSubDeviceParamSocketNotification(socketDevice, errorEvent, { error: 'no active device' }, true);
  }
  const subDevice = await getActiveSubDeviceByDeviceIdAndSubDeviceIdService(socketDevice.deviceId, _updateData.subDeviceId);
  if (!subDevice) {
    return sendSubDeviceParamSocketNotification(device, errorEvent, { error: 'no active sub device' }, true);
  }
  const subDeviceParam = await getActiveSubDeviceParamByParamNameService(
    device.deviceId,
    subDevice.subDeviceId,
    _updateData.paramName
  );
  if (!subDeviceParam) {
    return sendSubDeviceParamSocketNotification(device, errorEvent, { error: 'no active sub device param' }, true);
  }
  const updatedSubDeviceParam = await updateSubDeviceParamService(
    device.deviceId,
    subDevice.subDeviceId,
    _updateData.paramName,
    _updateData.updatedBody
  );
  await sendSubDeviceParamSocketNotification(device, 'SUB_DEVICE_PARAMS_UPDATED', updatedSubDeviceParam);
};

module.exports = {
  createSubDeviceParam,
  getSubDeviceParams,
  getSubDeviceParam,
  updateSubDeviceParam,
  deleteSubDeviceParam,
  getAllSubDeviceParamsOfDevice,
  updateSubDeviceParamsToSocketUsers,
  updateSubDeviceParamValue,
};
