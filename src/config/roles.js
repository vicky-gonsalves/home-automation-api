const roles = ['user', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], [
  'getMe',
  'getMyDevices',
  'updateDeviceParamsValue',
  'updateSubDeviceParamsValue',
  'updateSetting',
]);

roleRights.set(roles[1], [
  'getMe',
  'getMyDevices',
  'getUsers',
  'manageUsers',
  'getDevices',
  'manageDevices',
  'getSubDevices',
  'manageSubDevices',
  'manageDeviceParams',
  'getDeviceParams',
  'getSubDeviceParams',
  'manageSubDeviceParams',
  'getSharedDeviceAccess',
  'manageSharedDeviceAccess',
  'updateDeviceParamsValue',
  'updateSubDeviceParamsValue',
  'updateSetting',
]);

module.exports = {
  roles,
  roleRights,
};
