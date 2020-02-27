import express from 'express';
import validate from '../../middlewares/validate';
import {
  forgotPasswordValidation,
  loginValidation,
  refreshTokensValidation,
  registerValidation,
  resetPasswordValidation,
} from '../../validations/auth.validation';
import { forgotPassword, login, refreshTokens, register, resetPassword } from '../../controllers/auth.controller';

const router = express.Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/refresh-tokens', validate(refreshTokensValidation), refreshTokens);
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);

module.exports = router;
