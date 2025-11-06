import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiArrowUp, 
  HiArrowDown, 
  HiCreditCard,
  HiRefresh,
  HiDuplicate,
  HiCheckCircle,
  HiShoppingCart,
  HiQrcode
} from 'react-icons/hi';
import api from '../services/api';

interface WalletBalance {
  balance: string;
  currency: string;
  network: string;
}

export default function Wallet() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const response = await api.get('/api/wallet/balance');
        setBalance(response.data);
        // TODO: Obtener dirección de wallet cuando el backend lo permita
        // setAddress(response.data.address);
      } catch (err: any) {
        console.error('Error loading wallet:', err);
      } finally {
        setLoading(false);
      }
    };
    loadWallet();
  }, []);

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.00';
    if (num < 0.001) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Mi Wallet</h1>
          <p className="text-sm sm:text-base text-gray-400">Gestiona tu wallet de criptomonedas</p>
        </div>

        {/* Balance Card */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <p className="text-sm text-gray-400 mb-4">Balance Disponible</p>
          
          {loading ? (
            <div className="h-16 flex items-center">
              <div className="animate-pulse bg-dark-bg/50 h-12 w-48 rounded"></div>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {balance ? formatBalance(balance.balance) : '0.00'}
                </span>
                <span className="text-lg sm:text-xl font-semibold text-gray-400">
                  {balance?.currency || 'ETH'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {balance?.network || 'Sepolia Testnet'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/wallet/send')}
            className="bg-primary-red hover:bg-primary-red/90 text-white rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center space-y-2 transition-all shadow-lg"
          >
            <HiArrowUp className="w-6 h-6" />
            <span className="font-semibold text-sm sm:text-base">Enviar</span>
          </button>

          <button
            onClick={() => navigate('/wallet/receive')}
            className="bg-dark-card border border-dark-border hover:bg-dark-bg text-white rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center space-y-2 transition-all"
          >
            <HiArrowDown className="w-6 h-6 text-gray-400" />
            <span className="font-semibold text-sm sm:text-base text-gray-300">Recibir</span>
          </button>

          <button
            onClick={() => navigate('/wallet/pay')}
            className="bg-dark-card border border-dark-border hover:bg-dark-bg text-white rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center space-y-2 transition-all"
          >
            <HiShoppingCart className="w-6 h-6 text-gray-400" />
            <span className="font-semibold text-sm sm:text-base text-gray-300">Pagar</span>
          </button>

          <button
            onClick={() => navigate('/wallet/recharge')}
            className="bg-dark-card border border-dark-border hover:bg-dark-bg text-white rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center space-y-2 transition-all"
          >
            <HiCreditCard className="w-6 h-6 text-gray-400" />
            <span className="font-semibold text-sm sm:text-base text-gray-300">Recargar</span>
          </button>
        </div>

        {/* Wallet Address */}
        {address && (
          <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Dirección de Wallet</h2>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-2 bg-dark-bg border border-dark-border rounded-lg hover:bg-dark-bg/80 transition-colors"
              >
                {copied ? (
                  <>
                    <HiCheckCircle className="w-4 h-4 text-positive" />
                    <span className="text-sm text-positive">Copiado</span>
                  </>
                ) : (
                  <>
                    <HiDuplicate className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Copiar</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-dark-bg rounded-lg p-4 border border-dark-border">
              <p className="text-sm font-mono text-gray-300 break-all">{address}</p>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Comparte esta dirección para recibir fondos
            </p>
          </div>
        )}

      </div>
    
  );
}

