import { Link, useLocation } from 'react-router-dom';
import { HiHome, HiRefresh, HiShoppingCart, HiCalendar, HiUser } from 'react-icons/hi';

export default function BottomNavbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Inicio', path: '/dashboard', icon: HiHome },
    { name: 'Transacciones', path: '/transactions', icon: HiRefresh },
    { name: 'Pagar', path: '/wallet/pay', icon: HiShoppingCart },
    { name: 'Eventos', path: '/events', icon: HiCalendar },
    { name: 'Mi Perfil', path: '/profile', icon: HiUser },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border z-[100] lg:hidden shadow-2xl h-16 sm:h-20">
      <div className="flex items-center justify-around px-2 sm:px-4 py-2 sm:py-3 h-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/dashboard' && location.pathname === '/') ||
            (item.path === '/transactions' && (location.pathname === '/transactions' || location.pathname === '/wallet')) ||
            (item.path === '/events' && location.pathname === '/events') ||
            (item.path === '/profile' && location.pathname === '/profile');
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 px-1 py-1 rounded-lg transition-all min-w-0 flex-1 ${
                isActive
                  ? 'text-primary-red'
                  : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'text-primary-red' : 'text-gray-400'}`} />
              <span className={`text-[10px] sm:text-xs font-medium ${isActive ? 'text-primary-red' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

