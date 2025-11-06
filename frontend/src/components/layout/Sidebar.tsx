import { Link, useLocation } from 'react-router-dom';
import { HiX } from 'react-icons/hi';
import { 
  HiHome, 
  HiCreditCard, 
  HiRefresh,
  HiUser,
  HiCog,
  HiUsers,
  HiCalendar,
  HiChartBar
} from 'react-icons/hi';
import { useState, useEffect } from 'react';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[]; // roles permitidos para este ítem
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  role: string;
}

// Menú para usuarios normales
const userMenuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: HiHome },
  { name: 'Wallet', path: '/wallet', icon: HiCreditCard },
  { name: 'Transacciones', path: '/transactions', icon: HiRefresh },
  { name: 'Perfil', path: '/profile', icon: HiUser },
];

// Menú para super admin
const adminMenuItems: MenuItem[] = [
  { name: 'Inicio', path: '/admin/dashboard', icon: HiHome },
  { name: 'Gestión de Usuarios', path: '/admin/users', icon: HiUsers },
  { name: 'Gestión de Eventos', path: '/admin/events', icon: HiCalendar },
  { name: 'Transacciones Globales', path: '/admin/transactions', icon: HiChartBar },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(userMenuItems);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        
        // Establecer menú según rol
        if (userData.role === 'super_admin' || userData.role === 'admin') {
          setMenuItems(adminMenuItems);
        } else {
          setMenuItems(userMenuItems);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

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

        {/* Settings */}
        <div className="p-4 border-t border-dark-border">
          <Link
            to="/settings"
            onClick={onClose}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-dark-bg transition-all duration-200 border border-transparent group"
          >
            <HiCog className="w-5 h-5 text-gray-400 group-hover:text-white" />
            <span className="font-medium text-sm text-gray-400 group-hover:text-white">Configuración</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
