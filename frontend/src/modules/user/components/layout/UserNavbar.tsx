import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiChevronDown, HiLogout, HiUserCircle, HiBell, HiSearch, HiMenu } from 'react-icons/hi';

interface User {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  carnet_universitario: string;
  role: string;
}

interface UserNavbarProps {
  onMenuClick: () => void;
}

export default function UserNavbar({ onMenuClick }: UserNavbarProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const initials = `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();
  const fullName = `${user.nombres} ${user.apellidos}`;
  const roleDisplay = user.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <nav className="bg-dark-card border-b border-dark-border fixed top-0 right-0 left-0 lg:left-64 z-30 backdrop-blur-sm bg-dark-card/95 h-16 sm:h-20">
      <div className="px-8 sm:px-10 md:px-12 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 h-full">
        {/* Left Side - Branding */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="w-2 h-2 bg-accent-red rounded-sm"></div>
            <div className="w-2 h-2 bg-accent-yellow rounded-sm"></div>
            <div className="w-2 h-2 bg-accent-blue rounded-sm"></div>
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Mises Wallet</h1>
        </div>

        {/* Mobile Menu Button - Oculto en móvil porque usamos bottom nav */}
        <button
          onClick={onMenuClick}
          className="hidden lg:hidden text-gray-400 hover:text-white transition-colors p-2"
        >
          <HiMenu className="w-6 h-6" />
        </button>

        {/* Search Bar - Hidden on mobile, visible on tablet+ */}
        <div className="hidden md:flex flex-1 max-w-md mx-auto">
          <div className="relative w-full">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all"
          >
            <HiBell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-red rounded-full"></span>
          </Link>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-dark-bg transition-all focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:ring-offset-2 focus:ring-offset-dark-card"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white font-semibold text-[10px] sm:text-xs lg:text-sm shadow-lg">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs sm:text-sm font-medium text-white truncate max-w-[120px] sm:max-w-none">{fullName}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 truncate max-w-[120px] sm:max-w-none">{roleDisplay}</p>
              </div>
              <HiChevronDown className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-dark-card rounded-xl shadow-2xl border border-dark-border py-2 z-50 backdrop-blur-xl">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-dark-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{fullName}</p>
                      <p className="text-xs text-gray-400 truncate">{roleDisplay}</p>
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="px-4 py-3 space-y-3 border-b border-dark-border">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Correo electrónico</p>
                    <p className="text-sm text-white font-medium break-all">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Carnet universitario</p>
                    <p className="text-sm text-white font-medium">{user.carnet_universitario}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-2 py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-dark-bg transition-all group"
                  >
                    <HiUserCircle className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    <span className="text-sm font-medium">Ver perfil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-negative hover:bg-red-500/10 transition-all group"
                  >
                    <HiLogout className="w-5 h-5 text-negative group-hover:text-red-400" />
                    <span className="text-sm font-medium">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

