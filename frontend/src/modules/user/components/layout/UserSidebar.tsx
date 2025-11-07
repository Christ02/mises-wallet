import { Link, useLocation } from 'react-router-dom';
import { HiX, HiHome, HiRefresh, HiCalendar, HiUser } from 'react-icons/hi';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: HiHome },
  { name: 'Transacciones', path: '/transactions', icon: HiRefresh },
  { name: 'Eventos', path: '/events', icon: HiCalendar },
  { name: 'Perfil', path: '/profile', icon: HiUser },
];

export default function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-dark-card border-r border-dark-border z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        {/* Logo y botón cerrar (móvil) */}
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-lg">
              <span className="text-white font-bold text-lg">ufm</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">UFM Wallet</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-red/10 text-primary-red border border-primary-red/20'
                    : 'text-gray-400 hover:text-white hover:bg-dark-bg border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-red' : 'text-gray-400 group-hover:text-white'}`} />
                <span className={`font-medium text-sm ${isActive ? 'text-primary-red' : 'text-gray-400 group-hover:text-white'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions - Acciones rápidas de wallet */}
        <div className="p-4 border-t border-dark-border space-y-2">
          <Link
            to="/wallet/recharge"
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-accent-blue/10 border border-accent-blue/20 rounded-lg text-accent-blue hover:bg-accent-blue/20 transition-all text-sm font-medium"
          >
            <span>💰 Recargar</span>
          </Link>
          <Link
            to="/wallet/send"
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-red/10 border border-primary-red/20 rounded-lg text-primary-red hover:bg-primary-red/20 transition-all text-sm font-medium"
          >
            <span>📤 Enviar</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

