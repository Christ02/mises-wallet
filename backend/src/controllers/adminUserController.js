import { AdminUserService } from '../services/adminUserService.js';

export class AdminUserController {
  static async list(req, res) {
    try {
      const { search, limit, offset } = req.query;
      const parsedLimit = limit ? parseInt(limit, 10) : undefined;
      const parsedOffset = offset ? parseInt(offset, 10) : undefined;

      const result = await AdminUserService.listUsers({
        search,
        limit: parsedLimit,
        offset: parsedOffset
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Error al obtener usuarios',
        details: error.message
      });
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
      const user = await AdminUserService.updateUser(parseInt(id, 10), req.body);
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
      await AdminUserService.deleteUser(parseInt(id, 10), req.user.id);
      res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }
}


