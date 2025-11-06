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
  HiX
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
      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
        {/* Balance Card - Estilo igual al Dashboard */}
        <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl mt-5">
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 mb-4 sm:mb-5 lg:mb-6 font-medium">Mi Saldo Total</p>
          
          {loading ? (
            <div className="h-16 sm:h-20 lg:h-24 flex items-center">
              <div className="animate-pulse bg-dark-bg/50 h-12 sm:h-16 lg:h-20 w-40 sm:w-64 lg:w-80 rounded"></div>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline space-x-2 sm:space-x-3 lg:space-x-4 mb-3 sm:mb-4 lg:mb-5">
                <span className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white">
                  {balance ? formatBalance(balance.balance) : '0.00'}
                </span>
                <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold text-gray-400">
                  {balance?.currency || 'ETH'}
                </span>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-gray-400 font-medium mb-2 sm:mb-3">
                ≈ ${balance ? calculateUSD(balance.balance) : '0.00'} USD
              </p>
              <p className="text-sm sm:text-base text-gray-500">
                {balance?.network || 'Sepolia Testnet'} - Fondos de prueba
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons - Estilo igual al Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          <button
            onClick={() => navigate('/wallet/send')}
            className="bg-primary-red hover:bg-primary-red/90 text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 flex items-center justify-center space-x-2 transition-all shadow-lg"
          >
            <HiArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-semibold text-sm sm:text-base lg:text-lg">Enviar</span>
          </button>

          <button
            onClick={() => navigate('/wallet/receive')}
            className="bg-dark-card border border-dark-border hover:bg-dark-bg text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 flex items-center justify-center space-x-2 transition-all"
          >
            <HiArrowDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            <span className="font-semibold text-sm sm:text-base lg:text-lg text-gray-300">Recibir</span>
          </button>

          <button
            onClick={() => navigate('/wallet/pay')}
            className="bg-dark-card border border-dark-border hover:bg-dark-bg text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 flex items-center justify-center space-x-2 transition-all"
          >
            <HiShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            <span className="font-semibold text-sm sm:text-base lg:text-lg text-gray-300">Pagar</span>
          </button>

          <button
            onClick={() => navigate('/wallet/recharge')}
            className="bg-dark-card border border-dark-border hover:bg-dark-bg text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 flex items-center justify-center space-x-2 transition-all"
          >
            <HiCreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            <span className="font-semibold text-sm sm:text-base lg:text-lg text-gray-300">Recargar</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
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

        {/* Filter Modal */}
        {filterModalOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setFilterModalOpen(false)}
            />
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Filtrar Transacciones</h3>
                  <button
                    onClick={() => setFilterModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all"
                  >
                    <HiX className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Filter Options */}
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

        {/* Transactions List - Estilo igual al Dashboard */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6 mt-5">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Todas las Transacciones</h2>
          </div>

          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
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
                    className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 hover:border-primary-red/30 transition-all"
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
      </div>
    </Layout>
  );
}
