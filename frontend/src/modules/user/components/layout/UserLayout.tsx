import { ReactNode, useState } from 'react';
import UserSidebar from './UserSidebar';
import UserNavbar from './UserNavbar';
import BottomNavbar from './BottomNavbar';

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 w-full lg:ml-64 transition-all duration-300">
        <UserNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="mt-16 sm:mt-20 lg:mt-20 px-8 sm:px-10 md:px-12 lg:px-16 xl:px-20 pt-4 sm:pt-6 lg:pt-8 pb-16 sm:pb-20 lg:pb-8 h-[calc(100vh-4rem-4rem)] sm:h-[calc(100vh-5rem-5rem)] lg:h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <BottomNavbar />
      </div>
    </div>
  );
}

