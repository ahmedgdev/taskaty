import express from 'express';
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
} from './auth.controller.js';
import validate from '../../utils/validation/validate.js';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordBodySchema,
  resetPasswordParamsSchema,
  signupSchema,
  updatePasswordSchema,
} from './auth.schemas.js';
import { protect } from './auth.middlewares.js';

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post(
  '/reset-password/:resetToken',
  validate(resetPasswordBodySchema),
  validate(resetPasswordParamsSchema, 'params'),
  resetPassword,
);
router.post(
  '/update-password',
  protect,
  validate(updatePasswordSchema),
  updatePassword,
);
export default router;
