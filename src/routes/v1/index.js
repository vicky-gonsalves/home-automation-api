import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import deviceRoute from './device.route';
import sharedDeviceAccessRoute from './sharedDeviceAccess.route';
import settingRoute from './setting.route';
import meRoute from './me.route';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/devices', deviceRoute);
router.use('/shared-device-access', sharedDeviceAccessRoute);
router.use('/me', meRoute);
router.use('/settings', settingRoute);

module.exports = router;
