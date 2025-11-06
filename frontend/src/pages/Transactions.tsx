import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiArrowUp, 
  HiArrowDown,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiFilter,
  HiSearch,
  HiCreditCard,
  HiShoppingCart,
  HiDuplicate,
  HiCheckCircle as HiCheckCircle2
} from 'react-icons/hi';
import Layout from '../components/layout/Layout';
import api from '../services/api';

interface WalletBalance {
  balance: string;
  currency: string;
  network: string;
}

interface Transaction {
  hash: string;
  type: 'send' | 'receive';
  amount: string;
  date: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export default function Transactions() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'send' | 'receive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [balanceResponse, transactionsResponse] = await Promise.all([
          api.get('/api/wallet/balance'),
          api.get('/api/wallet/history')
        ]);
        setBalance(balanceResponse.data);
        setTransactions(transactionsResponse.data.transactions || []);
        // TODO: Obtener dirección de wallet cuando el backend lo permita
      } catch (err: any) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.00';
    if (num < 0.001) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <HiCheckCircle className="w-5 h-5 text-positive" />;
      case 'pending':
        return <HiClock className="w-5 h-5 text-accent-yellow" />;
      case 'failed':
        return <HiXCircle className="w-5 h-5 text-negative" />;
      default:
        return <HiClock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallida';
      default:
        return 'Desconocido';
    }
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = searchQuery === '' || 
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <Layout>
      <div className="h-full flex flex-col space-y-2 sm:space-y-3">
        {/* Header */}
        <div className="flex-shrink-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">Transacciones</h1>
          <p className="text-xs sm:text-sm text-gray-400">Gestiona tu wallet y revisa tus transacciones</p>
        </div>

        {/* Balance Card */}
        <div className="bg-dark-card border border-dark-border rounded-lg sm:rounded-xl p-3 sm:p-4 flex-shrink-0">
          <p className="text-xs sm:text-sm text-gray-400 mb-2">Balance Disponible</p>
          
          {loading ? (
            <div className="h-10 sm:h-12 flex items-center">
              <div className="animate-pulse bg-dark-bg/50 h-8 sm:h-10 w-32 sm:w-48 rounded"></div>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline space-x-1 sm:space-x-2 mb-1">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  {balance ? formatBalance(balance.balance) : '0.00'}
                </span>
                <span className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-400">
                  {balance?.currency || 'ETH'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                {balance?.network || 'Sepolia Testnet'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => navigate('/wallet/send')}
            className="bg-primary-red hover:bg-primary-red/90 text-white rounded-lg sm:rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center space-y-1 transition-all shadow-lg"
          >
            <HiArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-semibold text-xs sm:text-sm">Enviar</span>
          </button>

          <button
            onClick={() => navigate('/wallet/receive')}
            className="bg-dark-card border border-dark-border hover:bg-dark-bg text-white rounded-lg sm:rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center space-y-1 transition-all"
          >
            <HiArrowDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            <span className="font-semibold text-xs sm:text-sm text-gray-300">Recibir</span>
          </button>

          <button
            onClick={() => navigate('/wallet/pay')}
            className="bg-dark-card border border-dark-border hover:bg-dark-bg text-white rounded-lg sm:rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center space-y-1 transition-all"
          >
            <HiShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            <span className="font-semibold text-xs sm:text-sm text-gray-300">Pagar</span>
          </button>

          <button
            onClick={() => navigate('/wallet/recharge')}
            className="bg-dark-card border border-dark-border hover:bg-dark-bg text-white rounded-lg sm:rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center space-y-1 transition-all"
          >
            <HiCreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            <span className="font-semibold text-xs sm:text-sm text-gray-300">Recargar</span>
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
                    <HiCheckCircle2 className="w-4 h-4 text-positive" />
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

        {/* Filters and Search */}
        <div className="bg-dark-card border border-dark-border rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0">
          {/* Search */}
          <div className="relative mb-2">
            <HiSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all text-xs sm:text-sm"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <HiFilter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <div className="flex space-x-1 sm:space-x-2 flex-1 overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-primary-red text-white'
                    : 'bg-dark-bg border border-dark-border text-gray-400 hover:text-white'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('send')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  filter === 'send'
                    ? 'bg-primary-red text-white'
                    : 'bg-dark-bg border border-dark-border text-gray-400 hover:text-white'
                }`}
              >
                Enviadas
              </button>
              <button
                onClick={() => setFilter('receive')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  filter === 'receive'
                    ? 'bg-primary-red text-white'
                    : 'bg-dark-bg border border-dark-border text-gray-400 hover:text-white'
                }`}
              >
                Recibidas
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-dark-card border border-dark-border rounded-lg sm:rounded-xl p-2 sm:p-3 flex-1 min-h-0 flex flex-col">
          <h2 className="text-sm sm:text-base font-semibold text-white mb-2 flex-shrink-0">Historial</h2>
          
          <div className="flex-1 min-h-0 overflow-y-auto">
            {loading ? (
              <div className="text-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-primary-red mx-auto mb-2 sm:mb-4"></div>
                <p className="text-xs sm:text-sm text-gray-400">Cargando...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <HiArrowUp className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-2 sm:mb-4" />
                <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">No hay transacciones</p>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {searchQuery || filter !== 'all' 
                    ? 'Intenta con otros filtros' 
                    : 'Tus transacciones aparecerán aquí'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="bg-dark-bg rounded-lg p-2 sm:p-3 border border-dark-border hover:border-primary-red/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          transaction.type === 'receive' 
                            ? 'bg-positive/10' 
                            : 'bg-primary-red/10'
                        }`}>
                          {transaction.type === 'receive' ? (
                            <HiArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-positive" />
                          ) : (
                            <HiArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-red" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-white truncate">
                            {transaction.type === 'send' 
                              ? 'Envío' 
                              : 'Recibido'}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                            {formatDate(transaction.date)}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 font-mono truncate mt-0.5">
                            {transaction.hash.substring(0, 10)}...
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className={`text-xs sm:text-sm font-semibold ${
                          transaction.type === 'receive' 
                            ? 'text-positive' 
                            : 'text-primary-red'
                        }`}>
                          {transaction.type === 'receive' ? '+' : '-'}
                          {parseFloat(transaction.amount).toFixed(4)} ETH
                        </p>
                        <div className="flex items-center justify-end space-x-1 mt-0.5">
                          {getStatusIcon(transaction.status)}
                          <span className="text-[10px] sm:text-xs text-gray-400">
                            {getStatusText(transaction.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
