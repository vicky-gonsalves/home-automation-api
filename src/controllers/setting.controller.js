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

const updateSetting = async (_setting, user) => {
  let device;
  let eventType;

  if (_setting.idType === idType[0]) {
    // if deviceId
    device = await getDeviceByDeviceIdService(_setting.bindedTo);
    eventType = 'DEVICE_SETTING_UPDATED';
  } else {
    // if subDeviceId
    const subDevice = await getSubDeviceByOnlySubDeviceIdService(_setting.bindedTo);
    device = await getDeviceByDeviceIdService(subDevice.deviceId);
    eventType = 'SUB_DEVICE_SETTING_UPDATED';
  }
  if (user.role !== 'admin' && user.email !== device.deviceOwner) {
    await checkAccessIfExists(device.deviceId, user.email);
  }
  const _updateSetting = {
    _updatedBy: user.email,
    paramValue: _setting.paramValue,
  };
  const setting = await updateSettingService(_setting, _updateSetting);
  await sendSettingNotification(device, eventType, setting.transform());
  return setting;
};

const updateSingleSetting = catchAsync(async (req, res) => {
  const { body, user } = req;
  const setting = await updateSetting(body, user);
  res.send(setting.transform());
});

const updateMultiSetting = catchAsync(async (req, res) => {
  const { body, user } = req;
  const settings = await Promise.all(body.map(_setting => updateSetting(_setting, user)));
  res.send(settings);
});

module.exports = {
  updateSingleSetting,
  updateMultiSetting,
};
