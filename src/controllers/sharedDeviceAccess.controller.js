import httpStatus from 'http-status';
import { createSharedDeviceAccessService, deleteSharedDeviceAccessService } from '../services/sharedDeviceAccess.service';
import catchAsync from '../utils/catchAsync';

const createSharedDeviceAccess = catchAsync(async (req, res) => {
  req.body.sharedBy = req.user.email;
  const sharedDeviceAccess = await createSharedDeviceAccessService(req.body);
  res.status(httpStatus.CREATED).send(sharedDeviceAccess.transform());
});

const deleteSharedDeviceAccess = catchAsync(async (req, res) => {
  await deleteSharedDeviceAccessService(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSharedDeviceAccess,
  deleteSharedDeviceAccess,
};
