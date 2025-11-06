import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowUp, HiExclamationCircle, HiQrcode } from 'react-icons/hi';
import Layout from '../components/layout/Layout';
import api from '../services/api';

export default function Send() {
  const navigate = useNavigate();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/wallet/send', {
        to: toAddress,
        amount: parseFloat(amount)
      });
      navigate('/transactions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar fondos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-dark-card rounded-lg transition-colors"
          >
            <HiArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Enviar ETH</h1>
            <p className="text-sm sm:text-base text-gray-400">Envía ETH a otra dirección</p>
          </div>
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Dirección de Destino
                </label>
                <button
                  type="button"
                  className="text-xs text-primary-red hover:text-primary-red/80 transition-colors flex items-center space-x-1"
                >
                  <HiQrcode className="w-4 h-4" />
                  <span>Escanear QR</span>
                </button>
              </div>
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x..."
                required
                pattern="^0x[a-fA-F0-9]{40}$"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Ingresa una dirección Ethereum válida (0x...)
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
              disabled={loading || !amount || !toAddress}
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
      </div>
    </Layout>
  );
}

