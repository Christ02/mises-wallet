import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Events from './pages/Events';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Recharge from './pages/Recharge';
import Withdraw from './pages/Withdraw';
import Send from './pages/Send';
import Receive from './pages/Receive';
import Pay from './pages/Pay';
import ProtectedRoute from './components/auth/ProtectedRoute';

function Home() {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Navigate to="/transactions" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet/recharge"
          element={
            <ProtectedRoute>
              <Recharge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet/withdraw"
          element={
            <ProtectedRoute>
              <Withdraw />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet/send"
          element={
            <ProtectedRoute>
              <Send />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet/receive"
          element={
            <ProtectedRoute>
              <Receive />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet/pay"
          element={
            <ProtectedRoute>
              <Pay />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

