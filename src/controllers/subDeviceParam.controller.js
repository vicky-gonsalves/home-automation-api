import httpStatus from 'http-status';
import { getDeviceByDeviceIdService } from '../services/device.service';
import { getActiveSubDevicesByDeviceIdService, getSubDeviceBySubDeviceIdService } from '../services/subDevice.service';
import {
  createSubDeviceParamService,
  deleteSubDeviceParamService,
  getActiveSubDeviceParamsByDeviceIdAndSubDeviceIdService,
  getSubDeviceParamByParamNameService,
  getSubDeviceParamsService,
  updateSubDeviceParamService,
} from '../services/subDeviceParam.service';
import NotificationService from '../services/notification.service';
import catchAsync from '../utils/catchAsync';
import { getSharedDeviceAccessByDeviceIdService } from '../services/sharedDeviceAccess.service';
import { getSocketIdsByDeviceIdService, getSocketIdsByEmailsService } from '../services/socketId.service';

const sendSubDeviceParamSocketNotification = async (device, event, subDeviceParam) => {
  const deviceAccees = await getSharedDeviceAccessByDeviceIdService(device.deviceId);
  const emails = [device.deviceOwner, ...deviceAccees.map(access => access.email)];
  const socketIds = [
    ...(await getSocketIdsByDeviceIdService(device.deviceId)), // send to device
    ...(await getSocketIdsByEmailsService(emails)), // send to users
  ];
  if (socketIds.length) {
    NotificationService.sendMessage(socketIds, event, subDeviceParam);
  }
};

const createSubDeviceParam = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.email;
  await getDeviceByDeviceIdService(req.params.deviceId);
  await getSubDeviceBySubDeviceIdService(req.params.deviceId, req.params.subDeviceId);
  const subDeviceParam = await createSubDeviceParamService(req.params.deviceId, req.params.subDeviceId, req.body);
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
  await getDeviceByDeviceIdService(req.params.deviceId);
  await getSubDeviceBySubDeviceIdService(req.params.deviceId, req.params.subDeviceId);
  const subDeviceParam = await updateSubDeviceParamService(
    req.params.deviceId,
    req.params.subDeviceId,
    req.params.paramName,
    req.body
  );
  res.send(subDeviceParam.transform());
});

const deleteSubDeviceParam = catchAsync(async (req, res) => {
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
  await getDeviceByDeviceIdService(socketDevice.deviceId);
  await getSubDeviceBySubDeviceIdService(socketDevice.deviceId, _updateData.subDeviceId);
  const subDeviceParam = await updateSubDeviceParamService(
    socketDevice.deviceId,
    _updateData.subDeviceId,
    _updateData.paramName,
    _updateData.updatedBody
  );
  await sendSubDeviceParamSocketNotification(socketDevice, 'SUB_DEVICE_PARAMS_UPDATED', subDeviceParam);
};

module.exports = {
  createSubDeviceParam,
  getSubDeviceParams,
  getSubDeviceParam,
  updateSubDeviceParam,
  deleteSubDeviceParam,
  getAllSubDeviceParamsOfDevice,
  updateSubDeviceParamsToSocketUsers,
};
