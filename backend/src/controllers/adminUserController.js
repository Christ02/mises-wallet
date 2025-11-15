import { AdminUserService } from '../services/adminUserService.js';
import { AuditService } from '../services/auditService.js';
import { UserRepository } from '../repositories/userRepository.js';

export class AdminUserController {
  static async list(req, res) {
    try {
      const { search, limit, offset } = req.query;
      const response = await AdminUserService.listUsers({
        search,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined
      });

      // No registrar log para listados automáticos (se registran demasiados logs innecesarios)

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message || 'Error al obtener usuarios' });
    }
  }

  static async search(req, res) {
    try {
      const { query, limit } = req.query;
      const users = await AdminUserService.searchUsers(query, limit ? parseInt(limit, 10) : undefined);

      // No registrar log para búsquedas automáticas (se registran demasiados logs innecesarios)

      res.status(200).json({ data: users });
    } catch (error) {
      res.status(500).json({ error: error.message || 'Error al buscar usuarios' });
    }
  }

  static async roles(_req, res) {
    try {
      const roles = await AdminUserService.getRoles();
      res.status(200).json({ data: roles });
    } catch (error) {
      res.status(500).json({
        error: 'Error al obtener roles',
        details: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const user = await AdminUserService.createUser(req.body);
      
      // Log de creación
      await AuditService.logCreate(
        req.user.id,
        'user',
        user.id,
        `Creó usuario: ${user.email} (${user.carnet_universitario})`,
        {
          email: user.email,
          carnet: user.carnet_universitario,
          role: user.role_name
        },
        req
      );

      res.status(201).json({ message: 'Usuario creado exitosamente', user });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);
      
      // Obtener valores anteriores para el log
      const oldUser = await UserRepository.findById(userId);
      const user = await AdminUserService.updateUser(userId, req.body);
      
      // Log de actualización
      await AuditService.logUpdate(
        req.user.id,
        'user',
        userId,
        `Actualizó usuario: ${user.email}`,
        {
          email: oldUser?.email,
          carnet: oldUser?.carnet_universitario,
          role: oldUser?.role_name,
          status: oldUser?.status
        },
        {
          email: user.email,
          carnet: user.carnet_universitario,
          role: user.role,
          status: user.status
        },
        req
      );

      res.status(200).json({ message: 'Usuario actualizado exitosamente', user });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);
      
      // Obtener información del usuario antes de eliminarlo
      const userToDelete = await UserRepository.findById(userId);
      
      await AdminUserService.deleteUser(userId, req.user.id);
      
      // Log de eliminación
      await AuditService.logDelete(
        req.user.id,
        'user',
        userId,
        `Eliminó usuario: ${userToDelete?.email || userId}`,
        {
          email: userToDelete?.email,
          carnet: userToDelete?.carnet_universitario,
          role: userToDelete?.role_name
        },
        req
      );

      res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }
}


