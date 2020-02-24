const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const deviceRoute = require('./device.route');

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/devices', deviceRoute);

module.exports = router;
