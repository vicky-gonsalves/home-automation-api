import httpStatus from 'http-status';
import { getDeviceByDeviceIdService } from '../services/device.service';
import {
  createSubDeviceService,
  deleteSubDeviceService,
  getActiveSubDevicesByDeviceIdAndSortService,
  getSubDeviceBySubDeviceIdService,
  getSubDevicesService,
  updateSubDeviceService,
} from '../services/subDevice.service';
import catchAsync from '../utils/catchAsync';
import { getSharedDeviceAccessByDeviceIdService } from '../services/sharedDeviceAccess.service';
import { getSocketIdsByDeviceIdService, getSocketIdsByEmailsService } from '../services/socketId.service';
import NotificationService from '../services/notification.service';
import uniqid from 'uniqid';
import {
  createSmartSwitchSettingService,
  createTankSettingService,
  deleteDeviceSettingService,
  deleteNonPreferredSubDeviceSettingService,
  deleteSubDeviceSettingService,
  getPreferredSubDeviceService,
  toggleDeviceSettingService,
  updateNonPreferredSubDeviceSettingService,
  updateSettingService,
  updateSubDeviceSettingService,
} from '../services/setting.service';
import { deviceVariant } from '../config/device';
import { settingType } from '../config/setting';

const sendSubDeviceSocketNotification = async (device, event, data) => {
  const deviceAccees = await getSharedDeviceAccessByDeviceIdService(device.deviceId);
  const emails = [device.deviceOwner, ...deviceAccees.map(access => access.email)];
  const socketIds = [
    ...(await getSocketIdsByDeviceIdService(device.deviceId)), // send to device
    ...(await getSocketIdsByEmailsService(emails)), // send to users
  ];
  if (socketIds.length) {
    NotificationService.sendMessage(socketIds, event, data);
  }
};

const notify = async (device, settings) => {
  let event;
  return Promise.all(
    settings.map(async setting => {
      if (setting.type === settingType[0]) {
        event = 'DEVICE_SETTING_CREATED';
      } else {
        event = 'SUB_DEVICE_SETTING_CREATED';
      }
      return sendSubDeviceSocketNotification(device, event, setting.transform());
    })
  );
};

const updatePreferredSubDevice = async (device, subDevice, deviceSetting, email) => {
  // update preferredDevice
  const updatedSetting = await updateSettingService(deviceSetting, {
    paramValue: subDevice.subDeviceId,
    _updatedBy: email,
  });
  await sendSubDeviceSocketNotification(device, 'DEVICE_SETTING_UPDATED', updatedSetting);
};

const createSubDevice = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.email;
  req.body.subDeviceId = uniqid();
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  const subDevice = await createSubDeviceService(req.params.deviceId, req.body);
  await sendSubDeviceSocketNotification(device, 'SUB_DEVICE_CREATED', subDevice);
  if (device.variant === deviceVariant[0]) {
    const deviceSettings = await createTankSettingService(subDevice);
    if (deviceSettings && deviceSettings.length) {
      await notify(device, deviceSettings);
    }
  } else {
    const subDeviceSettings = await createSmartSwitchSettingService(subDevice);
    if (subDeviceSettings && subDeviceSettings.length) {
      await notify(device, subDeviceSettings);
    }
  }
  res.status(httpStatus.CREATED).send(subDevice.transform());
});

const getSubDevices = catchAsync(async (req, res) => {
  const subDevices = await getSubDevicesService(req.params.deviceId, req.query);
  const response = subDevices.map(subDevice => subDevice.transform());
  res.send(response);
});

const getSubDevice = catchAsync(async (req, res) => {
  const subDevice = await getSubDeviceBySubDeviceIdService(req.params.deviceId, req.params.subDeviceId);
  res.send(subDevice.transform());
});

