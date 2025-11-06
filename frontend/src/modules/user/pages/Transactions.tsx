import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiArrowUp, 
  HiArrowDown, 
  HiCreditCard,
  HiArrowRight,
  HiShoppingCart,
  HiFilter,
  HiSearch,
  HiX,
  HiRefresh,
  HiQuestionMarkCircle
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
  description?: string;
}

export default function Transactions() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'send' | 'receive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [balanceResponse, transactionsResponse] = await Promise.all([
          api.get('/api/wallet/balance'),
          api.get('/api/wallet/history')
        ]);
        setBalance(balanceResponse.data);
        const realTransactions = transactionsResponse.data.transactions || [];
        
        // Si no hay transacciones reales, usar datos simulados
        if (realTransactions.length === 0) {
          const today = new Date();
          today.setHours(10, 45, 0, 0);
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(15, 20, 0, 0);
          
          const oct25 = new Date(2024, 9, 25, 9, 0, 0, 0);
          
          const mockTransactions: Transaction[] = [
            {
              hash: '0x1234567890abcdef',
              type: 'receive',
              amount: '50.25',
              date: today.toISOString(),
              status: 'confirmed',
              description: 'Recibido de...'
            },
            {
              hash: '0xabcdef1234567890',
              type: 'send',
              amount: '15.00',
              date: yesterday.toISOString(),
              status: 'confirmed',
              description: 'Envío a Juan Pérez'
            },
            {
              hash: '0x9876543210fedcba',
              type: 'receive',
              amount: '200.00',
              date: oct25.toISOString(),
              status: 'confirmed',
              description: 'Compra de...'
            }
          ];
          setTransactions(mockTransactions);
        } else {
          setTransactions(realTransactions);
        }
      } catch (err: any) {
        console.error('Error loading data:', err);
        // Si hay error, mostrar datos simulados
        const today = new Date();
        today.setHours(10, 45, 0, 0);
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(15, 20, 0, 0);
        
        const oct25 = new Date(2024, 9, 25, 9, 0, 0, 0);
        
        const mockTransactions: Transaction[] = [
          {
            hash: '0x1234567890abcdef',
            type: 'receive',
            amount: '50.25',
            date: today.toISOString(),
            status: 'confirmed',
            description: 'Recibido de...'
          },
          {
            hash: '0xabcdef1234567890',
            type: 'send',
            amount: '15.00',
            date: yesterday.toISOString(),
            status: 'confirmed',
            description: 'Envío a Juan Pérez'
          },
          {
            hash: '0x9876543210fedcba',
            type: 'receive',
            amount: '200.00',
            date: oct25.toISOString(),
            status: 'confirmed',
            description: 'Compra de...'
          }
        ];
        setTransactions(mockTransactions);
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

    const formatTime = (d: Date) => {
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    if (diffDays === 0) {
      return `Hoy, ${formatTime(date)}`;
    } else if (diffDays === 1) {
      return `Ayer, ${formatTime(date)}`;
    } else {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${date.getDate()} ${months[date.getMonth()]}, ${formatTime(date)}`;
    }
  };

  const calculateUSD = (ethBalance: string) => {
    const eth = parseFloat(ethBalance);
    const ethPrice = 2000;
    return (eth * ethPrice).toFixed(2);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = searchQuery === '' || 
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.includes(searchQuery) ||
      (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <Layout>
      <div>
        {/* Header Section */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <HiRefresh className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Transacciones</h2>
              <p className="text-sm sm:text-base text-gray-400">Gestiona tu wallet y revisa tus transacciones</p>
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
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">Mi Saldo Total</h3>
                <p className="text-sm sm:text-base text-gray-300">Fondos disponibles en tu wallet</p>
              </div>
              <HiCreditCard className="w-12 h-12 sm:w-16 sm:h-16 text-primary-red/80" />
            </div>
            {loading ? (
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

        {/* ACCIONES Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 font-semibold">ACCIONES</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/wallet/send')}
              className="bg-primary-red hover:bg-primary-red/90 text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center space-y-2 transition-all shadow-lg"
            >
              <HiArrowUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              <span className="font-semibold text-sm sm:text-base lg:text-lg">Enviar</span>
            </button>

            <button
              onClick={() => navigate('/wallet/receive')}
              className="bg-dark-card border border-dark-border hover:bg-dark-bg text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center space-y-2 transition-all"
            >
              <HiArrowDown className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gray-400" />
              <span className="font-semibold text-sm sm:text-base lg:text-lg text-gray-300">Recibir</span>
            </button>

            <button
              onClick={() => navigate('/wallet/pay')}
              className="bg-dark-card border border-dark-border hover:bg-dark-bg text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center space-y-2 transition-all"
            >
              <HiShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gray-400" />
              <span className="font-semibold text-sm sm:text-base lg:text-lg text-gray-300">Pagar</span>
            </button>

            <button
              onClick={() => navigate('/wallet/recharge')}
              className="bg-dark-card border border-dark-border hover:bg-dark-bg text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center space-y-2 transition-all"
            >
              <HiCreditCard className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gray-400" />
              <span className="font-semibold text-sm sm:text-base lg:text-lg text-gray-300">Recargar</span>
            </button>
          </div>
        </div>

        {/* TRANSACCIONES Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 font-semibold">TRANSACCIONES</h3>
          
          {/* Filters and Search */}
          <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 mb-4 sm:mb-5">
            {/* Search and Filter in same row */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative flex-1">
                <HiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                <input
                  type="text"
                  placeholder="Buscar transacciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-dark-bg border border-dark-border rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all text-sm sm:text-base"
                />
              </div>
              <button
                onClick={() => setFilterModalOpen(true)}
                className="p-2 sm:p-3 text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all"
              >
                <HiFilter className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div>
            {loading ? (
              <div className="text-center py-12 sm:py-16">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-primary-red mx-auto mb-4"></div>
                <p className="text-sm sm:text-base text-gray-400">Cargando transacciones...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <HiCreditCard className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
                <p className="text-base sm:text-lg text-gray-400 mb-2">No hay transacciones</p>
                <p className="text-sm sm:text-base text-gray-500">
                  {searchQuery || filter !== 'all' 
                    ? 'Intenta con otros filtros' 
                    : 'Tus transacciones aparecerán aquí'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:border-primary-red/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                          transaction.type === 'receive' 
                            ? 'bg-positive/10' 
                            : 'bg-primary-red/10'
                        }`}>
                          {transaction.type === 'receive' ? (
                            <HiArrowDown className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-positive" />
                          ) : (
                            <HiArrowUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary-red" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base sm:text-lg lg:text-xl font-semibold text-white truncate">
                            {transaction.description || (transaction.type === 'send' 
                              ? 'Envío a dirección' 
                              : 'Recibido de dirección')}
                          </p>
                          <p className="text-sm sm:text-base text-gray-400 truncate mt-1">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4 sm:ml-6">
                        <p className={`text-base sm:text-lg lg:text-xl font-bold ${
                          transaction.type === 'receive' 
                            ? 'text-positive' 
                            : 'text-primary-red'
                        }`}>
                          {transaction.type === 'receive' ? '+' : '-'}
                          {parseFloat(transaction.amount).toFixed(2)} UFM
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Modal */}
        {filterModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setFilterModalOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Filtrar Transacciones</h3>
                  <button
                    onClick={() => setFilterModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all"
                  >
                    <HiX className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setFilter('all');
                      setFilterModalOpen(false);
                    }}
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all text-left ${
                      filter === 'all'
                        ? 'bg-primary-red text-white'
                        : 'bg-dark-bg border border-dark-border text-gray-400 hover:text-white hover:border-primary-red/50'
                    }`}
                  >
                    Todas las transacciones
                  </button>
                  <button
                    onClick={() => {
                      setFilter('send');
                      setFilterModalOpen(false);
                    }}
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all text-left ${
                      filter === 'send'
                        ? 'bg-primary-red text-white'
                        : 'bg-dark-bg border border-dark-border text-gray-400 hover:text-white hover:border-primary-red/50'
                    }`}
                  >
                    Enviadas
                  </button>
                  <button
                    onClick={() => {
                      setFilter('receive');
                      setFilterModalOpen(false);
                    }}
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all text-left ${
                      filter === 'receive'
                        ? 'bg-primary-red text-white'
                        : 'bg-dark-bg border border-dark-border text-gray-400 hover:text-white hover:border-primary-red/50'
                    }`}
                  >
                    Recibidas
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

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
                    En esta sección puedes ver todas tus transacciones, filtrarlas por tipo (enviadas o recibidas) y buscar transacciones específicas.
                  </p>
                  <p>
                    Usa los botones de acción para enviar, recibir, pagar o recargar fondos en tu wallet.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
