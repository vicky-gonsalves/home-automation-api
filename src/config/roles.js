const roles = ['user', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], []);
roleRights.set(roles[1], [
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
]);

module.exports = {
  roles,
  roleRights,
};
