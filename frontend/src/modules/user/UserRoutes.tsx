import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './components/layout/UserLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Events from './pages/Events';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Recharge from './pages/Recharge';
import Withdraw from './pages/Withdraw';
import Send from './pages/Send';
import Receive from './pages/Receive';
import Pay from './pages/Pay';
import Wallet from './pages/Wallet';

export default function UserRoutes() {
  return (
    <UserLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/events" element={<Events />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Wallet routes */}
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/wallet/recharge" element={<Recharge />} />
        <Route path="/wallet/withdraw" element={<Withdraw />} />
        <Route path="/wallet/send" element={<Send />} />
        <Route path="/wallet/receive" element={<Receive />} />
        <Route path="/wallet/pay" element={<Pay />} />
        
        {/* Redirect por defecto */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </UserLayout>
  );
}

