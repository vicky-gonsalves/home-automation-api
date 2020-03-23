import express from 'express';
import auth from '../../middlewares/auth';
import { updateSetting } from '../../controllers/setting.controller';
import validate from '../../middlewares/validate';
import { updateSettingValidation } from '../../validations/setting.validation';

const router = express.Router();

router.route('/').patch(auth('updateSetting'), validate(updateSettingValidation), updateSetting);

module.exports = router;
