import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import {
  createSharedDeviceAccessValidation,
  deleteSharedDeviceAccessValidation,
  getSharedDeviceAccessesValidation,
  getSharedDeviceAccessValidation,
  updateSharedDeviceAccessValidation,
} from '../../validations/sharedDeviceAccess.validation';
import {
  createSharedDeviceAccess,
  deleteSharedDeviceAccess,
  getSharedDeviceAccess,
  getSharedDeviceAccesses,
  updateSharedDeviceAccess,
} from '../../controllers/sharedDeviceAccess.controller';

const router = express.Router();

router
  .route('/')
  .get(auth('getSharedDeviceAccess'), validate(getSharedDeviceAccessesValidation), getSharedDeviceAccesses)
  .post(auth('manageSharedDeviceAccess'), validate(createSharedDeviceAccessValidation), createSharedDeviceAccess);

router
  .route('/:id')
  .get(auth('getSharedDeviceAccess'), validate(getSharedDeviceAccessValidation), getSharedDeviceAccess)
  .patch(auth('manageSharedDeviceAccess'), validate(updateSharedDeviceAccessValidation), updateSharedDeviceAccess)
  .delete(auth('manageSharedDeviceAccess'), validate(deleteSharedDeviceAccessValidation), deleteSharedDeviceAccess);

module.exports = router;
