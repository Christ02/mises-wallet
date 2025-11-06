import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { 
  HiSearch,
  HiFilter,
  HiPlus,
  HiPencil,
  HiTrash,
  HiLockClosed,
  HiX
} from 'react-icons/hi';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: 'Activo' | 'Bloqueado' | 'Inactivo';
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: 1, nombre: 'Juan Pérez', email: 'juan.perez@ufm.edu', rol: 'Estudiante', estado: 'Activo' },
    { id: 2, nombre: 'María González', email: 'maria.gonzalez@ufm.edu', rol: 'Profesor', estado: 'Activo' },
    { id: 3, nombre: 'Carlos Rodríguez', email: 'carlos.rodriguez@ufm.edu', rol: 'Administrador', estado: 'Bloqueado' },
  ]);

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (estado: User['estado']) => {
    switch (estado) {
      case 'Activo':
        return 'bg-positive/10 text-positive border border-positive/20';
      case 'Bloqueado':
        return 'bg-negative/10 text-negative border border-negative/20';
      case 'Inactivo':
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Usuarios</h1>
        </div>

        {/* Search and Actions */}
        <div className="bg-dark-card rounded-xl border border-dark-border p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full lg:max-w-md">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
              />
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-bg hover:bg-dark-border text-gray-300 hover:text-white font-medium rounded-lg transition-all border border-dark-border flex-1 lg:flex-initial">
                <HiFilter className="w-5 h-5" />
                Filtrar
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all flex-1 lg:flex-initial">
                <HiPlus className="w-5 h-5" />
                Añadir Usuario
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-dark-bg/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">{user.nombre}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-400">{user.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">{user.rol}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(user.estado)}`}>
                        {user.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-400 hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all"
                          title="Editar"
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 rounded-lg transition-all"
                          title="Bloquear"
                        >
                          <HiLockClosed className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-negative hover:bg-negative/10 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-2xl border border-dark-border w-full max-w-lg shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h2 className="text-xl font-bold text-white">Editar Usuario</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedUser.nombre}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rol
                  </label>
                  <select
                    defaultValue={selectedUser.rol}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                  >
                    <option value="Estudiante">Estudiante</option>
                    <option value="Profesor">Profesor</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    defaultValue={selectedUser.estado}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nueva Contraseña (opcional)
                </label>
                <input
                  type="password"
                  placeholder="Dejar en blanco para no cambiar"
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-dark-border">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2.5 bg-dark-bg hover:bg-dark-border text-gray-300 hover:text-white font-medium rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

