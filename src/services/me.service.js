import { getActiveDevicesByDeviceIdService, getActiveDevicesByDeviceOwnerService } from './device.service';
import { getSharedDeviceAccessByEmailService } from './sharedDeviceAccess.service';

const getMyDevicesService = async email => {
  let sharedDevices = [];
  const myDevices = await getActiveDevicesByDeviceOwnerService(email);
  const sharedDevicesAccess = await getSharedDeviceAccessByEmailService(email);
  const deviceIds = sharedDevicesAccess.map(device => device.deviceId);
  sharedDevices = await getActiveDevicesByDeviceIdService(deviceIds);
  return { myDevices, sharedDevices };
};

module.exports = {
  getMyDevicesService,
};
