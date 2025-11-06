import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiShoppingCart, HiQrcode, HiExclamationCircle } from 'react-icons/hi';
import Layout from '../components/layout/Layout';

export default function Pay() {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = () => {
    // TODO: Implementar escaneo de QR
    alert('Funcionalidad de escaneo de QR próximamente');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implementar lógica de pago
    setTimeout(() => {
      setLoading(false);
      navigate('/transactions');
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Pagar</h1>
            <p className="text-sm sm:text-base text-gray-400">Realiza pagos con tu wallet</p>
          </div>
        </div>

        {/* QR Scanner */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-64 h-64 sm:w-80 sm:h-80 bg-dark-bg border border-dark-border rounded-xl mb-4 flex items-center justify-center">
              <HiQrcode className="w-32 h-32 text-gray-600" />
            </div>
            <button
              onClick={handleScan}
              className="px-6 py-3 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg font-semibold transition-all flex items-center space-x-2"
            >
              <HiQrcode className="w-5 h-5" />
              <span>Escanear Código QR</span>
            </button>
          </div>
        </div>

        {/* Manual Payment Form */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white mb-4">Pago Manual</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Merchant/Address Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dirección del Comercio o QR Code
              </label>
              <input
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Escanea o ingresa código QR"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all font-mono text-sm"
              />
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
              disabled={loading || !amount || !qrCode}
              className="w-full bg-primary-red hover:bg-primary-red/90 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Procesando pago...</span>
                </>
              ) : (
                <>
                  <HiShoppingCart className="w-5 h-5" />
                  <span>Pagar</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="bg-dark-card/50 border border-dark-border rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <HiShoppingCart className="w-5 h-5 text-primary-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white mb-1">Pagos Seguros</p>
              <p className="text-xs text-gray-400">
                Verifica siempre el código QR antes de realizar un pago. 
                Los pagos son procesados en la red Sepolia Testnet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

