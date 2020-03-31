import express from 'express';
import auth from '../../middlewares/auth';
import {
  authorizeDevice,
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
  updateMultiSubDeviceParamValue,
  updateSubDeviceParam,
  updateSubDeviceParamValue,
} from '../../controllers/subDeviceParam.controller';
import validate from '../../middlewares/validate';
import {
  authorizeDeviceValidation,
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
  updateMultiStatusValidation,
  updateSubDeviceParamValidation,
  updateSubDeviceParamValueValidation,
} from '../../validations/subDeviceParam.validation';
import {
  createDeviceParamValidation,
  deleteDeviceParamValidation,
  getDeviceParamsValidation,
  getDeviceParamValidation,
  updateDeviceParamValidation,
  updateDeviceParamValueValidation,
} from '../../validations/deviceParam.validation';
import {
  createDeviceParam,
  deleteDeviceParam,
  getDeviceParam,
  getDeviceParams,
  updateDeviceParam,
  updateDeviceParamValue,
} from '../../controllers/deviceParam.controller';

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

router.route('/authorize-device/:deviceId').get(auth('manageDevices'), validate(authorizeDeviceValidation), authorizeDevice);

// --------------------------------DeviceParams----------------------------------------------------------------------------------------------

router
  .route('/:deviceId/device-params/')
  .post(auth('manageDeviceParams'), validate(createDeviceParamValidation), createDeviceParam)
  .get(auth('getDeviceParams'), validate(getDeviceParamsValidation), getDeviceParams);

router
  .route('/:deviceId/device-params/:paramName')
  .get(auth('getDeviceParams'), validate(getDeviceParamValidation), getDeviceParam)
  .patch(auth('manageDeviceParams'), validate(updateDeviceParamValidation), updateDeviceParam)
  .delete(auth('manageDeviceParams'), validate(deleteDeviceParamValidation), deleteDeviceParam);

router
  .route('/:deviceId/device-param-value/:paramName')
  .patch(auth('updateDeviceParamsValue'), validate(updateDeviceParamValueValidation), updateDeviceParamValue);

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

router
  .route('/:deviceId/sub-devices/:subDeviceId/sub-device-param-value/:paramName')
  .patch(auth('updateSubDeviceParamsValue'), validate(updateSubDeviceParamValueValidation), updateSubDeviceParamValue);

router
  .route('/:deviceId/sub-device-param-value/status')
  .patch(auth('updateSubDeviceParamsValue'), validate(updateMultiStatusValidation), updateMultiSubDeviceParamValue);

module.exports = router;
