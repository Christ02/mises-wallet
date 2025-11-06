import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiCog, 
  HiBell, 
  HiLockClosed, 
  HiShieldCheck,
  HiMoon,
  HiGlobe,
  HiLogout
} from 'react-icons/hi';
import Layout from '../components/layout/Layout';

export default function Settings() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Configuración</h1>
          <p className="text-sm sm:text-base text-gray-400">Gestiona tus preferencias</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Notifications */}
          <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <HiBell className="w-5 h-5 text-primary-red" />
              <h2 className="text-lg font-semibold text-white">Notificaciones</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Notificaciones Push</p>
                <p className="text-xs text-gray-400">Recibe alertas sobre transacciones</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-bg border border-dark-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-red rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-red"></div>
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <HiShieldCheck className="w-5 h-5 text-primary-red" />
              <h2 className="text-lg font-semibold text-white">Seguridad</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-dark-bg border border-dark-border rounded-lg hover:border-primary-red/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <HiLockClosed className="w-5 h-5 text-primary-red" />
                  <span className="text-sm font-medium text-white">Cambiar Contraseña</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-dark-bg border border-dark-border rounded-lg hover:border-primary-red/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <HiShieldCheck className="w-5 h-5 text-primary-red" />
                  <span className="text-sm font-medium text-white">Autenticación de Dos Factores</span>
                </div>
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <HiCog className="w-5 h-5 text-primary-red" />
              <h2 className="text-lg font-semibold text-white">Preferencias</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <HiMoon className="w-5 h-5 text-primary-red" />
                  <div>
                    <p className="text-sm font-medium text-white">Modo Oscuro</p>
                    <p className="text-xs text-gray-400">Tema oscuro activado</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only peer"
                    disabled
                  />
                  <div className="w-11 h-6 bg-primary-red rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <button className="w-full flex items-center justify-between p-3 bg-dark-bg border border-dark-border rounded-lg hover:border-primary-red/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <HiGlobe className="w-5 h-5 text-primary-red" />
                  <span className="text-sm font-medium text-white">Idioma</span>
                </div>
                <span className="text-sm text-gray-400">Español</span>
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 p-3 bg-negative/10 border border-negative/50 rounded-lg hover:bg-negative/20 transition-colors text-negative font-medium"
            >
              <HiLogout className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

