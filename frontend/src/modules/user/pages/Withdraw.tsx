import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiArrowUp,
  HiCreditCard,
  HiQuestionMarkCircle,
  HiX,
  HiExclamationCircle
} from 'react-icons/hi';
import api from '../../../services/api';

interface WalletBalance {
  balance: string;
  currency: string;
}

export default function Withdraw() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      setBalanceLoading(true);
      try {
        const response = await api.get('/api/wallet/balance');
        setBalance(response.data);
      } catch (err) {
        console.error('Error fetching balance:', err);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, []);

  const formattedBalance = useMemo(() => {
    if (!balance) return '0.00';
    const value = parseFloat(balance.balance);
    return value.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, [balance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/wallet/withdraw', {
        amount: parseFloat(amount)
      });
      navigate('/transactions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al retirar fondos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="mt-5">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors bg-dark-card border border-dark-border px-3 py-2 rounded-lg"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <HiArrowUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Retirar fondos</h2>
            <p className="text-sm sm:text-base text-gray-400">
              Lleva tus fondos de la wallet a tu cuenta bancaria
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
        >
          <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Balance + Withdraw Form */}
      <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-primary-red/15 border border-primary-red/30 flex items-center justify-center">
              <HiCreditCard className="w-6 h-6 text-primary-red" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Balance disponible</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {balanceLoading ? '— — —' : `${formattedBalance} ${balance?.currency || 'UFM'}`}
              </p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Los retiros se liquidan en menos de 24 horas hábiles.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
              <HiExclamationCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cantidad a retirar</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all text-lg"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                {balance?.currency || 'UFM'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Máximo disponible: {balanceLoading ? '— — —' : `${formattedBalance} ${balance?.currency || 'UFM'}`}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full bg-primary-red hover:bg-primary-red/90 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Procesando retiro...</span>
              </>
            ) : (
              <>
                <HiArrowUp className="w-5 h-5" />
                <span>Retirar ahora</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="bg-dark-card/60 border border-dark-border rounded-xl p-4 sm:p-5">
        <div className="flex items-start space-x-3">
          <HiExclamationCircle className="w-5 h-5 text-accent-yellow flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white mb-1">Recuerda</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Los retiros se procesan en la red Sepolia Testnet y son solo para fines de demostración. Los
              fondos pueden tardar algunos minutos en reflejarse.
            </p>
          </div>
        </div>
      </div>

      {/* Help Modal */}
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
                <p>
                  Ingresa la cantidad que deseas retirar. El sistema validará que tengas fondos suficientes
                  antes de procesar la solicitud.
                </p>
                <p>
                  Los retiros se acreditan a la cuenta bancaria registrada para tu carnet universitario. Si
                  necesitas actualizarla, comunícate con soporte.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

