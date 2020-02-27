import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import deviceRoute from './device.route';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/devices', deviceRoute);

module.exports = router;
