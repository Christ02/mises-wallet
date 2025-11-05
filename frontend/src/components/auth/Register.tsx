import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../services/api';
import logo from '../../assets/images/mises-wallet.svg';

interface RegisterForm {
  nombres: string;
  apellidos: string;
  carnet_universitario: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterForm>({
    nombres: '',
    apellidos: '',
    carnet_universitario: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Función para limpiar error de un campo específico
  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    // Normalizar datos (trim)
    const normalizedPassword = formData.password.trim();
    const normalizedConfirmPassword = formData.confirmPassword.trim();

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son obligatorios';
    }
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }
    if (!formData.carnet_universitario.trim()) {
      newErrors.carnet_universitario = 'El carnet universitario es obligatorio';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!formData.email.endsWith('@ufm.edu')) {
      newErrors.email = 'El email debe ser del dominio @ufm.edu';
    }
    if (normalizedPassword.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (normalizedPassword !== normalizedConfirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/register', {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        carnet_universitario: formData.carnet_universitario.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        confirmPassword: formData.confirmPassword.trim(),
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const validationErrors: Record<string, string> = {};
        err.response.data.errors.forEach((error: any) => {
          validationErrors[error.path] = error.msg;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ general: err.response?.data?.error || 'Error al registrar usuario' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 sm:p-6 lg:p-8 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src={logo} 
              alt="Mises Wallet" 
              className="h-12 sm:h-16 w-auto"
            />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Mises Wallet</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-400">Crea tu cuenta</p>
        </div>

        <div className="bg-dark-card rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-dark-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            <div>
              <label htmlFor="nombres" className="block text-sm font-medium text-gray-300 mb-2">
                Nombres *
              </label>
              <input
                id="nombres"
                name="nombres"
                type="text"
                required
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                value={formData.nombres}
                onChange={(e) => {
                  setFormData({ ...formData, nombres: e.target.value });
                  clearFieldError('nombres');
                }}
              />
              {errors.nombres && (
                <p className="mt-1 text-sm text-red-400">{errors.nombres}</p>
              )}
            </div>

            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-gray-300 mb-2">
                Apellidos *
              </label>
              <input
                id="apellidos"
                name="apellidos"
                type="text"
                required
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                value={formData.apellidos}
                onChange={(e) => {
                  setFormData({ ...formData, apellidos: e.target.value });
                  clearFieldError('apellidos');
                }}
              />
              {errors.apellidos && (
                <p className="mt-1 text-sm text-red-400">{errors.apellidos}</p>
              )}
            </div>

            <div>
              <label htmlFor="carnet_universitario" className="block text-sm font-medium text-gray-300 mb-2">
                Carnet Universitario *
              </label>
              <input
                id="carnet_universitario"
                name="carnet_universitario"
                type="text"
                required
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                value={formData.carnet_universitario}
                onChange={(e) => {
                  setFormData({ ...formData, carnet_universitario: e.target.value });
                  clearFieldError('carnet_universitario');
                }}
              />
              {errors.carnet_universitario && (
                <p className="mt-1 text-sm text-red-400">{errors.carnet_universitario}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email (@ufm.edu) *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                placeholder="usuario@ufm.edu"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  clearFieldError('email');
                }}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña (mínimo 8 caracteres) *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 pr-12 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    clearFieldError('password');
                    clearFieldError('confirmPassword');
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 pr-12 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    clearFieldError('confirmPassword');
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 focus:ring-offset-dark-bg"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>

            <div className="text-center text-sm text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-primary-blue hover:text-primary-blue/80 font-medium transition-colors"
              >
                Inicia sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
