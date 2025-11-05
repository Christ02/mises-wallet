import express from 'express';
import { AuthController } from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors
} from '../validators/authValidator.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register',
  validateRegister,
  handleValidationErrors,
  AuthController.register
);

router.post('/login',
  validateLogin,
  handleValidationErrors,
  AuthController.login
);

router.post('/forgot-password',
  validateForgotPassword,
  handleValidationErrors,
  AuthController.forgotPassword
);

router.post('/reset-password',
  validateResetPassword,
  handleValidationErrors,
  AuthController.resetPassword
);

router.get('/me',
  authenticate,
  AuthController.me
);

export default router;

