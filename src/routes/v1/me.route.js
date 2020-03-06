import express from 'express';
import auth from '../../middlewares/auth';
import { getMyDeviceData } from '../../controllers/me.controller';

const router = express.Router();

router.route('/devices').get(auth('getMyDevices'), getMyDeviceData);

module.exports = router;
