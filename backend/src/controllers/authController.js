import { AuthService } from '../services/authService.js';
import { AuditService } from '../services/auditService.js';

export class AuthController {
  static async register(req, res) {
    try {
      const { nombres, apellidos, carnet_universitario, email, password } = req.body;
      
      const result = await AuthService.register({
        nombres,
        apellidos,
        carnet_universitario,
        email,
        password
      });

      // Log de registro
      await AuditService.logCreate(
        result.user.id,
        'user',
        result.user.id,
        `Usuario registrado: ${email} (${carnet_universitario})`,
        { email, carnet_universitario },
        req
      );

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        ...result
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login(email, password);

      // Log de login exitoso
      await AuditService.logLogin(result.user.id, email, true, req);

      res.status(200).json({
        message: 'Login exitoso',
        ...result
      });
    } catch (error) {
      // Log de login fallido
      await AuditService.logLogin(null, email, false, req);

      res.status(401).json({
        error: error.message
      });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      const result = await AuthService.forgotPassword(email);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      
      const result = await AuthService.resetPassword(token, password);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  static async me(req, res) {
    try {
      const user = req.user;
      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          nombres: user.nombres,
          apellidos: user.apellidos,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error al obtener información del usuario'
      });
    }
  }
}

