import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import {
  createSharedDeviceAccessValidation,
  deleteSharedDeviceAccessValidation,
} from '../../validations/sharedDeviceAccess.validation';
import { createSharedDeviceAccess, deleteSharedDeviceAccess } from '../../controllers/sharedDeviceAccess.controller';

const router = express.Router();

router
  .route('/')
  .post(auth('manageSharedDeviceAccess'), validate(createSharedDeviceAccessValidation), createSharedDeviceAccess);

router
  .route('/:id')
  .delete(auth('manageSharedDeviceAccess'), validate(deleteSharedDeviceAccessValidation), deleteSharedDeviceAccess);

module.exports = router;
