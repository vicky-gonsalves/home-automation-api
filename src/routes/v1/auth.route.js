import express from 'express';
import validate from '../../middlewares/validate';
import {
  forgotPasswordValidation,
  loginValidation,
  refreshTokensValidation,
  registerValidation,
  resetPasswordValidation,
} from '../../validations/auth.validation';
import { forgotPassword, login, me, refreshTokens, register, resetPassword } from '../../controllers/auth.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/me', auth('getMe'), me);
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/refresh-tokens', validate(refreshTokensValidation), refreshTokens);
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);

module.exports = router;
