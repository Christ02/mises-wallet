import { useEffect, useMemo, useState } from 'react';
import { 
  HiUsers, 
  HiRefresh, 
  HiCalendar, 
  HiCurrencyDollar,
  HiArrowRight,
  HiUserCircle,
  HiViewGrid
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../../../services/api';
import { fetchEvents, AdminEvent } from '../services/events';
import { fetchTransactions, AdminTransaction } from '../services/transactions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AdminUser {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  status?: string | null;
  created_at: string;
}

type WithdrawalRequest = {
  id: number;
  user: {
    id: number;
    carnet: string;
    nombres?: string;
    apellidos?: string;
  } | null;
  amount: number;
  token_symbol: string;
  status: string;
  notes?: string | null;
  created_at: string;
};

type Settlement = {
  id: number;
  event_id: number;
  event_name: string;
  business_id: number;
  business_name: string;
  group_id: string | null;
  requested_amount: number;
  token_symbol: string;
  status: string;
  method?: string | null;
  notes?: string | null;
  created_at: string;
  token_transfer_hash?: string | null;
};

interface WalletStatusResponse {
  token?: {
    symbol: string;
    balance?: string;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [walletStatus, setWalletStatus] = useState<WalletStatusResponse | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, eventsRes, txRes, walletRes, withdrawalsRes, settlementsRes] = await Promise.all([
          api.get('/api/admin/users'),
          fetchEvents(),
          fetchTransactions({ limit: 1000 }), // Obtener más transacciones para la gráfica
          api.get('/api/admin/central-wallet/status').catch(() => null),
          api.get('/api/admin/central-wallet/withdrawals').catch(() => null),
          api.get('/api/admin/central-wallet/settlements').catch(() => null)
        ]);

