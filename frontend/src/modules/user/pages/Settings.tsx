import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiCog, 
  HiBell, 
  HiLockClosed, 
  HiShieldCheck,
  HiMoon,
  HiGlobe,
  HiLogout,
  HiArrowLeft,
  HiQuestionMarkCircle,
  HiX
} from 'react-icons/hi';

export default function Settings() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="mt-5">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors bg-dark-card border border-dark-border px-3 py-2 rounded-lg"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>
      </div>

        {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <HiCog className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Configuración</h2>
          <p className="text-sm sm:text-base text-gray-400">Gestiona tus preferencias</p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
        >
          <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
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

      {showHelp && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Ayuda</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all"
                >
                  <HiX className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="space-y-4 text-sm sm:text-base text-gray-300">
                <p>Activa o desactiva notificaciones, revisa opciones de seguridad y ajusta tus preferencias.</p>
                <p>La configuración de idioma y modo oscuro serán personalizables próximamente.</p>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
  );
}

