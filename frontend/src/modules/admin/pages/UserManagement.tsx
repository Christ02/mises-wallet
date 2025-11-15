import { useEffect, useMemo, useState } from 'react';
import {
  HiSearch,
  HiPlus,
  HiPencil,
  HiTrash,
  HiEye,
  HiBan,
  HiCheckCircle,
  HiUserGroup,
  HiShieldCheck,
  HiX,
  HiChevronDown,
  HiFilter
} from 'react-icons/hi';
import api from '../../../services/api';

interface AdminUser {
  id: number;
  nombres: string;
  apellidos: string;
  carnet_universitario: string;
  email: string;
  role: string;
  status?: string | null;
  wallet_address?: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminRole {
  id: number;
  name: string;
  description?: string | null;
}

type ModalMode = 'create' | 'edit';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    carnet_universitario: '',
    email: '',
    role: 'usuario',
    status: 'activo',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const statusOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' }
  ];

  const renderStatusChip = (status: string | undefined | null) => {
    const normalized = (status || 'activo').toLowerCase();
    const base =
      'inline-flex px-3 py-1 rounded-lg text-xs font-semibold border transition-colors';

    switch (normalized) {
      case 'activo':
        return (
          <span className={`${base} bg-positive/10 text-positive border-positive/30`}>
            Activo
          </span>
        );
      case 'inactivo':
        return (
          <span className={`${base} bg-negative/10 text-negative border-negative/30`}>
            Inactivo
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-600/10 text-gray-300 border-gray-500/30`}>
            {normalized}
          </span>
        );
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching users', err);
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/api/admin/users/roles');
      setRoles(response.data.data || []);
    } catch (err) {
      console.error('Error fetching roles', err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((user) => {
      const fullName = `${user.nombres} ${user.apellidos}`.toLowerCase();
      return (
        fullName.includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.carnet_universitario.toLowerCase().includes(term)
      );
    });
  }, [users, searchTerm]);

  const analytics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => (u.status ?? 'activo') === 'activo').length;
    const inactive = total - active;

    const now = new Date();
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const previousUsers = users.filter((user) => {
      const createdAt = new Date(user.created_at);
      return createdAt.getTime() <= endOfPreviousMonth.getTime();
    });

    const previousTotal = previousUsers.length;
    const previousActive = previousUsers.filter((u) => (u.status ?? 'activo') === 'activo').length;
    const previousInactive = previousTotal - previousActive;

    return {
      total,
      active,
      inactive,
      previous: {
        total: previousTotal,
        active: previousActive,
        inactive: previousInactive
      }
    };
  }, [users]);

  const getTrendInfo = (current: number, previous: number) => {
    if (current === previous) {
      return { message: '→ Se mantiene vs mes anterior', tone: 'neutral' as const };
    }
    if (previous === 0) {
      if (current === 0) {
        return { message: '→ Se mantiene vs mes anterior', tone: 'neutral' as const };
      }
      return { message: `▲ +${current} vs mes anterior`, tone: 'up' as const };
    }
    const diff = current - previous;
    if (diff > 0) {
      return { message: `▲ +${diff} vs mes anterior`, tone: 'up' as const };
    }
    return { message: `▼ -${Math.abs(diff)} vs mes anterior`, tone: 'down' as const };
  };

  const trendColors: Record<'up' | 'down' | 'neutral', string> = {
    up: 'text-positive',
    down: 'text-negative',
    neutral: 'text-gray-500'
  };

  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      carnet_universitario: '',
      email: '',
      role: roles[0]?.name ?? 'usuario',
      status: 'activo',
      password: ''
    });
    setFormErrors({});
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (user: AdminUser) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      nombres: user.nombres,
      apellidos: user.apellidos,
      carnet_universitario: user.carnet_universitario,
      email: user.email,
      role: user.role,
      status: user.status ?? 'activo',
      password: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openDetailModal = (user: AdminUser) => {
    setDetailUser(user);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailUser(null);
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const currentStatus = user.status ?? 'activo';
    const nextStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';

    const confirmMsg =
      nextStatus === 'inactivo'
        ? `¿Seguro que deseas marcar a ${user.nombres} ${user.apellidos} como inactivo? No podrá iniciar sesión.`
        : `¿Reactivar a ${user.nombres} ${user.apellidos}?`;

    const confirmed = window.confirm(confirmMsg);
    if (!confirmed) return;

    try {
      setStatusUpdatingId(user.id);
      const response = await api.put(`/api/admin/users/${user.id}`, { status: nextStatus });
      const updatedUser: AdminUser = response.data.user;
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      if (detailUser && detailUser.id === updatedUser.id) {
        setDetailUser(updatedUser);
      }
    } catch (err: any) {
      console.error('Error updating status', err);
      alert(err.response?.data?.error || 'No se pudo actualizar el estado del usuario');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    const confirmed = window.confirm(`¿Eliminar a ${user.nombres} ${user.apellidos}?`);
    if (!confirmed) return;

    try {
      setDeletingId(user.id);
      await api.delete(`/api/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err: any) {
      console.error('Error deleting user', err);
      alert(err.response?.data?.error || 'No se pudo eliminar el usuario');
    } finally {
      setDeletingId(null);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nombres.trim()) errors.nombres = 'Los nombres son obligatorios';
    if (!formData.apellidos.trim()) errors.apellidos = 'Los apellidos son obligatorios';
    if (!formData.carnet_universitario.trim()) errors.carnet_universitario = 'El carnet es obligatorio';
    if (!formData.email.trim()) errors.email = 'El email es obligatorio';
    if (!formData.email.endsWith('@ufm.edu')) errors.email = 'Debe ser un email @ufm.edu';
    if (!statusOptions.some((option) => option.value === formData.status)) {
      errors.status = 'Selecciona un estado válido';
    }
    if (modalMode === 'create' && formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (modalMode === 'edit' && formData.password && formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (modalMode === 'create') {
        const response = await api.post('/api/admin/users', {
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          carnet_universitario: formData.carnet_universitario.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
          status: formData.status
        });
        setUsers((prev) => [response.data.user, ...prev]);
      } else if (selectedUser) {
        const payload: Record<string, any> = {
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          carnet_universitario: formData.carnet_universitario.trim(),
          email: formData.email.trim(),
          role: formData.role,
          status: formData.status
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        const response = await api.put(`/api/admin/users/${selectedUser.id}`, payload);
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? response.data.user : u))
        );
      }
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Error saving user', err);
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert('No se pudo guardar el usuario');
      }
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  };

  const totalTrend = useMemo(
    () => getTrendInfo(analytics.total, analytics.previous.total),
    [analytics]
  );
  const activeTrend = useMemo(
    () => getTrendInfo(analytics.active, analytics.previous.active),
    [analytics]
  );
  const inactiveTrend = useMemo(
    () => getTrendInfo(analytics.inactive, analytics.previous.inactive),
    [analytics]
  );

  return (
    <>
      <div className="space-y-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-red to-primary-red/80 border border-primary-red/40 text-white flex items-center justify-center shadow-lg flex-shrink-0">
                <HiUserGroup className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Gestión de Usuarios</h1>
                <p className="text-sm text-gray-400">
                  Administra los usuarios registrados, asigna roles y gestiona accesos.
                </p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all"
            >
              <HiPlus className="w-5 h-5" />
              Nuevo usuario
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Usuarios totales</p>
              <p className="text-3xl font-bold text-white mt-2">{analytics.total}</p>
              <p className={`text-xs mt-3 ${trendColors[totalTrend.tone]}`}>{totalTrend.message}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-red/20 border border-primary-red/30 flex items-center justify-center">
              <HiUserGroup className="w-6 h-6 text-primary-red" />
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Activos</p>
                <p className="text-2xl font-bold text-white mt-2">{analytics.active}</p>
                <p className={`text-xs mt-3 ${trendColors[activeTrend.tone]}`}>{activeTrend.message}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-positive/10 border border-positive/30 flex items-center justify-center">
                <HiShieldCheck className="w-6 h-6 text-positive" />
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Inactivos</p>
                <p className="text-2xl font-bold text-white mt-2">{analytics.inactive}</p>
                <p className={`text-xs mt-3 ${trendColors[inactiveTrend.tone]}`}>{inactiveTrend.message}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-negative/10 border border-negative/30 flex items-center justify-center">
                <HiBan className="w-6 h-6 text-negative" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark-card rounded-xl border border-dark-border p-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o carnet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
              />
            </div>
            <button
              onClick={() => setFilterOpen((prev) => !prev)}
              className="flex items-center justify-center w-12 h-12 bg-dark-bg border border-dark-border rounded-lg text-gray-300 hover:text-white hover:border-primary-red/50 transition-all"
              title="Mostrar filtros avanzados"
            >
              <HiFilter className="w-5 h-5" />
            </button>
          </div>

          {filterOpen && (
            <div className="mt-4 border-t border-dark-border pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-2">Rol</label>
                <div className="relative">
                  <select className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-3.5 pr-12 appearance-none text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50">
                    <option>Todos</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <HiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Estado</label>
                <div className="relative">
                  <select className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-3.5 pr-12 appearance-none text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50">
                    <option value="">Todos</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <HiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Desde</label>
                <input
                  type="date"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 appearance-none [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Hasta</label>
                <input
                  type="date"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 appearance-none [color-scheme:dark]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400 space-y-3">
              <div className="animate-spin h-10 w-10 border-2 border-primary-red border-t-transparent rounded-full" />
              <p className="text-sm">Cargando usuarios...</p>
            </div>
          ) : error ? (
            <div className="py-16 flex flex-col items-center justify-center text-negative space-y-3">
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 text-sm bg-primary-red/20 border border-primary-red/40 text-primary-red rounded-lg hover:bg-primary-red/30 transition-all"
              >
                Reintentar
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400 space-y-3">
              <p className="text-base font-semibold">Sin usuarios</p>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                No encontramos resultados con los filtros actuales. Intenta con otro término o crea un nuevo usuario.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-bg/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Carnet
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Creado
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
                      className="hover:bg-dark-bg/40 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-white font-semibold">{`${user.nombres} ${user.apellidos}`}</span>
                          <span className="text-xs text-gray-400">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.carnet_universitario}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusChip(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetailModal(user)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-dark-bg/60 rounded-lg transition-all"
                            title="Ver detalle"
                          >
                            <HiEye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="p-2 text-gray-400 hover:text-gray-100 hover:bg-dark-bg/60 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              (user.status ?? 'activo') === 'activo'
                                ? 'Marcar como inactivo'
                                : 'Marcar como activo'
                            }
                            disabled={statusUpdatingId === user.id}
                          >
                            {(user.status ?? 'activo') === 'activo' ? (
                              <HiBan className="w-5 h-5 text-negative" />
                            ) : (
                              <HiCheckCircle className="w-5 h-5 text-positive" />
                            )}
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-gray-400 hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all"
                            title="Editar"
                          >
                            <HiPencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-gray-400 hover:text-negative hover:bg-negative/10 rounded-lg transition-all disabled:opacity-50"
                            title="Eliminar"
                            disabled={deletingId === user.id}
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
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-2xl border border-dark-border w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {modalMode === 'create' ? 'Registrar nuevo usuario' : 'Editar usuario'}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Completa la información para {modalMode === 'create' ? 'crear' : 'actualizar'} el perfil.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombres</label>
                  <input
                    type="text"
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/40 focus:border-primary-red/40 transition-all"
                    placeholder="Isaac"
                  />
                  {formErrors.nombres && (
                    <p className="mt-1 text-xs text-negative">{formErrors.nombres}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Apellidos</label>
                  <input
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/40 focus:border-primary-red/40 transition-all"
                    placeholder="Juarez"
                  />
                  {formErrors.apellidos && (
                    <p className="mt-1 text-xs text-negative">{formErrors.apellidos}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Carnet universitario</label>
                  <input
                    type="text"
                    value={formData.carnet_universitario}
                    onChange={(e) => setFormData({ ...formData, carnet_universitario: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/40 focus:border-primary-red/40 transition-all"
                    placeholder="20220500"
                  />
                  {formErrors.carnet_universitario && (
                    <p className="mt-1 text-xs text-negative">{formErrors.carnet_universitario}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/40 focus:border-primary-red/40 transition-all"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/40 focus:border-primary-red/40 transition-all"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.status && (
                    <p className="mt-1 text-xs text-negative">{formErrors.status}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email institucional</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/40 focus:border-primary-red/40 transition-all"
                  placeholder="usuario@ufm.edu"
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-negative">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {modalMode === 'create' ? 'Contraseña temporal' : 'Nueva contraseña (opcional)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/40 focus:border-primary-red/40 transition-all"
                  placeholder={modalMode === 'create' ? 'Mínimo 8 caracteres' : 'Dejar vacío para no cambiar'}
                />
                {formErrors.password && (
                  <p className="mt-1 text-xs text-negative">{formErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 bg-dark-bg hover:bg-dark-border text-gray-300 hover:text-white font-medium rounded-lg transition-all"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : modalMode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && detailUser && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeDetailModal}
        >
          <div
            className="bg-dark-card rounded-2xl border border-dark-border w-full max-w-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <div>
                <h2 className="text-xl font-bold text-white">Detalle del usuario</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Información general y wallet asociada.
                </p>
              </div>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-dark-bg border border-dark-border rounded-xl p-5 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Nombre completo</p>
                  <p className="text-lg font-semibold text-white mt-1">
                    {detailUser.nombres} {detailUser.apellidos}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">Email</p>
                    <p className="text-sm text-gray-300 mt-1">{detailUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">Carnet</p>
                    <p className="text-sm text-gray-300 mt-1">{detailUser.carnet_universitario}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">Rol asignado</p>
                    <p className="inline-flex items-center px-3 py-1 rounded-lg bg-primary-red/10 border border-primary-red/20 text-primary-red text-xs font-semibold mt-1">
                      {detailUser.role}
                    </p>
                  </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Estado</p>
                  <div className="mt-1">{renderStatusChip(detailUser.status)}</div>
                </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">Fecha de registro</p>
                    <p className="text-sm text-gray-300 mt-1">{formatDate(detailUser.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-bg border border-dark-border rounded-xl p-5">
                <p className="text-xs uppercase tracking-wider text-gray-500">Wallet asociada</p>
                <p className="text-sm text-gray-300 mt-1 mb-3">
                  Dirección pública utilizada por el usuario dentro de la red.
                </p>
                {detailUser.wallet_address ? (
                  <div className="bg-dark-card border border-dark-border rounded-lg px-4 py-3 font-mono text-sm text-white break-all">
                    {detailUser.wallet_address}
                  </div>
                ) : (
                  <div className="bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-sm text-gray-400">
                    Este usuario todavía no tiene una wallet asociada.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

