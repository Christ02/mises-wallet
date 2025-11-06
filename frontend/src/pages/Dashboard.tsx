import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiArrowUp, 
  HiArrowDown, 
  HiCreditCard,
  HiArrowRight,
  HiCalendar
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');

  const fetchBalance = async () => {
    try {
      const response = await api.get('/api/wallet/balance');
      setBalance(response.data);
      setError('');
    } catch (err: any) {
      setError('Error al cargar el balance');
      console.error('Error fetching balance:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/wallet/history');
      const realTransactions = response.data.transactions || [];
      
      // Si no hay transacciones reales, usar datos simulados
      if (realTransactions.length === 0) {
        // Crear fechas específicas para que coincidan con la imagen
        const today = new Date();
        today.setHours(10, 45, 0, 0); // Hoy, 10:45 AM
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(15, 20, 0, 0); // Ayer, 3:20 PM
        
        const oct25 = new Date(2024, 9, 25, 9, 0, 0, 0); // 25 Oct, 9:00 AM
        
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
      console.error('Error fetching transactions:', err);
      // Si hay error, mostrar datos simulados
      // Crear fechas específicas para que coincidan con la imagen
      const today = new Date();
      today.setHours(10, 45, 0, 0); // Hoy, 10:45 AM
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(15, 20, 0, 0); // Ayer, 3:20 PM
      
      const oct25 = new Date(2024, 9, 25, 9, 0, 0, 0); // 25 Oct, 9:00 AM
      
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
    }
  };


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBalance(), fetchTransactions()]);
      setLoading(false);
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

  const getStatusIcon = (status: string, type: string) => {
    if (type === 'receive') {
      return <HiArrowDown className="w-5 h-5 text-positive" />;
    }
    return <HiArrowUp className="w-5 h-5 text-primary-red" />;
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

  // Calcular equivalente en USD (aproximado, 1 ETH ≈ $2000 USD como referencia)
  const calculateUSD = (ethBalance: string) => {
    const eth = parseFloat(ethBalance);
    const ethPrice = 2000; // Precio aproximado de ETH
    return (eth * ethPrice).toFixed(2);
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
        {/* Balance Card - Estilo móvil */}
        <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl mt-5">
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 mb-4 sm:mb-5 lg:mb-6 font-medium">Mi Saldo Total</p>
          
          {loading ? (
            <div className="h-16 sm:h-20 lg:h-24 flex items-center">
              <div className="animate-pulse bg-dark-bg/50 h-12 sm:h-16 lg:h-20 w-40 sm:w-64 lg:w-80 rounded"></div>
            </div>
          ) : error ? (
            <div className="text-negative text-sm sm:text-base">{error}</div>
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

        {/* Action Buttons - Estilo móvil */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
          <button
            onClick={() => navigate('/wallet/recharge')}
            className="bg-primary-red hover:bg-primary-red/90 text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 flex items-center justify-center space-x-2 transition-all shadow-lg"
          >
            <HiArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-semibold text-sm sm:text-base lg:text-lg">Recargar</span>
          </button>

          <button
            onClick={() => navigate('/wallet/withdraw')}
            className="bg-dark-card border border-dark-border hover:bg-dark-bg text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 flex items-center justify-center space-x-2 transition-all"
          >
            <HiArrowUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            <span className="font-semibold text-sm sm:text-base lg:text-lg text-gray-300">Retirar</span>
          </button>
        </div>

        {/* Actividad Reciente y Eventos - Contenedor unificado */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6 mt-5">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Actividad Reciente</h2>
            {transactions.length > 5 && (
              <button
                onClick={() => navigate('/transactions')}
                className="text-sm sm:text-base text-primary-red hover:text-primary-red/80 transition-colors flex items-center space-x-1"
              >
                <span>Ver todas</span>
                <HiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              {/* Transacciones */}
              {transactions.length === 0 ? (
                <div className="text-center py-6 sm:py-8 lg:py-12">
                  <HiCreditCard className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-400 mb-2 sm:mb-3">No hay transacciones aún</p>
                  <p className="text-xs sm:text-sm text-gray-500">Tus transacciones aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {transactions.slice(0, 5).map((transaction, index) => (
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

              {/* Botón Ver todas - Después de las transacciones */}
              {transactions.length > 0 && (
                <div className="pt-2 sm:pt-3">
                  <button
                    onClick={() => navigate('/transactions')}
                    className="w-full bg-dark-card border border-dark-border hover:border-primary-red/50 text-primary-red font-semibold rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 transition-all duration-300 flex items-center justify-center space-x-2 group"
                  >
                    <span className="text-base sm:text-lg lg:text-xl">Ver todas</span>
                    <HiArrowRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* Próximos Eventos - Aparece después de las transacciones */}
              <div className="pt-4 sm:pt-5 lg:pt-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Próximos Eventos</h2>
                  <button
                    onClick={() => navigate('/events')}
                    className="text-sm sm:text-base text-primary-red hover:text-primary-red/80 transition-colors flex items-center space-x-1"
                  >
                    <span>Ver todos</span>
                    <HiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="overflow-x-auto overflow-y-hidden pb-6 sm:pb-8 lg:pb-10">
                  <div className="flex space-x-4 sm:space-x-5 lg:space-x-6 min-w-max">
                    {/* Event Card 1 */}
                    <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl overflow-hidden w-64 sm:w-72 lg:w-80 flex-shrink-0 shadow-lg hover:border-primary-red/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col">
                      <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-primary-red/30 via-primary-red/20 to-primary-red/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary-red/5"></div>
                        <HiCalendar className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-primary-red relative z-10" />
                      </div>
                      <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col justify-between bg-dark-card">
                        <div>
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                            Conferencia Blockchain 2024
                          </h3>
                          <p className="text-sm sm:text-base text-gray-400 font-medium">15 Nov, 2024</p>
                        </div>
                      </div>
                    </div>

                    {/* Event Card 2 */}
                    <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl overflow-hidden w-64 sm:w-72 lg:w-80 flex-shrink-0 shadow-lg hover:border-primary-red/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col">
                      <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-primary-red/30 via-primary-red/20 to-primary-red/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary-red/5"></div>
                        <HiCalendar className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-primary-red relative z-10" />
                      </div>
                      <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col justify-between bg-dark-card">
                        <div>
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                            Feria de Innovación
                          </h3>
                          <p className="text-sm sm:text-base text-gray-400 font-medium">2 Dic, 2024</p>
                        </div>
                      </div>
                    </div>

                    {/* Event Card 3 */}
                    <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl overflow-hidden w-64 sm:w-72 lg:w-80 flex-shrink-0 shadow-lg hover:border-primary-red/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col">
                      <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-primary-red/30 via-primary-red/20 to-primary-red/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary-red/5"></div>
                        <HiCalendar className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-primary-red relative z-10" />
                      </div>
                      <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col justify-between bg-dark-card">
                        <div>
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                            Hackathon UFM
                          </h3>
                          <p className="text-sm sm:text-base text-gray-400 font-medium">10 Dic, 2024</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
