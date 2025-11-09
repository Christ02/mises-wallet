import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowUp, HiExclamationCircle, HiQrcode, HiQuestionMarkCircle, HiX } from 'react-icons/hi';
import api from '../../../services/api';

export default function Send() {
  const navigate = useNavigate();
  const [carnet, setCarnet] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/wallet/send', {
        carnet,
        amount: parseFloat(amount)
      });
      navigate('/transactions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar fondos');
    } finally {
      setLoading(false);
    }
  };

  const carnetPlaceholder = 'SUPER001';

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
            <HiArrowUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Enviar ETH</h2>
            <p className="text-sm sm:text-base text-gray-400">Envía ETH a otra dirección</p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
        >
          <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        </div>

        {/* Send Form */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                <HiExclamationCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Address Input */}
            <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Carnet universitario del destinatario
                </label>
              <input
                type="text"
            value={carnet}
            onChange={(e) => setCarnet(e.target.value)}
            placeholder="Ingresa el carnet (ej. SUPER001)"
                required
            className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
            El sistema localizará automáticamente la wallet asociada a este carnet.
              </p>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all text-lg"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ETH
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !amount || !carnet}
              className="w-full bg-primary-red hover:bg-primary-red/90 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <HiArrowUp className="w-5 h-5" />
                  <span>Enviar</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Warning */}
        <div className="bg-accent-yellow/10 border border-accent-yellow/50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <HiExclamationCircle className="w-5 h-5 text-accent-yellow flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-accent-yellow mb-1">Advertencia</p>
              <p className="text-xs text-gray-300">
                Las transacciones en blockchain son irreversibles. Verifica cuidadosamente la dirección de destino antes de confirmar.
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
                <p>Introduce la dirección destino o escanea un QR compatible.</p>
                <p>Revisa la cantidad y confirma; las transacciones en blockchain no se pueden revertir.</p>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
  );
}

