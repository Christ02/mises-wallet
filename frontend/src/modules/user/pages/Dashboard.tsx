import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiArrowUp, 
  HiArrowDown, 
  HiCreditCard,
  HiArrowRight,
  HiCalendar,
  HiHome,
  HiQuestionMarkCircle,
  HiX,
  HiLocationMarker,
  HiClock
} from 'react-icons/hi';
import api from '../../../services/api';
import { fetchUserEvents, UserEvent } from '../services/events';
import { fetchUserProfile } from '../services/profile';

interface WalletBalance {
  balance: string;
  tokenSymbol: string;
  network: string;
}

interface RechargeSummary {
  tokenSymbol: string;
  totalTokens: number;
  totalUsd: number;
  usdToTokenRate: number;
}

interface DashboardTransaction {
  id: string;
  direction: 'entrante' | 'saliente';
  amount: number;
  currency: string;
  created_at: string;
  status: string;
  description: string;
  counterparty: string;
}

type DashboardEvent = UserEvent;

export default function Dashboard() {
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [rechargeSummary, setRechargeSummary] = useState<RechargeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DashboardEvent | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<DashboardEvent[]>([]);

  const mapTransactions = (rawTransactions: any[]): DashboardTransaction[] => {
    const defaultSymbol = walletBalance?.tokenSymbol || 'HC';
    return rawTransactions.map((tx) => {
      const direction: 'entrante' | 'saliente' = tx.direction === 'entrante' ? 'entrante' : 'saliente';
      const amountNumber =
        typeof tx.amount === 'number'
          ? tx.amount
          : parseFloat(tx.amount || '0');
      const metadata = tx.metadata || {};
      const counterparty =
        metadata.recipient_name ||
        metadata.merchant_name ||
        metadata.merchant_group_id ||
        metadata.sender_name ||
        metadata.to ||
        metadata.from ||
        metadata.wallet ||
        metadata.recipient_carnet ||
        metadata.sender_carnet ||
        tx.description ||
        (direction === 'entrante' ? 'Ingreso recibido' : 'Envío realizado');

      return {
        id: String(tx.id ?? tx.reference ?? tx.hash ?? crypto.randomUUID()),
        direction,
        amount: Number.isNaN(amountNumber) ? 0 : amountNumber,
        currency: tx.currency || defaultSymbol,
        created_at: tx.created_at || tx.date || new Date().toISOString(),
        status: tx.status || 'pendiente',
        description:
          tx.description ||
          (direction === 'saliente'
            ? `Envío a ${counterparty}`
            : `Ingreso de ${counterparty}`),
        counterparty
      };
    });
  };

  const fetchProfile = async () => {
    try {
      const profile = await fetchUserProfile();
      setWalletBalance(profile.wallet);
      setRechargeSummary(profile.rechargeSummary);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching profile balance:', err);
      setError('Error al cargar el balance');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/wallet/history');
      const realTransactions = response.data.transactions || [];
      setTransactions(mapTransactions(realTransactions).slice(0, 5));
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setTransactions([]);
    }
  };

  const fetchEventsData = async () => {
    try {
      const { upcoming } = await fetchUserEvents();
      setUpcomingEvents(upcoming.slice(0, 3));
    } catch (err) {
      console.error('Error fetching events:', err);
      setUpcomingEvents([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchTransactions(), fetchEventsData()]);
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

  const formatEventCardDate = (dateString?: string) => {
    if (!dateString) return 'Fecha por confirmar';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays > 1 && diffDays < 7) return `En ${diffDays} días`;
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const recentEvents = useMemo(() => upcomingEvents, [upcomingEvents]);

  return (
    <>
      <div>
        {/* Header Section */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <HiHome className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Inicio</h2>
              <p className="text-sm sm:text-base text-gray-400">Resumen de tu wallet y actividad</p>
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
            ) : error ? (
              <div className="text-negative text-sm sm:text-base mt-4">{error}</div>
            ) : walletBalance && (
              <div className="mt-4">
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    {formatBalance(walletBalance.balance)}
                  </span>
                  <span className="text-lg sm:text-xl text-gray-300 font-semibold">
                    {walletBalance.tokenSymbol || 'HC'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400">{walletBalance.network || 'Red Universitaria'}</p>
              </div>
            )}
            {rechargeSummary && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-dark-card/60 border border-dark-border/60 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Recargas acumuladas</p>
                  <p className="text-lg sm:text-xl font-semibold text-white">
                    {rechargeSummary.totalTokens.toFixed(4)} {rechargeSummary.tokenSymbol}
                  </p>
                </div>
                <div className="bg-dark-card/60 border border-dark-border/60 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Estimado en USD</p>
                  <p className="text-lg sm:text-xl font-semibold text-white">
                    ${rechargeSummary.totalUsd.toFixed(2)} USD
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    1 USD = {rechargeSummary.usdToTokenRate.toFixed(2)} {rechargeSummary.tokenSymbol}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACCIONES Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 font-semibold">ACCIONES</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
        </div>

        {/* ACTIVIDAD RECIENTE Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">ACTIVIDAD RECIENTE</h3>
            {transactions.length > 5 && (
              <button
                onClick={() => navigate('/transactions')}
                className="text-xs sm:text-sm text-primary-red hover:text-primary-red/80 transition-colors flex items-center space-x-1"
              >
                <span>Ver todas</span>
                <HiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-6 sm:py-8 lg:py-12">
              <HiCreditCard className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-400 mb-2 sm:mb-3">No hay transacciones aún</p>
              <p className="text-xs sm:text-sm text-gray-500">Tus transacciones aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:border-primary-red/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                        transaction.direction === 'entrante' 
                          ? 'bg-positive/10' 
                          : 'bg-primary-red/10'
                      }`}>
                        {transaction.direction === 'entrante' ? (
                          <HiArrowDown className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-positive" />
                        ) : (
                          <HiArrowUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary-red" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base sm:text-lg lg:text-xl font-semibold text-white truncate">
                          {transaction.description}
                        </p>
                        <p className="text-sm sm:text-base text-gray-400 truncate mt-1">
                          {transaction.counterparty}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {formatTransactionDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4 sm:ml-6">
                      <p className={`text-base sm:text-lg lg:text-xl font-bold ${
                        transaction.direction === 'entrante' 
                          ? 'text-positive' 
                          : 'text-primary-red'
                      }`}>
                        {transaction.direction === 'entrante' ? '+' : '-'}
                        {transaction.amount.toFixed(4)} {transaction.currency}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón Ver todas - Después de las transacciones */}
          {transactions.length > 0 && (
            <div className="pt-6 sm:pt-8 lg:pt-10">
              <button
                onClick={() => navigate('/transactions')}
                className="w-full bg-transparent border-2 border-gray-600 hover:border-primary-red text-primary-red font-semibold rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <span className="text-base sm:text-lg lg:text-xl">Ver todas</span>
                <HiArrowRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* EVENTOS Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">PRÓXIMOS EVENTOS</h3>
            <button
              onClick={() => navigate('/events')}
              className="text-xs sm:text-sm text-primary-red hover:text-primary-red/80 transition-colors flex items-center space-x-1"
            >
              <span>Ver todos</span>
              <HiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          {loading ? (
            <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-8 sm:p-10 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-red mx-auto mb-4"></div>
              <p className="text-sm text-gray-400">Cargando eventos...</p>
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-8 sm:p-10 text-center text-sm text-gray-400">
              No hay eventos próximos disponibles.
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden pb-6 sm:pb-8 lg:pb-10 scrollbar-hide">
              <div className="flex space-x-4 sm:space-x-5 lg:space-x-6" style={{ width: 'max-content' }}>
                {recentEvents.map((eventCard) => (
                  <div
                    key={eventCard.id}
                    onClick={() => setSelectedEvent(eventCard)}
                    className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 shadow-lg hover:border-primary-red/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col w-[calc((100vw-4rem-1rem)/2)] sm:w-72 lg:w-80"
                  >
                    <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-b from-red-900/80 via-red-700/60 to-red-900/80 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                      <HiCalendar className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-primary-red relative z-10" />
                    </div>
                    <div className="p-5 sm:p-6 lg:p-8 flex-1 flex flex-col justify-between bg-dark-card">
                      <div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                          {eventCard.name}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-400 font-medium">
                          {formatEventCardDate(eventCard.event_date)}
                        </p>
                        {eventCard.location && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {eventCard.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                    En esta pantalla puedes ver un resumen de tu wallet, incluyendo tu saldo total, actividad reciente y próximos eventos.
                  </p>
                  <p>
                    Usa los botones de acción para recargar o retirar fondos, y navega a otras secciones desde el menú inferior.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        {selectedEvent && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setSelectedEvent(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl max-w-md w-full p-6 sm:p-8 lg:p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6">
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-primary-red/30 via-primary-red/20 to-primary-red/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary-red/5"></div>
                    <HiCalendar className="w-16 h-16 sm:w-20 sm:h-20 text-primary-red relative z-10" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">{selectedEvent.title}</h2>
                  <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-300">
                    <div className="flex items-center space-x-3">
                      <HiCalendar className="w-5 h-5 text-primary-red" />
                    <span>{formatEventCardDate(selectedEvent.event_date)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <HiLocationMarker className="w-5 h-5 text-primary-red" />
                    <span>{selectedEvent.location || 'Por confirmar'}</span>
                    </div>
                    {(selectedEvent.start_time || selectedEvent.end_time) && (
                      <div className="flex items-center space-x-3">
                        <HiClock className="w-5 h-5 text-primary-red" />
                        <span>
                          {selectedEvent.start_time}
                          {selectedEvent.end_time && ` - ${selectedEvent.end_time}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-sm sm:text-base font-semibold text-white mb-2 sm:mb-3">Descripción</h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                    {selectedEvent.description || 'Aún no hay una descripción para este evento.'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 px-4 sm:px-6 py-3 bg-dark-bg border border-dark-border rounded-lg sm:rounded-xl text-white hover:bg-dark-bg/80 transition-colors text-sm sm:text-base font-medium"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEvent(null);
                      navigate('/events');
                    }}
                    className="flex-1 px-4 sm:px-6 py-3 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base font-medium flex items-center justify-center space-x-2"
                  >
                    <span>Ver todos los eventos</span>
                    <HiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
