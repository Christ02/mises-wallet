import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import EventManagement from './pages/EventManagement';
import EventBusinesses from './pages/EventBusinesses';
import TransactionManagement from './pages/TransactionManagement';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';
import Reports from './pages/Reports';
import CentralWallet from './pages/CentralWallet';
import SettlementRequests from './pages/SettlementRequests';
import WithdrawalRequests from './pages/WithdrawalRequests';
import CentralWalletActivity from './pages/CentralWalletActivity';
import AdminProfile from './pages/AdminProfile';

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/events" element={<EventManagement />} />
        <Route path="/events/:eventId" element={<EventBusinesses />} />
        <Route path="/transactions" element={<TransactionManagement />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/audit" element={<AuditLogs />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/central-wallet" element={<CentralWallet />} />
        <Route path="/central-wallet/settlements" element={<SettlementRequests />} />
        <Route path="/central-wallet/withdrawals" element={<WithdrawalRequests />} />
        <Route path="/central-wallet/activity" element={<CentralWalletActivity />} />
        <Route path="/profile" element={<AdminProfile />} />
        
        {/* Redirect por defecto */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}

