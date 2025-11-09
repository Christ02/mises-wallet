import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiPencil,
  HiQuestionMarkCircle,
  HiX,
  HiCheckCircle,
  HiExclamationCircle
} from 'react-icons/hi';

interface FormState {
  nombres: string;
  apellidos: string;
  email: string;
  carnet: string;
}

export default function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    nombres: '',
    apellidos: '',
    email: '',
    carnet: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setForm({
          nombres: parsed.nombres || '',
          apellidos: parsed.apellidos || '',
          email: parsed.email || '',
          carnet: parsed.carnet_universitario || ''
        });
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        const updatedUser = {
          ...parsed,
          nombres: form.nombres,
          apellidos: form.apellidos,
          email: form.email,
          carnet_universitario: form.carnet
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      setSuccess('Perfil actualizado exitosamente.');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('No se pudo actualizar el perfil. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="mt-5">
        <button
          onClick={() => navigate('/profile')}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors bg-dark-card border border-dark-border px-3 py-2 rounded-lg"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Volver al perfil</span>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <HiPencil className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Editar perfil</h2>
            <p className="text-sm sm:text-base text-gray-400">Actualiza tus datos personales</p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
        >
          <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="bg-positive/10 border border-positive/40 text-positive px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
              <HiCheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-negative/10 border border-negative/40 text-negative px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
              <HiExclamationCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombres</label>
              <input
                type="text"
                value={form.nombres}
                onChange={handleChange('nombres')}
                required
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Apellidos</label>
              <input
                type="text"
                value={form.apellidos}
                onChange={handleChange('apellidos')}
                required
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Correo electrónico</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              required
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">
              Usaremos este correo para enviarte notificaciones importantes.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Carnet universitario</label>
            <input
              type="text"
              value={form.carnet}
              onChange={handleChange('carnet')}
              required
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-red hover:bg-primary-red/90 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {showHelp && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Ayuda</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all"
                >
                  <HiX className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="space-y-4 text-sm sm:text-base text-gray-300">
                <p>Actualiza tu información personal. Estos datos se usan en tu cuenta y en las comunicaciones.</p>
                <p>Los cambios se guardan localmente de forma temporal mientras conectamos con el backend.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


