const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const deviceValidation = require('../../validations/device.validation');
const deviceController = require('../../controllers/device.controller');
const subDeviceValidation = require('../../validations/subDevice.validation');
const subDeviceController = require('../../controllers/subDevice.controller');
const subDeviceParamValidation = require('../../validations/subDeviceParam.validation');
const subDeviceParamController = require('../../controllers/subDeviceParam.controller');

const router = express.Router();

//--------------------------------Devices---------------------------------------------------------------------------------------------------
router
  .route('/')
  .post(auth('manageDevices'), validate(deviceValidation.createDevice), deviceController.createDevice)
  .get(auth('getDevices'), validate(deviceValidation.getDevices), deviceController.getDevices);

router
  .route('/:deviceId')
  .get(auth('getDevices'), validate(deviceValidation.getDevice), deviceController.getDevice)
  .patch(auth('manageDevices'), validate(deviceValidation.updateDevice), deviceController.updateDevice)
  .delete(auth('manageDevices'), validate(deviceValidation.deleteDevice), deviceController.deleteDevice);

router
  .route('/get-by-device-owner/:deviceOwner')
  .get(auth('getDevices'), validate(deviceValidation.getDeviceByDeviceOwner), deviceController.getByDeviceOwner);

//--------------------------------SubDevices------------------------------------------------------------------------------------------------

router
  .route('/:deviceId/sub-devices/')
  .post(auth('manageSubDevices'), validate(subDeviceValidation.createSubDevice), subDeviceController.createSubDevice)
  .get(auth('getSubDevices'), validate(subDeviceValidation.getSubDevices), subDeviceController.getSubDevices);

router
  .route('/:deviceId/sub-devices/:subDeviceId')
  .get(auth('getSubDevices'), validate(subDeviceValidation.getSubDevice), subDeviceController.getSubDevice)
  .patch(auth('manageSubDevices'), validate(subDeviceValidation.updateSubDevice), subDeviceController.updateSubDevice)
  .delete(auth('manageSubDevices'), validate(subDeviceValidation.deleteSubDevice), subDeviceController.deleteSubDevice);


//--------------------------------SubDeviceParams-------------------------------------------------------------------------------------------

router
  .route('/:deviceId/sub-devices/:subDeviceId/sub-device-params/')
  .post(auth('manageSubDeviceParams'), validate(subDeviceParamValidation.createSubDeviceParam), subDeviceParamController.createSubDeviceParam)
  .get(auth('getSubDeviceParams'), validate(subDeviceParamValidation.getSubDeviceParams), subDeviceParamController.getSubDeviceParams);

router
  .route('/:deviceId/sub-devices/:subDeviceId/sub-device-params/:paramName')
  .get(auth('getSubDeviceParams'), validate(subDeviceParamValidation.getSubDeviceParam), subDeviceParamController.getSubDeviceParam)
  .patch(auth('manageSubDeviceParams'), validate(subDeviceParamValidation.updateSubDeviceParam), subDeviceParamController.updateSubDeviceParam)
  .delete(auth('manageSubDeviceParams'), validate(subDeviceParamValidation.deleteSubDeviceParam), subDeviceParamController.deleteSubDeviceParam);

module.exports = router;
