import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiMail, 
  HiIdentification, 
  HiShieldCheck, 
  HiArrowRight, 
  HiLockClosed, 
  HiPencil,
  HiCog,
  HiCreditCard,
  HiQuestionMarkCircle,
  HiX
} from 'react-icons/hi';
import { fetchUserProfile, UserProfile as UserProfileResponse } from '../services/profile';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchUserProfile();
        setProfile(data);
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.response?.data?.error || 'No se pudo cargar el perfil del usuario');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const getRoleDisplay = (role: string) => {
    if (!role) return 'Usuario';
    return role
      .split(/[_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusDisplay = (status?: string) => {
    if (!status) return 'No disponible';
    if (status === 'activo') return 'Cuenta activa';
    if (status === 'inactivo') return 'Cuenta inactiva';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusStyle = (status?: string) => {
    if (status === 'activo') return 'text-positive';
    if (status === 'inactivo') return 'text-negative';
    return 'text-gray-300';
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.00';
    if (num < 0.001) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red"></div>
        </div>
      
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const { user, wallet, rechargeSummary } = profile;

  const initials = `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();

  return (
    
      <div>
        {/* Header Section */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl lg:text-2xl shadow-lg flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                {user.nombres} {user.apellidos}
              </h2>
              <p className="text-sm sm:text-base text-gray-400">Cuenta y configuración</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
          >
            <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Wallet Info Card */}
        <div className="bg-gradient-to-br from-primary-red/20 via-primary-red/10 to-primary-red/5 border border-primary-red/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 relative overflow-hidden mt-8 sm:mt-10 lg:mt-12">
          <div className="absolute inset-0 bg-primary-red/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">Mi Wallet HayekCoin</h3>
                <p className="text-sm sm:text-base text-gray-300">Gestiona tus HayekCoin de forma segura</p>
              </div>
              <HiCreditCard className="w-12 h-12 sm:w-16 sm:h-16 text-primary-red/80" />
            </div>
            {wallet && (
              <div className="mt-4">
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    {formatBalance(wallet.balance)}
                  </span>
                  <span className="text-lg sm:text-xl text-gray-300 font-semibold">
                    {wallet.tokenSymbol || 'HC'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400">{wallet.network || 'Red Universitaria'}</p>
              </div>
            )}
            {rechargeSummary && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-dark-card/60 border border-dark-border/60 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Recargas acumuladas</p>
                  <p className="text-lg font-semibold text-white">
                    {rechargeSummary.totalTokens.toFixed(4)} {rechargeSummary.tokenSymbol}
                  </p>
                </div>
                <div className="bg-dark-card/60 border border-dark-border/60 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Equivalente en USD</p>
                  <p className="text-lg font-semibold text-white">${rechargeSummary.totalUsd.toFixed(2)} USD</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    1 USD = {rechargeSummary.usdToTokenRate.toFixed(2)} {rechargeSummary.tokenSymbol}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* OPERAR Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 font-semibold">OPERAR</h3>
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center justify-between p-4 sm:p-5 bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl hover:border-primary-red/50 transition-all group"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <HiCog className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="text-sm sm:text-base font-medium text-white">Configuración</span>
              </div>
              <HiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-red group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navigate('/profile/edit')}
              className="w-full flex items-center justify-between p-4 sm:p-5 bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl hover:border-primary-red/50 transition-all group"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <HiPencil className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="text-sm sm:text-base font-medium text-white">Editar perfil</span>
              </div>
              <HiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-red group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navigate('/profile/change-password')}
              className="w-full flex items-center justify-between p-4 sm:p-5 bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl hover:border-primary-red/50 transition-all group"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <HiLockClosed className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="text-sm sm:text-base font-medium text-white">Cambiar contraseña</span>
              </div>
              <HiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-red group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* INFORMACIÓN Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 font-semibold">INFORMACIÓN</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between p-4 sm:p-5 bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <HiMail className="w-5 h-5 sm:w-6 sm:h-6 text-primary-red flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Correo electrónico</p>
                  <p className="text-sm sm:text-base font-medium text-white truncate">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 sm:p-5 bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <HiIdentification className="w-5 h-5 sm:w-6 sm:h-6 text-primary-red flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Carnet universitario</p>
                  <p className="text-sm sm:text-base font-medium text-white">{user.carnet_universitario}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 sm:p-5 bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <HiShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary-red flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Rol</p>
                  <p className="text-sm sm:text-base font-medium text-white">{getRoleDisplay(user.role)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 sm:p-5 bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <HiShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-positive flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Estado de cuenta</p>
                  <p className={`text-sm sm:text-base font-medium ${getStatusStyle(user.status)}`}>
                    {getStatusDisplay(user.status)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Modal */}
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
                  <p>
                    En esta sección puedes gestionar tu perfil, verificar tu información de cuenta y acceder a las configuraciones de tu wallet.
                  </p>
                  <p>
                    Si tienes alguna pregunta sobre tu cuenta o necesitas asistencia, contacta al soporte de Mises Wallet.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    
  );
}

