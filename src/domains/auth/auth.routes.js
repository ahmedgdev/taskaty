import express from 'express';
import { signup, login, forgotPassword } from './auth.controller.js';
import validate from '../../utils/validation/validate.js';
import {
  forgotPasswordSchema,
  loginSchema,
  signupSchema,
} from './auth.schemas.js';
const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

export default router;
