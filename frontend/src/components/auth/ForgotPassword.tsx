import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      setMessage(response.data.message);
      
      if (response.data.resetToken) {
        console.log('Token de reset (solo desarrollo):', response.data.resetToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al solicitar recuperación de contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Branding Diamonds */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-2 h-2 bg-accent-red rounded-sm"></div>
          <div className="w-2 h-2 bg-accent-yellow rounded-sm"></div>
          <div className="w-2 h-2 bg-accent-blue rounded-sm"></div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Recuperar Contraseña</h1>
          <p className="text-sm sm:text-base text-gray-300">Ingresa tu email para recuperar tu cuenta</p>
        </div>

        <div className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {message && (
              <div className="bg-positive/10 border border-positive/50 text-positive px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all"
                placeholder="Email @ufm.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-red hover:bg-primary-red/90 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 focus:ring-offset-dark-bg"
            >
              {loading ? 'Enviando...' : 'Enviar Instrucciones'}
            </button>
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-primary-red hover:text-primary-red/80 transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
