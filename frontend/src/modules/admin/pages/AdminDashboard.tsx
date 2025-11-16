import { useEffect, useMemo, useState } from 'react';
import {
  HiUsers,
  HiRefresh,
  HiCalendar,
  HiCurrencyDollar,
  HiArrowRight,
  HiSearch,
  HiLightningBolt,
  HiShieldCheck,
  HiDocumentReport
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

interface WithdrawalSummary {
  total: number;
  pending: number;
}

interface SettlementSummary {
  total: number;
  pending: number;
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
  const [withdrawalsSummary, setWithdrawalsSummary] = useState<WithdrawalSummary | null>(null);
  const [settlementsSummary, setSettlementsSummary] = useState<SettlementSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
          fetchTransactions({ limit: 100 }),
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
          const allWithdrawals = withdrawalsRes.data.withdrawals as {
            status: string;
          }[];
          const total = allWithdrawals.length;
          const pending = allWithdrawals.filter((w) => w.status === 'pendiente').length;
          setWithdrawalsSummary({ total, pending });
        }

        if (settlementsRes?.data?.settlements) {
          const allSett = settlementsRes.data.settlements as {
            status: string;
          }[];
          const total = allSett.length;
          const pending = allSett.filter((s) => s.status === 'pendiente').length;
          setSettlementsSummary({ total, pending });
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

  const {
    totalTransactions,
    completedTx,
    failedTx,
    pendingTx,
    last7DaysVolume,
    last7DaysCount
  } = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    let completed = 0;
    let failed = 0;
    let pending = 0;
    let volume = 0;
    let count7 = 0;

    transactions.forEach((tx) => {
      if (tx.status === 'completed') completed += 1;
      else if (tx.status === 'failed') failed += 1;
      else pending += 1;

      try {
        const created = new Date(tx.created_at);
        if (created >= sevenDaysAgo && created <= now) {
          count7 += 1;
          const amountNumeric = Number(tx.amount);
          if (!Number.isNaN(amountNumeric)) {
            volume += amountNumeric;
          }
        }
      } catch {
        // ignore parse errors
      }
    });

    return {
      totalTransactions: transactions.length,
      completedTx: completed,
      failedTx: failed,
      pendingTx: pending,
      last7DaysVolume: volume,
      last7DaysCount: count7
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

  const miniBar = (percentage: number, colorClass: string) => {
    const clamped = Math.max(0, Math.min(100, percentage || 0));
    return (
      <div className="mt-3 h-1.5 w-full rounded-full bg-dark-bg/80 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    );
  };

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
          {/* KPIs principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            {/* Usuarios */}
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
              <p className="mt-1 text-xs text-gray-500">
                Nuevos últimos 7 días:{' '}
                <span className="text-gray-200 font-semibold">{newUsersLast7Days}</span>
              </p>
            </div>

            {/* Transacciones */}
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
              <p className="mt-2 text-xs text-gray-500">
                Últimos 7 días: {last7DaysCount} tx ·{' '}
                {last7DaysVolume.toLocaleString('es-GT', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}{' '}
                {tokenSymbol}
              </p>
              {miniBar(
                totalTransactions ? (completedTx / totalTransactions) * 100 : 0,
                'bg-accent-yellow'
              )}
            </div>

            {/* Próximos eventos */}
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

            {/* Balance banco central */}
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

          {/* Segunda fila: gráficas ligeras + acciones rápidas */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Resumen de estado de transacciones */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Estado de transacciones</h2>
                  <p className="text-xs text-gray-500">Distribución de estados en las últimas operaciones.</p>
                </div>
                <HiLightningBolt className="w-6 h-6 text-accent-yellow" />
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs text-gray-400">
                <div className="bg-dark-bg/60 border border-dark-border rounded-lg p-3">
                  <p className="uppercase tracking-wider mb-1">Completadas</p>
                  <p className="text-xl font-semibold text-positive">{completedTx}</p>
                  {miniBar(
                    totalTransactions ? (completedTx / totalTransactions) * 100 : 0,
                    'bg-positive'
                  )}
                </div>
                <div className="bg-dark-bg/60 border border-dark-border rounded-lg p-3">
                  <p className="uppercase tracking-wider mb-1">Pendientes</p>
                  <p className="text-xl font-semibold text-accent-yellow">{pendingTx}</p>
                  {miniBar(
                    totalTransactions ? (pendingTx / totalTransactions) * 100 : 0,
                    'bg-accent-yellow'
                  )}
                </div>
                <div className="bg-dark-bg/60 border border-dark-border rounded-lg p-3">
                  <p className="uppercase tracking-wider mb-1">Fallidas</p>
                  <p className="text-xl font-semibold text-negative">{failedTx}</p>
                  {miniBar(
                    totalTransactions ? (failedTx / totalTransactions) * 100 : 0,
                    'bg-negative'
                  )}
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Acciones rápidas</h2>
                  <p className="text-xs text-gray-500">
                    Atajos a las tareas operativas más frecuentes del día a día.
                  </p>
                </div>
                <HiLightningBolt className="w-6 h-6 text-primary-red" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <button
                  onClick={() => navigate('/admin/events/new')}
                  className="bg-dark-bg border border-dark-border rounded-lg px-3 py-3 flex items-start gap-3 hover:border-primary-red/60 hover:bg-dark-bg/80 transition"
                >
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-primary-red/15 border border-primary-red/30 flex items-center justify-center text-primary-red">
                    <HiCalendar className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">Crear evento</p>
                    <p className="text-xs text-gray-500">Configura un nuevo evento y su wallet.</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/admin/withdrawal-requests')}
                  className="bg-dark-bg border border-dark-border rounded-lg px-3 py-3 flex items-start gap-3 hover:border-primary-red/60 hover:bg-dark-bg/80 transition"
                >
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-accent-yellow/10 border border-accent-yellow/30 flex items-center justify-center text-accent-yellow">
                    <HiCurrencyDollar className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">Revisar retiros</p>
                    <p className="text-xs text-gray-500">
                      Gestiona las solicitudes de retiro de usuarios.
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/admin/settlement-requests')}
                  className="bg-dark-bg border border-dark-border rounded-lg px-3 py-3 flex items-start gap-3 hover:border-primary-red/60 hover:bg-dark-bg/80 transition"
                >
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-positive/10 border border-positive/30 flex items-center justify-center text-positive">
                    <HiCurrencyDollar className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">Liquidar equipos</p>
                    <p className="text-xs text-gray-500">
                      Revisa las solicitudes de liquidación de eventos.
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/admin/reports')}
                  className="bg-dark-bg border border-dark-border rounded-lg px-3 py-3 flex items-start gap-3 hover:border-primary-red/60 hover:bg-dark-bg/80 transition"
                >
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-primary-red/10 border border-primary-red/40 flex items-center justify-center text-primary-red">
                    <HiDocumentReport className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">Generar reporte</p>
                    <p className="text-xs text-gray-500">
                      Descarga un CSV rápido de actividad reciente.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Cola operativa */}
            <div className="bg-dark-card rounded-xl border border-dark-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Operaciones pendientes</h2>
                  <p className="text-xs text-gray-500">
                    Retiros y liquidaciones que requieren revisión del equipo admin.
                  </p>
                </div>
                <HiShieldCheck className="w-6 h-6 text-accent-yellow" />
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between bg-dark-bg/60 border border-dark-border rounded-lg px-3 py-3">
                  <div>
                    <p className="text-xs font-semibold text-white">Retiros pendientes</p>
                    <p className="text-xs text-gray-500">
                      Solicitudes de retiro en cola de aprobación.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-accent-yellow">
                      {withdrawalsSummary?.pending ?? 0}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      de {withdrawalsSummary?.total ?? 0} totales
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-dark-bg/60 border border-dark-border rounded-lg px-3 py-3">
                  <div>
                    <p className="text-xs font-semibold text-white">Liquidaciones pendientes</p>
                    <p className="text-xs text-gray-500">
                      Solicitudes de liquidación de equipos de eventos.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-accent-yellow">
                      {settlementsSummary?.pending ?? 0}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      de {settlementsSummary?.total ?? 0} totales
                    </p>
                  </div>
                </div>
              </div>
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


