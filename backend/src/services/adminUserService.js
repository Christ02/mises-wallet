import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepository.js';
import { RoleRepository } from '../repositories/roleRepository.js';

export class AdminUserService {
  static async listUsers({ search, limit = 50, offset = 0 } = {}) {
    const [users, total] = await Promise.all([
      UserRepository.findAll({ search, limit, offset }),
      UserRepository.countAll({ search })
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        carnet_universitario: user.carnet_universitario,
        email: user.email,
        role: user.role_name,
        status: user.status,
        wallet_address: user.wallet_address,
        created_at: user.created_at,
        updated_at: user.updated_at
      })),
      total
    };
  }

  static async getRoles() {
    return RoleRepository.findAll();
  }

  static async createUser({ nombres, apellidos, carnet_universitario, email, password, role, status }) {
    if (!password || password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    const normalizedStatus = status ? status.toLowerCase() : 'activo';
    if (!['activo', 'inactivo'].includes(normalizedStatus)) {
      throw new Error('Estado no válido');
    }

    const existingEmail = await UserRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error('El email ya está registrado');
    }

    const existingCarnet = await UserRepository.findByCarnet(carnet_universitario);
    if (existingCarnet) {
      throw new Error('El carnet universitario ya está registrado');
    }

    const roleRecord = await RoleRepository.findByName(role);
    if (!roleRecord) {
      throw new Error('Rol no válido');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await UserRepository.create({
      nombres,
      apellidos,
      carnet_universitario,
      email,
      password_hash,
      role_id: roleRecord.id,
      status: normalizedStatus
    });

    // Refrescar información con role_name
    const created = await UserRepository.findById(user.id);

    return {
      id: created.id,
      nombres: created.nombres,
      apellidos: created.apellidos,
      carnet_universitario: created.carnet_universitario,
      email: created.email,
      role: created.role_name,
      status: created.status,
      wallet_address: created.wallet_address,
      created_at: created.created_at,
      updated_at: created.updated_at
    };
  }

  static async updateUser(id, { nombres, apellidos, carnet_universitario, email, password, role, status }) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (email && email !== user.email) {
      const existingEmail = await UserRepository.findByEmail(email);
      if (existingEmail && existingEmail.id !== id) {
        throw new Error('El email ya está registrado');
      }
    }

    if (carnet_universitario && carnet_universitario !== user.carnet_universitario) {
      const existingCarnet = await UserRepository.findByCarnet(carnet_universitario);
      if (existingCarnet && existingCarnet.id !== id) {
        throw new Error('El carnet universitario ya está registrado');
      }
    }

    const updateData = {};

    if (nombres !== undefined) updateData.nombres = nombres;
    if (apellidos !== undefined) updateData.apellidos = apellidos;
    if (carnet_universitario !== undefined) updateData.carnet_universitario = carnet_universitario;
    if (email !== undefined) updateData.email = email;

    if (password) {
      if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    if (role) {
      const roleRecord = await RoleRepository.findByName(role);
      if (!roleRecord) {
        throw new Error('Rol no válido');
      }
      updateData.role_id = roleRecord.id;
    }

    if (status) {
      const normalizedStatus = status.toLowerCase();
      if (!['activo', 'inactivo'].includes(normalizedStatus)) {
        throw new Error('Estado no válido');
      }
      updateData.status = normalizedStatus;
    }

    await UserRepository.updateById(id, updateData);
    const updated = await UserRepository.findById(id);

    return {
      id: updated.id,
      nombres: updated.nombres,
      apellidos: updated.apellidos,
      carnet_universitario: updated.carnet_universitario,
      email: updated.email,
      role: updated.role_name,
      status: updated.status,
      wallet_address: updated.wallet_address,
      created_at: updated.created_at,
      updated_at: updated.updated_at
    };
  }

  static async deleteUser(id, requestingUserId) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.role_name === 'super_admin') {
      throw new Error('No se puede eliminar a un super administrador');
    }

    if (user.id === requestingUserId) {
      throw new Error('No puedes eliminar tu propio usuario');
    }

    await UserRepository.deleteById(id);
  }
}


