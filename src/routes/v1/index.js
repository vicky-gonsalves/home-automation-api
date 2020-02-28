import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import deviceRoute from './device.route';
import sharedDeviceAccessRoute from './sharedDeviceAccess.route';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/devices', deviceRoute);
router.use('/shared-device-access', sharedDeviceAccessRoute);

module.exports = router;
