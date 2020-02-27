import express from 'express';
import auth from '../../middlewares/auth';
import {
  createDevice,
  deleteDevice,
  getByDeviceOwner,
  getDevice,
  getDevices,
  updateDevice,
} from '../../controllers/device.controller';
import {
  createSubDevice,
  deleteSubDevice,
  getSubDevice,
  getSubDevices,
  updateSubDevice,
} from '../../controllers/subDevice.controller';
import {
  createSubDeviceParam,
  deleteSubDeviceParam,
  getSubDeviceParam,
  getSubDeviceParams,
  updateSubDeviceParam,
} from '../../controllers/subDeviceParam.controller';
import validate from '../../middlewares/validate';
import {
  createDeviceValidation,
  deleteDeviceValidation,
  getDeviceByDeviceOwnerValidation,
  getDevicesValidation,
  getDeviceValidation,
  updateDeviceValidation,
} from '../../validations/device.validation';
import {
  createSubDeviceValidation,
  deleteSubDeviceValidation,
  getSubDevicesValidation,
  getSubDeviceValidation,
  updateSubDeviceValidation,
} from '../../validations/subDevice.validation';
import {
  createSubDeviceParamValidation,
  deleteSubDeviceParamValidation,
  getSubDeviceParamsValidation,
  getSubDeviceParamValidation,
  updateSubDeviceParamValidation,
} from '../../validations/subDeviceParam.validation';

const router = express.Router();

// --------------------------------Devices---------------------------------------------------------------------------------------------------
router
  .route('/')
  .post(auth('manageDevices'), validate(createDeviceValidation), createDevice)
  .get(auth('getDevices'), validate(getDevicesValidation), getDevices);

router
  .route('/:deviceId')
  .get(auth('getDevices'), validate(getDeviceValidation), getDevice)
  .patch(auth('manageDevices'), validate(updateDeviceValidation), updateDevice)
  .delete(auth('manageDevices'), validate(deleteDeviceValidation), deleteDevice);

router
  .route('/get-by-device-owner/:deviceOwner')
  .get(auth('getDevices'), validate(getDeviceByDeviceOwnerValidation), getByDeviceOwner);

// --------------------------------SubDevices------------------------------------------------------------------------------------------------

router
  .route('/:deviceId/sub-devices/')
  .post(auth('manageSubDevices'), validate(createSubDeviceValidation), createSubDevice)
  .get(auth('getSubDevices'), validate(getSubDevicesValidation), getSubDevices);

router
  .route('/:deviceId/sub-devices/:subDeviceId')
  .get(auth('getSubDevices'), validate(getSubDeviceValidation), getSubDevice)
  .patch(auth('manageSubDevices'), validate(updateSubDeviceValidation), updateSubDevice)
  .delete(auth('manageSubDevices'), validate(deleteSubDeviceValidation), deleteSubDevice);

// --------------------------------SubDeviceParams-------------------------------------------------------------------------------------------

router
  .route('/:deviceId/sub-devices/:subDeviceId/sub-device-params/')
  .post(auth('manageSubDeviceParams'), validate(createSubDeviceParamValidation), createSubDeviceParam)
  .get(auth('getSubDeviceParams'), validate(getSubDeviceParamsValidation), getSubDeviceParams);

router
  .route('/:deviceId/sub-devices/:subDeviceId/sub-device-params/:paramName')
  .get(auth('getSubDeviceParams'), validate(getSubDeviceParamValidation), getSubDeviceParam)
  .patch(auth('manageSubDeviceParams'), validate(updateSubDeviceParamValidation), updateSubDeviceParam)
  .delete(auth('manageSubDeviceParams'), validate(deleteSubDeviceParamValidation), deleteSubDeviceParam);

module.exports = router;
