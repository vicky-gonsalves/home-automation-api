const roles = ['user', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], ['getMe', 'getMyDevices', 'updateSubDeviceParamsValue', 'updateSetting']);

roleRights.set(roles[1], [
  'getMe',
  'getMyDevices',
  'getUsers',
  'manageUsers',
  'getDevices',
  'manageDevices',
  'getSubDevices',
  'manageSubDevices',
  'getSubDeviceParams',
  'manageSubDeviceParams',
  'getSharedDeviceAccess',
  'manageSharedDeviceAccess',
  'updateSubDeviceParamsValue',
  'updateSetting',
]);

module.exports = {
  roles,
  roleRights,
};
