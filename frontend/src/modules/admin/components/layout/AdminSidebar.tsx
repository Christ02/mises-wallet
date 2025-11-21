import { Link, useLocation } from 'react-router-dom';
import {
  HiX,
  HiHome,
  HiUsers,
  HiCalendar,
  HiChartBar,
  HiCog,
  HiClipboardList,
  HiOutlineDocumentText,
  HiCurrencyDollar,
  HiUserCircle,
  HiBookOpen
} from 'react-icons/hi';
import misesLogo from '../../../../assets/images/mises-wallet.svg';
import { usePermissions } from '../../../../hooks/usePermissions';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: HiHome },
  { name: 'Gestión de Usuarios', path: '/admin/users', icon: HiUsers },
  { name: 'Gestión de Eventos', path: '/admin/events', icon: HiCalendar },
  { name: 'Transacciones Globales', path: '/admin/transactions', icon: HiChartBar },
  { name: 'Reportes', path: '/admin/reports', icon: HiOutlineDocumentText },
  { name: 'Wallet Central', path: '/admin/central-wallet', icon: HiCurrencyDollar },
  { name: 'API Docs', path: '/admin/api-docs', icon: HiBookOpen },
  { name: 'Auditoría', path: '/admin/audit', icon: HiClipboardList },
  { name: 'Mi perfil', path: '/admin/profile', icon: HiUserCircle },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const canViewSettings = hasPermission('settings.view');
  const canViewAudit = hasPermission('audit.view');

  // Filtrar items del menú según permisos
  const visibleMenuItems = menuItems.filter(item => {
    if (item.path === '/admin/audit' && !canViewAudit) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-dark-card border-r border-dark-border z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Logo y botón cerrar */}
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={misesLogo} alt="Mises Wallet" className="h-8 w-auto" />
            <span className="text-xl font-bold text-white tracking-tight">Mises Wallet</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar sidebar"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-red/10 text-primary-red border border-primary-red/20 shadow-lg shadow-primary-red/5'
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

        {/* Settings */}
        {canViewSettings && (
          <div className="p-4 border-t border-dark-border space-y-2">
            <Link
              to="/admin/settings"
              onClick={onClose}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 border ${
                location.pathname === '/admin/settings'
                  ? 'bg-primary-red/10 text-primary-red border-primary-red/20 shadow-lg shadow-primary-red/5'
                  : 'text-gray-400 hover:text-white hover:bg-dark-bg border-transparent'
              } group`}
            >
              <HiCog className={`w-5 h-5 ${location.pathname === '/admin/settings' ? 'text-primary-red' : 'text-gray-400 group-hover:text-white'}`} />
              <span className={`font-medium text-sm ${location.pathname === '/admin/settings' ? 'text-primary-red' : 'text-gray-400 group-hover:text-white'}`}>
                Configuración
              </span>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

