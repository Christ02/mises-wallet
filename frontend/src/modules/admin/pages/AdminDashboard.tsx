import { useEffect, useMemo, useState } from 'react';
import {
  HiUsers,
  HiRefresh,
  HiCalendar,
  HiCurrencyDollar,
  HiArrowRight,
  HiSearch
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { fetchEvents, AdminEvent } from '../services/events';
import { fetchTransactions, AdminTransaction } from '../services/transactions';

interface AdminUser {
  id: number;
  status?: string | null;
  created_at: string;
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, eventsRes, txRes, walletRes] = await Promise.all([
          api.get('/api/admin/users'),
          fetchEvents(),
          fetchTransactions({ limit: 5 }),
          api.get('/api/admin/central-wallet/status').catch(() => null)
        ]);

        setUsers(usersRes.data.data || []);
        setEvents(eventsRes || []);
        setTransactions(txRes.data || []);
        if (walletRes) {
          setWalletStatus(walletRes.data);
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
  const inactiveUsers = totalUsers - activeUsers;

  const totalTransactions = useMemo(() => transactions.length, [transactions]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => (e.status || '').toLowerCase() === 'publicado')
      .filter((e) => {
        try {
          const d = new Date(e.event_date);
          return d >= now;
        } catch {
          return true;
        }
      })
      .slice(0, 3);
  }, [events]);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm.trim()) return transactions;
    const term = searchTerm.toLowerCase();
    return transactions.filter((tx) => {
      const userName = tx.user ? `${tx.user.nombres} ${tx.user.apellidos}`.toLowerCase() : '';
      return (
        tx.id.toString().includes(term) ||
        (tx.user?.email || '').toLowerCase().includes(term) ||
        userName.includes(term) ||
        (tx.description || '').toLowerCase().includes(term)
      );
    });
  }, [transactions, searchTerm]);

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
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return date;
    }
  };

  const formatAmount = (amount: string, symbol: string) => {
    const numeric = Number(amount);
    if (Number.isNaN(numeric)) return `${amount} ${symbol}`;
    return `${numeric.toLocaleString('es-GT', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 6
    })} ${symbol}`;
  };

  const tokenSymbol = walletStatus?.token?.symbol || 'HC';
  const tokenBalance = walletStatus?.token?.balance || '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-red to-primary-red/80 border border-primary-red/40 text-white flex items-center justify-center shadow-lg flex-shrink-0">
            <HiRefresh className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Panel de administración</h1>
            <p className="text-sm text-gray-400">
              Resumen rápido de usuarios, eventos, transacciones y balance del banco central.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-dark-card border border-dark-border rounded-xl py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
          <span className="h-8 w-8 border-2 border-primary-red border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Cargando información del panel...</p>
        </div>
      ) : error ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 text-negative text-sm">
          {error}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-dark-card rounded-xl border border-dark-border p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Usuarios totales</p>
                  <p className="text-3xl font-bold text-white mt-2">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-red/15 border border-primary-red/30 flex items-center justify-center">
                  <HiUsers className="w-6 h-6 text-primary-red" />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Activos: <span className="text-positive font-semibold">{activeUsers}</span> · Inactivos:{' '}
                <span className="text-negative font-semibold">{inactiveUsers}</span>
              </p>
            </div>

            <div className="bg-dark-card rounded-xl border border-dark-border p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Transacciones recientes</p>
                  <p className="text-3xl font-bold text-white mt-2">{totalTransactions}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent-yellow/10 border border-accent-yellow/30 flex items-center justify-center">
                  <HiRefresh className="w-6 h-6 text-accent-yellow" />
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/transactions')}
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-accent-yellow hover:text-accent-yellow/80"
              >
                Ver todas las transacciones
                <HiArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-dark-card rounded-xl border border-dark-border p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Próximos eventos</p>
                  <p className="text-3xl font-bold text-white mt-2">{upcomingEvents.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-positive/10 border border-positive/30 flex items-center justify-center">
                  <HiCalendar className="w-6 h-6 text-positive" />
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/events')}
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-positive hover:text-positive/80"
              >
                Ir a gestión de eventos
                <HiArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-dark-card rounded-xl border border-dark-border p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Balance banco central</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {formatAmount(tokenBalance, tokenSymbol)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-red/10 border border-primary-red/30 flex items-center justify-center">
                  <HiCurrencyDollar className="w-6 h-6 text-primary-red" />
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/central-wallet')}
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-primary-red hover:text-primary-red/80"
              >
                Ver detalle de wallet central
                <HiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Últimas transacciones */}
            <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
              <div className="p-6 border-b border-dark-border flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Últimas transacciones</h2>
                    <p className="text-xs text-gray-500">
                      Actividad reciente en HayekCoin procesada por el banco central.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/admin/transactions')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-dark-bg border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-bg/80 transition"
                  >
                    Ver todas
                    <HiArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por usuario, correo o descripción..."
                    className="w-full pl-9 pr-3 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/40 focus:border-primary-red/40 transition-all"
                  />
                </div>
              </div>
              {filteredTransactions.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">No hay transacciones recientes.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-dark-bg/40">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-dark-bg/30 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex flex-col">
                              <span className="text-white font-medium">
                                {tx.user ? `${tx.user.nombres} ${tx.user.apellidos}` : 'Desconocido'}
                              </span>
                              {tx.user?.email && (
                                <span className="text-xs text-gray-500">{tx.user.email}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-gray-100">
                            {formatAmount(tx.amount, tx.currency || tokenSymbol)}
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                tx.status === 'completed'
                                  ? 'bg-positive/10 text-positive border-positive/30'
                                  : tx.status === 'failed'
                                  ? 'bg-negative/10 text-negative border-negative/30'
                                  : 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-gray-400">
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
            <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
              <div className="p-6 border-b border-dark-border flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Próximos eventos</h2>
                  <p className="text-xs text-gray-500">
                    Eventos publicados y próximos en el calendario.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/admin/events')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-dark-bg border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-bg/80 transition"
                >
                  Ver todos
                  <HiArrowRight className="w-4 h-4" />
                </button>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  No hay eventos próximos publicados.
                </div>
              ) : (
                <div className="divide-y divide-dark-border">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-5 flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{event.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(event.event_date)} · {event.location}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/events/${event.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-dark-bg border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-bg/80 transition"
                      >
                        Gestionar
                        <HiArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


