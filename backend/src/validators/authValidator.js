import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('nombres')
    .trim()
    .notEmpty()
    .withMessage('Los nombres son obligatorios')
    .isLength({ min: 2, max: 100 })
    .withMessage('Los nombres deben tener entre 2 y 100 caracteres'),
  
  body('apellidos')
    .trim()
    .notEmpty()
    .withMessage('Los apellidos son obligatorios')
    .isLength({ min: 2, max: 100 })
    .withMessage('Los apellidos deben tener entre 2 y 100 caracteres'),
  
  body('carnet_universitario')
    .trim()
    .notEmpty()
    .withMessage('El carnet universitario es obligatorio')
    .isLength({ min: 1, max: 50 })
    .withMessage('El carnet universitario debe tener máximo 50 caracteres'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email debe ser válido')
    .custom((value) => {
      if (!value.endsWith('@ufm.edu')) {
        throw new Error('El email debe ser del dominio @ufm.edu');
      }
      return true;
    }),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('La confirmación de contraseña es obligatoria')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email debe ser válido'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),
];

export const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email debe ser válido'),
];

export const validateResetPassword = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('El token es obligatorio'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }
  next();
};

