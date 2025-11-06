import { useState, useEffect } from 'react';
import { HiUser, HiMail, HiIdentification, HiShieldCheck, HiArrowRight } from 'react-icons/hi';
import Layout from '../components/layout/Layout';

interface User {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  carnet_universitario: string;
  role: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    setLoading(false);
  }, []);

  const getRoleDisplay = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-400">Error al cargar información del usuario</p>
        </div>
      </Layout>
    );
  }

  const initials = `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Mi Perfil</h1>
          <p className="text-sm sm:text-base text-gray-400">Información de tu cuenta</p>
        </div>

        {/* Profile Card */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg">
              {initials}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {user.nombres} {user.apellidos}
              </h2>
              <p className="text-sm text-gray-400 mb-2">{getRoleDisplay(user.role)}</p>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-gray-500">
                <HiShieldCheck className="w-4 h-4" />
                <span>Cuenta verificada</span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-dark-bg rounded-lg border border-dark-border">
              <div className="w-10 h-10 bg-primary-red/10 rounded-lg flex items-center justify-center">
                <HiMail className="w-5 h-5 text-primary-red" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Correo Electrónico</p>
                <p className="text-sm font-medium text-white">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-dark-bg rounded-lg border border-dark-border">
              <div className="w-10 h-10 bg-primary-red/10 rounded-lg flex items-center justify-center">
                <HiIdentification className="w-5 h-5 text-primary-red" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Carnet Universitario</p>
                <p className="text-sm font-medium text-white">{user.carnet_universitario}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-dark-bg rounded-lg border border-dark-border">
              <div className="w-10 h-10 bg-primary-red/10 rounded-lg flex items-center justify-center">
                <HiUser className="w-5 h-5 text-primary-red" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Nombre Completo</p>
                <p className="text-sm font-medium text-white">
                  {user.nombres} {user.apellidos}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-dark-bg rounded-lg border border-dark-border">
              <div className="w-10 h-10 bg-primary-red/10 rounded-lg flex items-center justify-center">
                <HiShieldCheck className="w-5 h-5 text-primary-red" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Rol</p>
                <p className="text-sm font-medium text-white">{getRoleDisplay(user.role)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Acciones de Cuenta</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 bg-dark-bg border border-dark-border rounded-lg hover:border-primary-red/30 transition-colors">
              <span className="text-sm font-medium text-white">Cambiar Contraseña</span>
              <HiArrowRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-dark-bg border border-dark-border rounded-lg hover:border-primary-red/30 transition-colors">
              <span className="text-sm font-medium text-white">Editar Perfil</span>
              <HiArrowRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

