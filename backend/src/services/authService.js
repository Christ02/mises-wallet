import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { UserRepository } from '../repositories/userRepository.js';
import crypto from 'crypto';
import EmailService from './emailService.js';

export class AuthService {
  static async register(userData) {
    const { email, password, nombres, apellidos, carnet_universitario } = userData;

    // Verificar si el email ya existe
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Verificar si el carnet ya existe
    const existingCarnet = await UserRepository.findByCarnet(carnet_universitario);
    if (existingCarnet) {
      throw new Error('El carnet universitario ya está registrado');
    }

    // Hashear contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const user = await UserRepository.create({
      nombres,
      apellidos,
      carnet_universitario,
      email,
      password_hash,
      role_id: 3, // Usuario por defecto
      status: 'activo'
    });

    // 🆕 CREAR WALLET AUTOMÁTICAMENTE (SILENCIOSO - El usuario no lo sabe)
    try {
      const { WalletService } = await import('./walletService.js');
      const walletData = WalletService.createWallet();
      const wallet = await WalletService.saveWallet(walletData, user.id);
      
      // Actualizar el usuario con wallet_id
      await UserRepository.updateWalletId(user.id, wallet.id);
      
      // Solo logueamos en el backend, el usuario NO lo ve
      console.log(`✅ Wallet creada automáticamente para usuario ${user.id} (Carnet: ${carnet_universitario})`);
    } catch (error) {
      // Si falla la creación de wallet, logueamos pero no falla el registro
      // El usuario puede seguir usando la app normalmente
      console.error(`⚠️ Error al crear wallet para usuario ${user.id}:`, error.message);
      // Podrías implementar un sistema de retry aquí si lo deseas
    }

    // Generar token JWT
    const token = this.generateToken(user.id, user.role_name || 'usuario');

    // Enviar correo de bienvenida
    try {
      const userName = `${user.nombres} ${user.apellidos}`;
      const welcomeHtml = EmailService.generateWelcomeEmail({
        userName,
        email: user.email,
        date: user.created_at || new Date()
      });

      await EmailService.sendEmail({
        to: user.email,
        subject: '¡Bienvenido/a a Mises Wallet!',
        html: welcomeHtml
      });
    } catch (emailError) {
      // No fallar el registro si el correo falla, solo loguear
      console.error('Error enviando correo de bienvenida:', emailError);
    }

    return {
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        carnet_universitario: user.carnet_universitario,
        role: user.role_name || 'usuario',
        status: user.status || 'activo'
      },
      token
    };
  }

  static async login(email, password) {
    // Buscar usuario
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (user.status && user.status !== 'activo') {
      throw new Error('El usuario está inactivo. Contacta al administrador.');
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token JWT
    const token = this.generateToken(user.id, user.role_name);

    return {
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        carnet_universitario: user.carnet_universitario,
        role: user.role_name,
        status: user.status
      },
      token
    };
  }

  static async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return { message: 'Si el email existe, recibirás un correo con instrucciones' };
    }

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    await UserRepository.updateResetToken(user.email, resetToken, resetExpires);

    // Enviar correo de recuperación de contraseña
    try {
      const userName = `${user.nombres} ${user.apellidos}`;
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5174';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
      
      const resetHtml = EmailService.generatePasswordResetEmail({
        userName,
        resetLink,
        expiresIn: '1 hora'
      });

      await EmailService.sendEmail({
        to: user.email,
        subject: 'Recuperación de Contraseña - Mises Wallet',
        html: resetHtml
      });
    } catch (emailError) {
      // No fallar si el correo falla, solo loguear
      console.error('Error enviando correo de recuperación de contraseña:', emailError);
      // En desarrollo, aún retornamos el token en la respuesta
      if (process.env.NODE_ENV === 'development') {
        return {
          message: 'Si el email existe, recibirás un correo con instrucciones',
          resetToken // Solo para desarrollo
        };
      }
    }

    return {
      message: 'Si el email existe, recibirás un correo con instrucciones'
    };
  }

  static async resetPassword(token, newPassword) {
    const user = await UserRepository.findByResetToken(token);
    if (!user) {
      throw new Error('Token inválido o expirado');
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await UserRepository.updatePassword(user.id, password_hash);

    return { message: 'Contraseña actualizada exitosamente' };
  }

  static generateToken(userId, role) {
    return jwt.sign(
      { 
        userId, 
        role 
      },
      config.jwt.secret,
      { 
        expiresIn: config.jwt.expiresIn 
      }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}

