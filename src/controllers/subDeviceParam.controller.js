import httpStatus from 'http-status';
import {
  getActiveDeviceByDeviceIdForMultiStatusUpdateService,
  getActiveDeviceByDeviceIdService,
  getDeviceByDeviceIdService,
} from '../services/device.service';
import {
  getActiveSubDeviceByDeviceIdAndSubDeviceIdForMultiStatusChangeService,
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
  updateMultiStatusService,
  updateStatusToOffAndNotifyService,
  updateSubDeviceParamService,
  updateUpdatedAtAndNotifyService,
} from '../services/subDeviceParam.service';
import NotificationService from '../services/notification.service';
import catchAsync from '../utils/catchAsync';
import { checkAccessIfExists, getSharedDeviceAccessByDeviceIdService } from '../services/sharedDeviceAccess.service';
import { getSocketIdsByDeviceIdService, getSocketIdsByEmailsService } from '../services/socketId.service';
import { createLogService } from '../services/log.service';
import { deviceVariant } from '../config/device';
import { getDeviceParamByParamNameService } from '../services/deviceParam.service';

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

const generateSubDeviceLog = async (device, subDevice, params, body) => {
  let log = `${subDevice.name}`;
  const socketIds = await getSocketIdsByDeviceIdService(device.deviceId);
  if (params.paramName === 'status') {
    log = `${log} turned ${body.paramValue}`;
    if (device.variant === deviceVariant[0]) {
      const waterLevel = await getDeviceParamByParamNameService(device.deviceId, 'waterLevel');
      if (socketIds.length) {
        log = `${log} when water level was ${waterLevel.paramValue}%`;
      }
    }
  } else {
    log = `${log} ${params.paramName} updated to ${body.paramValue}`;
  }
  if (!socketIds.length) {
    log = `${log} when device was offline`;
  }
  return log;
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
  const subDevice = await getSubDeviceBySubDeviceIdService(req.params.deviceId, req.params.subDeviceId);
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
  await createLogService(
    device,
    req.params.subDeviceId,
    `${req.params.paramName}_UPDATED`,
    await generateSubDeviceLog(device, subDevice, req.params, req.body),
    false,
    false,
    req.user.email
  );
  res.send(subDeviceParam.transform());
});

const updateMultiSubDeviceParamValue = catchAsync(async (req, res) => {
  req.body._updatedBy = req.user.email;
  const device = await getActiveDeviceByDeviceIdForMultiStatusUpdateService(req.params.deviceId);
  if (req.user.role !== 'admin' && req.user.email !== device.deviceOwner) {
    await checkAccessIfExists(device.deviceId, req.user.email);
  }
  const subDevices = await getActiveSubDeviceByDeviceIdAndSubDeviceIdForMultiStatusChangeService(req.params.deviceId);
  const subDeviceParams = await Promise.all(
    subDevices.map(async subDevice => {
      return updateMultiStatusService(req.params.deviceId, subDevice.subDeviceId, req.body.paramValue, req.user.email);
    })
  );
  await sendSubDeviceParamSocketNotification(device, 'SUB_DEVICE_MULTI_PARAM_UPDATED', subDeviceParams);
  await createLogService(
    device,
    null,
    `${req.params.paramName}_UPDATED`,
    await generateSubDeviceLog(device, { name: 'All devices' }, { paramName: 'status' }, req.body),
    false,
    false,
    req.user.email
  );
  res.status(httpStatus.OK).send();
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

const updateSubDeviceParamsToSocketUsers = async (socketDevice, __updateData) => {
  const errorEvent = 'ERROR_SUB_DEVICE_PARAM_UPDATE';
  const _updateData = __updateData;
  _updateData.updatedBody.updatedBy = `device@${socketDevice.deviceId}.com`;
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
  await createLogService(
    device,
    subDevice.subDeviceId,
    `${_updateData.paramName}_UPDATED`,
    await generateSubDeviceLog(device, subDevice, { paramName: _updateData.paramName }, _updateData.updatedBody),
    true,
    false,
    _updateData.updatedBody.updatedBy
  );
  await sendSubDeviceParamSocketNotification(device, 'SUB_DEVICE_PARAMS_UPDATED', updatedSubDeviceParam);
};

const updateUpdatedAt = async device => {
  const updatedParams = await updateUpdatedAtAndNotifyService(device.deviceId);
  await sendSubDeviceParamSocketNotification(device, 'SUB_DEVICE_MULTI_PARAM_UPDATED', updatedParams);
  await createLogService(device, null, `DEVICE_ONLINE`, `Device back online`, true, false, `device@${device.deviceId}.com`);
};

const updateStatusToOff = async device => {
  const updatedParams = await updateStatusToOffAndNotifyService(device.deviceId);
  await sendSubDeviceParamSocketNotification(device, 'SUB_DEVICE_MULTI_PARAM_UPDATED', updatedParams);
  await createLogService(
    device,
    null,
    `DEVICE_OFFLINE`,
    `Device went offline`,
    true,
    false,
    `device@${device.deviceId}.com`
  );
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
  updateMultiSubDeviceParamValue,
  updateUpdatedAt,
  updateStatusToOff,
};
