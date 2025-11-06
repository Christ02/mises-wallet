import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoutes from './modules/admin/AdminRoutes';
import UserRoutes from './modules/user/UserRoutes';

function Home() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      // Redirigir según rol
      if (user.role === 'super_admin' || user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    } catch (error) {
      return <Navigate to="/login" replace />;
    }
  }
  
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Rutas del módulo Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
        
        {/* Rutas del módulo Usuario */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <UserRoutes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
