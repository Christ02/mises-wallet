import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowDown, HiCreditCard } from 'react-icons/hi';
import Layout from '../components/layout/Layout';

export default function Recharge() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = ['0.01', '0.05', '0.1', '0.5', '1.0', '5.0'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implementar lógica de recarga
    setTimeout(() => {
      setLoading(false);
      navigate('/wallet');
    }, 2000);
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Recargar Wallet</h1>
            <p className="text-sm sm:text-base text-gray-400">Agrega fondos a tu wallet</p>
          </div>
        </div>

        {/* Recharge Form */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad a Recargar (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0"
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

            {/* Quick Amounts */}
            <div>
              <p className="text-sm text-gray-400 mb-3">Cantidades rápidas:</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount)}
                    className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-gray-300 hover:border-primary-red/50 hover:text-white transition-colors"
                  >
                    {quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Método de Pago
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  className="w-full flex items-center space-x-3 p-4 bg-dark-bg border border-dark-border rounded-lg hover:border-primary-red/50 transition-colors"
                >
                  <HiCreditCard className="w-5 h-5 text-primary-red" />
                  <span className="text-sm font-medium text-white">Tarjeta de Crédito/Débito</span>
                </button>
                <button
                  type="button"
                  className="w-full flex items-center space-x-3 p-4 bg-dark-bg border border-dark-border rounded-lg hover:border-primary-red/50 transition-colors"
                >
                  <HiArrowDown className="w-5 h-5 text-primary-red" />
                  <span className="text-sm font-medium text-white">Transferencia Bancaria</span>
                </button>
              </div>
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
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <HiArrowDown className="w-5 h-5" />
                  <span>Recargar</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="bg-dark-card/50 border border-dark-border rounded-xl p-4">
          <p className="text-xs text-gray-400 text-center">
            La recarga se procesará en la red Sepolia Testnet. Los fondos son de prueba únicamente.
          </p>
        </div>
      </div>
    </Layout>
  );
}