        setUsers(usersRes.data.data || []);
        setEvents(eventsRes || []);
        setTransactions(txRes.data || []);
        if (walletRes) {
          setWalletStatus(walletRes.data);
        }
        if (withdrawalsRes?.data?.withdrawals) {
          setWithdrawals(withdrawalsRes.data.withdrawals || []);
        }
        if (settlementsRes?.data?.settlements) {
          setSettlements(settlementsRes.data.settlements || []);
        }
      } catch (err: any) {
        console.error('Error loading dashboard data', err);
        setError(err?.response?.data?.error || 'No se pudo cargar el resumen.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => (u.status ?? 'activo') === 'activo').length;

  const {
    totalTransactions,
    completedTx
  } = useMemo(() => {
    let completed = 0;

    transactions.forEach((tx) => {
      if (tx.status === 'completada' || tx.status === 'completed') completed += 1;
    });

    return {
      totalTransactions: transactions.length,
      completedTx: completed
    };
  }, [transactions]);

  const { newUsersLast7Days } = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const newUsers = users.filter((u) => {
      try {
        const created = new Date(u.created_at);
        return created >= sevenDaysAgo && created <= now;
      } catch {
        return false;
      }
    }).length;

    return { newUsersLast7Days: newUsers };
  }, [users]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    // Normalizar la fecha actual a medianoche para comparar solo días
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return events
      .filter((e) => (e.status || '').toLowerCase() === 'publicado')
      .filter((e) => {
        try {
          const eventDate = new Date(e.event_date);
          // Normalizar la fecha del evento a medianoche para comparar solo días
          const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
          return eventDay >= today && eventDay <= thirtyDaysFromNow;
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        try {
          return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
        } catch {
          return 0;
        }
      });
  }, [events]);

  // const nextEvent = upcomingEvents[0]; // No usado actualmente
  const next5Events = upcomingEvents.slice(0, 5);

  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [transactions]);

  const recentWithdrawals = useMemo(() => {
    return withdrawals
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [withdrawals]);

  const recentSettlements = useMemo(() => {
    return settlements
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [settlements]);

  // Datos para la gráfica de compras de HC por mes
  const purchaseChartData = useMemo(() => {
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    // Inicializar todos los meses del año actual con 0
    const currentYear = new Date().getFullYear();
    const monthlyData: { [key: string]: number } = {};
    
    monthNames.forEach((_month, index) => {
      monthlyData[`${currentYear}-${String(index + 1).padStart(2, '0')}`] = 0;
    });

    // Filtrar transacciones de tipo "recarga" y agrupar por mes
    const rechargeTransactions = transactions.filter(
      (tx) => tx.type === 'recarga' && (tx.status === 'completada' || tx.status === 'completed')
    );

    rechargeTransactions.forEach((tx) => {
      try {
        const date = new Date(tx.created_at);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const key = `${year}-${month}`;

        // Solo contar transacciones del año actual
        if (year === currentYear && monthlyData[key] !== undefined) {
          const amount = Number(tx.amount);
          if (!Number.isNaN(amount) && amount > 0) {
            monthlyData[key] += amount;
          }
        }
      } catch {
        // Ignorar errores de fecha
      }
    });

    // Convertir a arrays para la gráfica
    const labels = monthNames;
    const data = monthNames.map((_, index) => {
      const key = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
      return monthlyData[key] || 0;
    });

    return {
      labels,
      datasets: [
        {
          label: 'HC Comprados',
          data,
          backgroundColor: 'rgba(239, 68, 68, 0.8)', // primary-red con opacidad
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        }
      ]
    };
  }, [transactions]);

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  };

  const formatDateTime = (date: string) => {
    try {
      return new Date(date).toLocaleString('es-GT', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return date;
    }
  };

  const formatAmount = (amount: string | number, symbol: string) => {
    const numeric = typeof amount === 'string' ? Number(amount) : amount;
    if (Number.isNaN(numeric)) return `${amount} ${symbol}`;
    return `${numeric.toLocaleString('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} ${symbol}`;
  };

  const tokenSymbol = walletStatus?.token?.symbol || 'HC';
  const tokenBalance = walletStatus?.token?.balance || '0';

  if (loading) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
        <span className="h-8 w-8 border-2 border-primary-red border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Cargando información del panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 text-negative text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
        {/* Header */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-red to-primary-red/80 border border-primary-red/40 text-white flex items-center justify-center shadow-lg flex-shrink-0">
              <HiViewGrid className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-gray-400 mt-1">Resumen general del sistema</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/profile')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all"
          >
            <HiUserCircle className="w-5 h-5" />
            <span>Mi perfil</span>
          </button>
        </div>
      </div>

      {/* 4 Tarjetas informativas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Usuarios</p>
            <HiUsers className="w-5 h-5 text-primary-red" />
          </div>
          <p className="text-2xl font-bold text-white">{totalUsers}</p>
          <p className="text-xs text-gray-500 mt-1">
            {activeUsers} activos · +{newUsersLast7Days} últimos 7 días
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Transacciones</p>
            <HiRefresh className="w-5 h-5 text-accent-yellow" />
          </div>
          <p className="text-2xl font-bold text-white">{totalTransactions}</p>
          <p className="text-xs text-gray-500 mt-1">
            {completedTx} completadas
          </p>
                </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Eventos</p>
            <HiCalendar className="w-5 h-5 text-positive" />
              </div>
          <p className="text-2xl font-bold text-white">{upcomingEvents.length}</p>
          <p className="text-xs text-gray-500 mt-1">Próximos publicados</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Wallet Central</p>
            <HiCurrencyDollar className="w-5 h-5 text-primary-red" />
                  </div>
          <p className="text-xl font-bold text-white truncate">
            {formatAmount(tokenBalance, tokenSymbol)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Balance disponible</p>
                </div>
              </div>

      {/* Últimas transacciones y Próximos eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Últimas 5 transacciones */}
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-dark-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Últimas transacciones</h2>
              <p className="text-xs text-gray-500 mt-0.5">5 transacciones más recientes</p>
            </div>
            <button
              onClick={() => navigate('/admin/transactions')}
              className="text-xs text-primary-red hover:text-primary-red/80 flex items-center gap-1"
            >
              Ver todas
              <HiArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">No hay transacciones</div>
          ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-dark-bg/40">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Usuario</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Monto</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Estado</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {recentTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-dark-bg/30 transition-colors cursor-pointer"
                      onClick={() => navigate('/admin/transactions')}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col">
                          <span className="text-sm text-white font-medium">
                            {tx.user ? `${tx.user.nombres} ${tx.user.apellidos}` : 'Sistema'}
                          </span>
                          {tx.user?.email && (
                            <span className="text-xs text-gray-500">{tx.user.email}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-100">
                        {formatAmount(tx.amount, tx.currency || tokenSymbol)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                            tx.status === 'completada' || tx.status === 'completed'
                              ? 'bg-positive/10 text-positive border border-positive/30'
                              : tx.status === 'fallida' || tx.status === 'failed'
                              ? 'bg-negative/10 text-negative border border-negative/30'
                              : 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/30'
                          }`}
                        >
                          {tx.status === 'completada' || tx.status === 'completed' ? 'Completada' : 
                           tx.status === 'fallida' || tx.status === 'failed' ? 'Fallida' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">
                        {formatDateTime(tx.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Próximos eventos */}
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-dark-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Próximos eventos</h2>
              <p className="text-xs text-gray-500 mt-0.5">5 eventos próximos publicados</p>
            </div>
            <button
              onClick={() => navigate('/admin/events')}
              className="text-xs text-primary-red hover:text-primary-red/80 flex items-center gap-1"
            >
              Ver todos
              <HiArrowRight className="w-3 h-3" />
            </button>
          </div>
          {next5Events.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">No hay eventos próximos</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-dark-bg/40">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Evento</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Fecha</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Ubicación</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                  {next5Events.map((event) => (
                      <tr
                        key={event.id}
                      className="hover:bg-dark-bg/30 transition-colors cursor-pointer"
                      onClick={() => navigate('/admin/events')}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col">
                          <span className="text-sm text-white font-medium">
                            {event.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-100">
                        {formatDate(event.event_date)}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-100">
                        {event.location}
                        </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/events/${event.id}`);
                          }}
                          className="text-xs text-primary-red hover:text-primary-red/80 flex items-center gap-1"
                        >
                          Gestionar
                          <HiArrowRight className="w-3 h-3" />
                            </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Gráfica de compras de HC por mes - Ancho completo */}
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-dark-border">
          <h2 className="text-base font-semibold text-white">Compras de HC por mes</h2>
          <p className="text-xs text-gray-500 mt-0.5">Cantidad de HayekCoin comprados por mes del año</p>
        </div>
        <div className="p-4">
          <Bar
            data={purchaseChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  titleColor: '#fff',
                  bodyColor: '#fff',
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  borderWidth: 1,
                  callbacks: {
                    label: function(context) {
                      const value = context.parsed.y ?? 0;
                      return `${value.toLocaleString('es-GT', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} HC`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  ticks: {
                    color: '#9CA3AF'
                  },
                  grid: {
                    color: 'rgba(55, 65, 81, 0.3)'
                  }
                },
                y: {
                  ticks: {
                    color: '#9CA3AF',
                    callback: function(value) {
                      return Number(value).toLocaleString('es-GT', {
                        maximumFractionDigits: 0
                      });
                    }
                  },
                  grid: {
                    color: 'rgba(55, 65, 81, 0.3)'
                  }
                }
              }
            } as ChartOptions<'bar'>}
            style={{ height: '200px' }}
          />
        </div>
      </div>

      {/* Solicitudes de liquidación y retiro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 5 Solicitudes de liquidación */}
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-dark-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Solicitudes de liquidación</h2>
              <p className="text-xs text-gray-500 mt-0.5">5 solicitudes más recientes</p>
            </div>
            <button
              onClick={() => navigate('/admin/central-wallet/settlements')}
              className="text-xs text-primary-red hover:text-primary-red/80 flex items-center gap-1"
            >
              Ver todas
              <HiArrowRight className="w-3 h-3" />
                            </button>
                          </div>
          {recentSettlements.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">No hay solicitudes de liquidación</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-dark-bg/40">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Evento</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Equipo</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Monto</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {recentSettlements.map((settlement) => (
                    <tr
                      key={settlement.id}
                      className="hover:bg-dark-bg/30 transition-colors cursor-pointer"
                      onClick={() => navigate('/admin/central-wallet/settlements')}
                    >
                      <td className="px-4 py-2.5">
                        <span className="text-sm text-white font-medium">{settlement.event_name}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-sm text-gray-300">{settlement.business_name}</span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-100">
                        {formatAmount(settlement.requested_amount, settlement.token_symbol)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                            settlement.status === 'pendiente'
                              ? 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/30'
                              : settlement.status === 'pagado'
                              ? 'bg-positive/10 text-positive border border-positive/30'
                              : 'bg-negative/10 text-negative border border-negative/30'
                          }`}
                        >
                          {settlement.status.toUpperCase()}
                        </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>

        {/* 5 Solicitudes de retiro */}
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-dark-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Solicitudes de retiro</h2>
              <p className="text-xs text-gray-500 mt-0.5">5 solicitudes más recientes</p>
            </div>
            <button
              onClick={() => navigate('/admin/central-wallet/withdrawals')}
              className="text-xs text-primary-red hover:text-primary-red/80 flex items-center gap-1"
            >
              Ver todas
              <HiArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentWithdrawals.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">No hay solicitudes de retiro</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-dark-bg/40">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Usuario</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Monto</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Estado</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {recentWithdrawals.map((withdrawal) => (
                    <tr
                      key={withdrawal.id}
                      className="hover:bg-dark-bg/30 transition-colors cursor-pointer"
                      onClick={() => navigate('/admin/central-wallet/withdrawals')}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col">
                          <span className="text-sm text-white font-medium">
                            {withdrawal.user
                              ? `${withdrawal.user.nombres || ''} ${withdrawal.user.apellidos || ''}`.trim() || withdrawal.user.carnet
                              : 'Usuario desconocido'}
                          </span>
                          {withdrawal.user && (
                            <span className="text-xs text-gray-500">Carnet: {withdrawal.user.carnet}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-100">
                        {formatAmount(withdrawal.amount, withdrawal.token_symbol)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                            withdrawal.status === 'pendiente'
                              ? 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/30'
                              : withdrawal.status === 'aprobado' || withdrawal.status === 'completado'
                              ? 'bg-positive/10 text-positive border border-positive/30'
                              : 'bg-negative/10 text-negative border border-negative/30'
                          }`}
                        >
                          {withdrawal.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">
                        {formatDateTime(withdrawal.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      </div>
  );
}
