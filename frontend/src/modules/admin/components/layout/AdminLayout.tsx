import { ReactNode, useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Abrir por defecto en pantallas grandes
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      // Solo ajustar automáticamente si cambia de móvil a desktop o viceversa
      const isLargeScreen = window.innerWidth >= 1024;
      setSidebarOpen(isLargeScreen);
    };

    // Solo escuchar cambios significativos de tamaño
    let resizeTimer: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 150);
    });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`flex-1 w-full transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : ''}`}>
        <AdminNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <main className="mt-16 sm:mt-20 lg:mt-20 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-4 sm:pt-6 lg:pt-8 pb-8 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