const updateSubDevice = catchAsync(async (req, res) => {
  req.body._updatedBy = req.user.email;
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  const subDevice = await getSubDeviceBySubDeviceIdService(req.params.deviceId, req.params.subDeviceId);
  // eslint-disable-next-line no-prototype-builtins
  if (req.body.hasOwnProperty('isDisabled')) {
    if (device.variant === deviceVariant[0]) {
      const deviceSetting = await getPreferredSubDeviceService(device.deviceId, subDevice.subDeviceId);
      if (deviceSetting) {
        const subDevices = await getActiveSubDevicesByDeviceIdAndSortService(device.deviceId);
        if (subDevices && subDevices.length > 1) {
          if (req.body.isDisabled) {
            // filter non preferred sub devices
            const nonPreferredSubDevices = subDevices.filter(
              _subDevice => _subDevice.subDeviceId !== deviceSetting.paramValue
            );
            // update preferred sub device to first available sub device
            await updatePreferredSubDevice(device, nonPreferredSubDevices[0], deviceSetting, req.user.email);
          }
        } else {
          // If only 1 sub device available, update setting
          await toggleDeviceSettingService(deviceSetting, req.body.isDisabled, req.user.email);
          await sendSubDeviceSocketNotification(device, 'DEVICE_SETTING_UPDATED', deviceSetting);
        }
      }
      // finally update all non preferred device settings
      const updateSettings = await updateNonPreferredSubDeviceSettingService(
        device.deviceId,
        subDevice.subDeviceId,
        req.body.isDisabled,
        req.user.email
      );
      if (updateSettings.length) {
        await sendSubDeviceSocketNotification(device, 'DEVICE_MULTI_SETTING_UPDATED', updateSettings);
      }
    } else {
      const updatedSubDeviceSetting = await updateSubDeviceSettingService(
        device.deviceId,
        subDevice.subDeviceId,
        req.body.isDisabled,
        req.user.email
      );
      if (updatedSubDeviceSetting.length) {
        await sendSubDeviceSocketNotification(device, 'SUB_DEVICE_MULTI_SETTING_UPDATED', updatedSubDeviceSetting);
      }
    }
  }
  const updatedSubDevice = await updateSubDeviceService(req.params.deviceId, req.params.subDeviceId, req.body);
  await sendSubDeviceSocketNotification(device, 'SUB_DEVICE_UPDATED', updatedSubDevice);
  res.send(updatedSubDevice.transform());
});

const deleteSubDevice = catchAsync(async (req, res) => {
  const device = await getDeviceByDeviceIdService(req.params.deviceId);
  const subDevice = await getSubDeviceBySubDeviceIdService(req.params.deviceId, req.params.subDeviceId);
  if (device.variant === deviceVariant[0]) {
    // check if sub device has preferred sub device setting
    const deviceSetting = await getPreferredSubDeviceService(device.deviceId, subDevice.subDeviceId);
    if (deviceSetting) {
      // get all active sub devices and sort it asc by created date
      const subDevices = await getActiveSubDevicesByDeviceIdAndSortService(device.deviceId);
      // if more than 1 sub devices available
      if (subDevices && subDevices.length > 1) {
        // filter non preferred sub devices
        const nonPreferredSubDevices = subDevices.filter(_subDevice => _subDevice.subDeviceId !== deviceSetting.paramValue);
        // update preferred sub device to first available sub device
        await updatePreferredSubDevice(device, nonPreferredSubDevices[0], deviceSetting, req.user.email);
      } else {
        // If only 1 sub device available, delete setting
        const deviceSettings = await deleteDeviceSettingService(device.deviceId);
        await sendSubDeviceSocketNotification(device, 'DEVICE_MULTI_SETTING_DELETED', deviceSettings);
      }
    }
    // finally delete all non preferred device settings
    const deletedSettings = await deleteNonPreferredSubDeviceSettingService(device.deviceId);
    if (deletedSettings.length) {
      await sendSubDeviceSocketNotification(device, 'DEVICE_MULTI_SETTING_DELETED', deletedSettings);
    }
  } else {
    // Delete all device settings for device variant === smartSwitch
    const deletedSubDeviceSettings = await deleteSubDeviceSettingService(device.deviceId, subDevice.subDeviceId);
    if (deletedSubDeviceSettings.length) {
      await sendSubDeviceSocketNotification(device, 'SUB_DEVICE_MULTI_SETTING_DELETED', deletedSubDeviceSettings);
    }
  }
  const deletedSubDevice = await deleteSubDeviceService(req.params.deviceId, req.params.subDeviceId);
  await sendSubDeviceSocketNotification(device, 'SUB_DEVICE_DELETED', deletedSubDevice);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSubDevice,
  getSubDevices,
  getSubDevice,
  updateSubDevice,
  deleteSubDevice,
};
