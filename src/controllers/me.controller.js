import { getActiveSubDevicesByDeviceIdService } from '../services/subDevice.service';
import { getActiveSubDeviceParamsByDeviceIdAndSubDeviceIdService } from '../services/subDeviceParam.service';
import { getMyDevicesService } from '../services/me.service';
import { getActiveSettingsByDeviceIdsService, getActiveSettingsBySubDeviceIdsService } from '../services/setting.service';
import { getOnlineDevicesService } from '../services/socketId.service';
import { getActiveDeviceParamsByDeviceIdsService } from '../services/deviceParam.service';
import { getLogsByDeviceIdService } from '../services/log.service';

const getMyDeviceData = async (req, res) => {
  let deviceIds = [];
  let subDevices = [];
  let deviceParams = [];
  let subDeviceParams = [];
  let onlineDevices = [];
  let logs = [];
  const settings = {
    deviceSettings: [],
    subDeviceSettings: [],
  };
  let paramIds = [];
  const devices = await getMyDevicesService(req.user.email);
  if (devices.myDevices && devices.myDevices.length) {
    deviceIds = devices.myDevices.map(device => device.deviceId);
    onlineDevices = await getOnlineDevicesService(deviceIds);
  }
  if (devices.sharedDevices && devices.sharedDevices.length) {
    deviceIds = [...deviceIds, ...devices.sharedDevices.map(device => device.deviceId)];
  }
  if (deviceIds.length) {
    deviceParams = await getActiveDeviceParamsByDeviceIdsService(deviceIds);
    logs = await getLogsByDeviceIdService(deviceIds);
    subDevices = await getActiveSubDevicesByDeviceIdService(deviceIds);
    const deviceSettings = await getActiveSettingsByDeviceIdsService(deviceIds);
    settings.deviceSettings = deviceSettings.map(deviceSetting => deviceSetting.transform());
  }
  if (subDevices.length) {
    paramIds = subDevices.map(subDevice => ({ deviceId: subDevice.deviceId, subDeviceId: subDevice.subDeviceId }));
    const _subDeviceParams = await getActiveSubDeviceParamsByDeviceIdAndSubDeviceIdService(paramIds);
    subDeviceParams = _subDeviceParams.map(subDeviceParam => subDeviceParam.transform());
    const subDeviceSettings = await getActiveSettingsBySubDeviceIdsService(subDevices);
    settings.subDeviceSettings = subDeviceSettings.map(subDeviceSetting => subDeviceSetting.transform());
  }
  res.send({ devices, subDevices, deviceParams, subDeviceParams, settings, onlineDevices, logs });
};

module.exports = {
  getMyDeviceData,
};
