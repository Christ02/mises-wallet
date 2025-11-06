import { ReactNode, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 w-full lg:ml-64 transition-all duration-300">
        <AdminNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="mt-16 sm:mt-20 lg:mt-20 px-8 sm:px-10 md:px-12 lg:px-16 xl:px-20 pt-4 sm:pt-6 lg:pt-8 pb-8 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

