import { updateSettingService } from '../services/setting.service';
import { checkAccessIfExists, getSharedDeviceAccessByDeviceIdService } from '../services/sharedDeviceAccess.service';
import { getSocketIdsByDeviceIdService, getSocketIdsByEmailsService } from '../services/socketId.service';
import NotificationService from '../services/notification.service';
import { idType } from '../config/setting';
import { getDeviceByDeviceIdService } from '../services/device.service';
import { getSubDeviceByOnlySubDeviceIdService } from '../services/subDevice.service';
import catchAsync from '../utils/catchAsync';

const sendSettingNotification = async (device, event, setting) => {
  const deviceSocketIds = await getSocketIdsByDeviceIdService(device.deviceId);
  const deviceAccees = await getSharedDeviceAccessByDeviceIdService(device.deviceId);
  const emails = [device.deviceOwner, ...deviceAccees.map(access => access.email)];
  const socketIds = [
    ...deviceSocketIds, // send to device
    ...(await getSocketIdsByEmailsService(emails)), // send to users
  ];
  if (socketIds.length) {
    NotificationService.sendMessage(socketIds, event, setting);
  }
};

const updateSetting = catchAsync(async (req, res) => {
  let device;
  const { body } = req;
  let eventType;

  if (body.idType === idType[0]) {
    // if deviceId
    device = await getDeviceByDeviceIdService(body.bindedTo);
    eventType = 'DEVICE_SETTING_UPDATED';
  } else {
    // if subDeviceId
    const subDevice = await getSubDeviceByOnlySubDeviceIdService(body.bindedTo);
    device = await getDeviceByDeviceIdService(subDevice.deviceId);
    eventType = 'SUB_DEVICE_SETTING_UPDATED';
  }
  if (req.user.role !== 'admin' && req.user.email !== device.deviceOwner) {
    await checkAccessIfExists(device.deviceId, req.user.email);
  }
  const updateBody = {
    _updatedBy: req.user.email,
    paramValue: body.paramValue,
  };
  const setting = await updateSettingService(body, updateBody);
  await sendSettingNotification(device, eventType, setting.transform());
  res.send(setting.transform());
});

module.exports = {
  updateSetting,
};
