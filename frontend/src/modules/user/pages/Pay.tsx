import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiShoppingCart, 
  HiQrcode, 
  HiExclamationCircle, 
  HiArrowRight,
  HiQuestionMarkCircle,
  HiX
} from 'react-icons/hi';
import api from '../services/api';

interface WalletBalance {
  balance: string;
  currency: string;
  network: string;
}

export default function Pay() {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const response = await api.get('/api/wallet/balance');
        setBalance(response.data);
      } catch (err: any) {
        console.error('Error loading balance:', err);
      } finally {
        setBalanceLoading(false);
      }
    };
    loadBalance();
  }, []);

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

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.00';
    if (num < 0.001) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculateUSD = (ethBalance: string) => {
    const eth = parseFloat(ethBalance);
    const ethPrice = 2000;
    return (eth * ethPrice).toFixed(2);
  };

  return (
    
      <div>
        {/* Header Section */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <HiShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Pagar</h2>
              <p className="text-sm sm:text-base text-gray-400">Realiza pagos con tu wallet</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
          >
            <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary-red/20 via-primary-red/10 to-primary-red/5 border border-primary-red/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 relative overflow-hidden mt-8 sm:mt-10 lg:mt-12">
          <div className="absolute inset-0 bg-primary-red/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">Saldo Disponible</h3>
                <p className="text-sm sm:text-base text-gray-300">Fondos para realizar pagos</p>
              </div>
              <HiShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-primary-red/80" />
            </div>
            {balanceLoading ? (
              <div className="h-12 sm:h-16 flex items-center mt-4">
                <div className="animate-pulse bg-dark-bg/50 h-8 sm:h-12 w-32 sm:w-48 rounded"></div>
              </div>
            ) : balance && (
              <div className="mt-4">
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    {formatBalance(balance.balance)}
                  </span>
                  <span className="text-lg sm:text-xl text-gray-300 font-semibold">
                    {balance.currency || 'UFM'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400">≈ ${calculateUSD(balance.balance)} USD</p>
              </div>
            )}
          </div>
        </div>

        {/* ESCANEAR QR Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 font-semibold">ESCANEAR QR</h3>
          <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md mb-6 sm:mb-8">
                <div className="w-full aspect-square bg-dark-bg border-2 border-dashed border-dark-border rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <HiQrcode className="w-32 h-32 sm:w-40 sm:h-40 text-gray-600" />
                  <div className="absolute inset-0 bg-primary-red/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-semibold text-sm sm:text-base">Tap para escanear</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleScan}
                className="w-full max-w-md px-6 py-4 sm:py-5 bg-primary-red hover:bg-primary-red/90 text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <HiQrcode className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Escanear Código QR</span>
              </button>
            </div>
          </div>
        </div>

        {/* PAGO MANUAL Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 font-semibold">PAGO MANUAL</h3>
          <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-8">
              {/* Merchant/Address Input */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2 sm:mb-3">
                  Número de carnet o Nombre de Comercio
                </label>
                <input
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Ingresa el número de carnet o nombre del comercio"
                  className="w-full px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 bg-dark-bg border border-dark-border rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all text-sm sm:text-base"
                />
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2 sm:mb-3">
                  Cantidad (UFM)
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
                    className="w-full px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 pr-16 sm:pr-20 bg-dark-bg border border-dark-border rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all text-lg sm:text-xl lg:text-2xl font-semibold"
                  />
                  <span className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base lg:text-lg font-medium">
                    UFM
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !amount || !qrCode}
                className="w-full bg-primary-red hover:bg-primary-red/90 text-white font-bold py-4 sm:py-5 lg:py-6 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg lg:text-xl shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                    <span>Procesando pago...</span>
                  </>
                ) : (
                  <>
                    <HiShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Pagar</span>
                    <HiArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mt-8 sm:mt-10 lg:mt-12">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <HiExclamationCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-2">Pagos Seguros</p>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Verifica siempre el código QR antes de realizar un pago. 
                Los pagos son procesados en la red y no pueden ser revertidos una vez confirmados.
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
                    Puedes realizar pagos escaneando un código QR o ingresando manualmente el número de carnet del destinatario o el nombre del comercio.
                  </p>
                  <p>
                    Verifica siempre la información antes de confirmar el pago. Los pagos no pueden ser revertidos una vez confirmados.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    
  );
}
