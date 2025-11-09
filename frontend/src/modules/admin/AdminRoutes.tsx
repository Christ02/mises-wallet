import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import EventManagement from './pages/EventManagement';
import EventBusinesses from './pages/EventBusinesses';
import TransactionManagement from './pages/TransactionManagement';

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/events" element={<EventManagement />} />
        <Route path="/events/:eventId" element={<EventBusinesses />} />
        <Route path="/transactions" element={<TransactionManagement />} />
        
        {/* Redirect por defecto */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}

