import { getActiveSubDevicesByDeviceIdService } from '../services/subDevice.service';
import { getActiveSubDeviceParamsByDeviceIdAndSubDeviceIdService } from '../services/subDeviceParam.service';
import { getMyDevicesService } from '../services/me.service';

const getMyDeviceData = async (req, res) => {
  let deviceIds = [];
  let subDevices = [];
  let subDeviceParams = [];
  let paramIds = [];
  const devices = await getMyDevicesService(req.user.email);
  if (devices.myDevices && devices.myDevices.length) {
    deviceIds = devices.myDevices.map(device => device.deviceId);
  }
  if (devices.sharedDevices && devices.sharedDevices.length) {
    deviceIds = [...deviceIds, ...devices.sharedDevices.map(device => device.deviceId)];
  }
  if (deviceIds.length) {
    subDevices = await getActiveSubDevicesByDeviceIdService(deviceIds);
  }
  if (subDevices.length) {
    paramIds = subDevices.map(subDevice => ({ deviceId: subDevice.deviceId, subDeviceId: subDevice.subDeviceId }));
    subDeviceParams = await getActiveSubDeviceParamsByDeviceIdAndSubDeviceIdService(paramIds);
  }
  res.send({ devices, subDevices, subDeviceParams });
};

module.exports = {
  getMyDeviceData,
};