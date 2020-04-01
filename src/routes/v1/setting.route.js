import express from 'express';
import auth from '../../middlewares/auth';
import { updateSingleSetting, updateMultiSetting } from '../../controllers/setting.controller';
import validate from '../../middlewares/validate';
import { updateMultiSettingValidation, updateSettingValidation } from '../../validations/setting.validation';

const router = express.Router();

router.route('/').patch(auth('updateSetting'), validate(updateSettingValidation), updateSingleSetting);
router.route('/multi').patch(auth('updateSetting'), validate(updateMultiSettingValidation), updateMultiSetting);

module.exports = router;
