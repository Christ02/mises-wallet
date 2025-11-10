import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiArrowDown,
  HiDuplicate,
  HiCheckCircle,
  HiQrcode,
  HiQuestionMarkCircle,
  HiX,
  HiExclamationCircle
} from 'react-icons/hi';

export default function Receive() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [carnet, setCarnet] = useState<string>('');

  const carnetLabel = carnet || 'Carnet no disponible';

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed?.carnet_universitario) {
          setCarnet(parsed.carnet_universitario);
        }
      } catch (err) {
        console.error('Error parsing stored user:', err);
      }
    }
  }, []);

  const handleShare = async () => {
    if (!carnet) {
      setError('No se pudo obtener tu carnet. Por favor, intenta iniciar sesión nuevamente.');
      return;
    }
    try {
      setLoading(true);
      setSuccess('');
      setError('');
      await navigator.clipboard.writeText(carnet);
      setSuccess('Carnet copiado al portapapeles.');
    } catch (err) {
      console.error('Error copying carnet:', err);
      setError('No se pudo copiar el carnet. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="mt-5">
          <button
          onClick={() => navigate('/wallet')}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors bg-dark-card border border-dark-border px-3 py-2 rounded-lg"
          >
          <HiArrowLeft className="w-4 h-4" />
          <span>Volver a la wallet</span>
          </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <HiQrcode className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Recibir HayekCoin</h2>
            <p className="text-sm sm:text-base text-gray-400">Comparte tu carnet universitario para recibir HC</p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
        >
          <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        </div>

        {/* Carnet Section */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Tu carnet universitario</h2>
              <p className="text-sm text-gray-400 mt-1">
                Comparte este carnet para que otras personas puedan enviarte HayekCoin.
              </p>
            </div>
          </div>
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
          <div className="bg-dark-bg rounded-lg p-4 border border-dark-border flex items-center justify-between">
            <p className="text-lg sm:text-xl font-semibold text-white">{carnetLabel}</p>
            <div className="flex items-center space-x-3">
            <button
                onClick={handleShare}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-dark-card border border-dark-border rounded-lg hover:bg-dark-bg/80 transition-colors disabled:opacity-50"
            >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-red"></div>
              ) : (
                  <HiDuplicate className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-400">Copiar carnet</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-2 px-3 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-red/90 transition-colors"
              >
                <HiArrowDown className="w-4 h-4" />
                <span className="text-sm font-medium">Compartir QR</span>
            </button>
          </div>
          </div>
        </div>

        <div className="bg-dark-card/50 border border-dark-border rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <HiArrowDown className="w-5 h-5 text-primary-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white mb-1">Información</p>
              <p className="text-xs text-gray-400 mt-3">
                Comparte esta información para recibir HayekCoin en tu wallet
              </p>
            </div>
          </div>
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
                <p>Escanea el código QR o copia tu carnet para recibir HayekCoin en tu wallet.</p>
                <p>Comparte la información únicamente en la red Sepolia Testnet para evitar pérdidas.</p>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
  );
}

