import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNavbar from './BottomNavbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 w-full lg:ml-64 transition-all duration-300">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="mt-16 sm:mt-20 lg:mt-20 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-16 sm:pb-20 lg:pb-8 h-[calc(100vh-4rem-4rem)] sm:h-[calc(100vh-5rem-5rem)] lg:h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <BottomNavbar />
      </div>
    </div>
  );
}
