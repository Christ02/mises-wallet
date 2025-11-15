import { useEffect, useMemo, useState } from 'react';
import {
  HiChevronDown,
  HiFilter,
  HiSearch,
  HiSwitchHorizontal,
  HiTrendingDown,
  HiTrendingUp,
  HiExternalLink
} from 'react-icons/hi';
import { fetchTransactions, AdminTransaction } from '../services/transactions';

type StatusChip = 'pendiente' | 'en_proceso' | 'completada' | 'fallida';

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completada: 'Completada',
  fallida: 'Fallida'
};

const STATUS_COLORS: Record<StatusChip, string> = {
  pendiente: 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20',
  en_proceso: 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20',
  completada: 'bg-positive/10 text-positive border border-positive/20',
  fallida: 'bg-negative/10 text-negative border border-negative/20'
};

const DIRECTION_LABELS: Record<string, string> = {
  saliente: 'Salida',
  entrante: 'Entrada'
};

const formatAmount = (amount: string, currency: string) => {
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) {
    return `${amount} ${currency}`;
  }
  if (numeric === 0) {
    return `0 ${currency}`;
  }
  if (numeric < 0.001) {
    return `${numeric.toFixed(6)} ${currency}`;
  }
  return `${numeric.toLocaleString('es-GT', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 6
  })} ${currency}`;
};

const formatDateTime = (value: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function TransactionManagement() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [typeFilter, setTypeFilter] = useState<string>('Todos');
  const [directionFilter, setDirectionFilter] = useState<string>('Todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchTransactions({
          search: debouncedSearch || undefined,
          status: statusFilter !== 'Todos' ? statusFilter : undefined,
          type: typeFilter !== 'Todos' ? typeFilter : undefined,
          direction: directionFilter !== 'Todos' ? directionFilter : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          page,
          limit: pageSize,
          offset: (page - 1) * pageSize
        });
        setTransactions(response.data);
        setTotal(response.total);
      } catch (err: any) {
        if (controller.signal.aborted) return;
        console.error('Error fetching transactions', err);
        setError(err.response?.data?.error || 'No se pudieron cargar las transacciones');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => controller.abort();
  }, [
    debouncedSearch,
    statusFilter,
    typeFilter,
    directionFilter,
    dateFrom,
    dateTo,
    page,
    pageSize,
    refreshToken
  ]);

  const stats = useMemo(() => {
    const totals = {
      total: total,
      completed: transactions.filter((tx) => tx.status === 'completada').length,
      failed: transactions.filter((tx) => tx.status === 'fallida').length,
      pending: transactions.filter((tx) => tx.status === 'pendiente' || tx.status === 'en_proceso').length,
      incoming: transactions
        .filter((tx) => tx.direction === 'entrante')
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
      outgoing: transactions
        .filter((tx) => tx.direction === 'saliente')
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
    };
    return totals;
  }, [transactions, total]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const uniqueTypes = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.type) set.add(tx.type);
    });
    return Array.from(set);
  }, [transactions]);

  const getEtherscanUrl = (txHash: string | null | undefined) => {
    if (!txHash) return null;
    // Sepolia testnet
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  const formatError = (error: unknown): { short: string; full: string } => {
    const errorStr = String(error);
    let short = errorStr;
    
    // Normalizar el error a minúsculas para comparación
    const errorLower = errorStr.toLowerCase();
    
    // Errores de fondos y gas
    if (errorLower.includes('insufficient funds') || errorLower.includes('insufficient balance')) {
      if (errorLower.includes('gas') || errorLower.includes('intrinsic')) {
        short = 'Fondos insuficientes para gas';
      } else {
        short = 'Fondos insuficientes';
      }
    }
    // Errores de ejecución revertida
    else if (errorLower.includes('execution reverted')) {
      // Intentar extraer el mensaje de error personalizado
      const customErrorMatch = errorStr.match(/execution reverted[:\s]+([^(\n]+)/i);
      if (customErrorMatch && customErrorMatch[1].trim().length < 50) {
        short = `Revertido: ${customErrorMatch[1].trim()}`;
      } else {
        short = 'Transacción revertida';
      }
    }
    // Errores de rechazo del usuario
    else if (errorLower.includes('user rejected') || errorLower.includes('user denied') || errorLower.includes('rejected by user')) {
      short = 'Usuario rechazó la transacción';
    }
    // Errores de nonce
    else if (errorLower.includes('nonce too high') || errorLower.includes('nonce too low')) {
      short = 'Error de nonce (número de secuencia)';
    }
    // Errores de límite de gas
    else if (errorLower.includes('gas required exceeds allowance') || errorLower.includes('out of gas')) {
      short = 'Límite de gas excedido';
    }
    // Errores de precio de gas
    else if (errorLower.includes('gas price') && errorLower.includes('too low')) {
      short = 'Precio de gas muy bajo';
    }
    // Errores de transacción pendiente
    else if (errorLower.includes('replacement fee too low') || errorLower.includes('already known')) {
      short = 'Transacción pendiente o duplicada';
    }
    // Errores de contrato
    else if (errorLower.includes('contract call') || errorLower.includes('call exception')) {
      short = 'Error en llamada al contrato';
    }
    // Errores de red
    else if (errorLower.includes('network error') || errorLower.includes('connection') || errorLower.includes('timeout')) {
      short = 'Error de conexión con la red';
    }
    // Errores de validación
    else if (errorLower.includes('invalid') || errorLower.includes('malformed')) {
      short = 'Datos de transacción inválidos';
    }
    // Errores de permisos
    else if (errorLower.includes('unauthorized') || errorLower.includes('permission denied')) {
      short = 'Sin permisos para esta operación';
    }
    // Errores de allowance (tokens)
    else if (errorLower.includes('allowance') || errorLower.includes('insufficient allowance')) {
      short = 'Permiso de tokens insuficiente';
    }
    // Errores de transferencia
    else if (errorLower.includes('transfer') && errorLower.includes('failed')) {
      short = 'Transferencia fallida';
    }
    // Errores de estimación de gas
    else if (errorLower.includes('estimate gas') || errorLower.includes('gas estimation')) {
      short = 'Error al estimar gas';
    }
    // Errores de transacción ya procesada
    else if (errorLower.includes('already been mined') || errorLower.includes('already processed')) {
      short = 'Transacción ya procesada';
    }
    // Errores de timeout
    else if (errorLower.includes('timeout') || errorLower.includes('timed out')) {
      short = 'Tiempo de espera agotado';
    }
    // Errores desconocidos - truncar si es muy largo
    else if (errorStr.length > 60) {
      // Intentar extraer solo la parte relevante antes de truncar
      const firstLine = errorStr.split('\n')[0];
      if (firstLine.length <= 60) {
        short = firstLine;
      } else {
        short = errorStr.substring(0, 60) + '...';
      }
    }
    
    return {
      short,
      full: errorStr
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-red to-primary-red/80 border border-primary-red/40 text-white flex items-center justify-center shadow-lg flex-shrink-0">
            <HiSwitchHorizontal className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Transacciones del sistema</h1>
            <p className="text-sm text-gray-400">
              Monitorea las operaciones realizadas por los usuarios y el banco central.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-3">
          <p className="text-xs uppercase tracking-wider text-gray-500">Total transacciones</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-500">Incluye todas las operaciones registradas</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-3">
          <p className="text-xs uppercase tracking-wider text-gray-500">Completadas</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-positive">{stats.completed}</p>
            <HiTrendingUp className="w-6 h-6 text-positive" />
          </div>
          <p className="text-xs text-gray-500">Transacciones exitosas en blockchain</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-3">
          <p className="text-xs uppercase tracking-wider text-gray-500">Pendientes</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-accent-yellow">{stats.pending}</p>
            <HiSwitchHorizontal className="w-6 h-6 text-accent-yellow" />
          </div>
          <p className="text-xs text-gray-500">En espera de confirmación de la red</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-3">
          <p className="text-xs uppercase tracking-wider text-gray-500">Fallidas</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-negative">{stats.failed}</p>
            <HiTrendingDown className="w-6 h-6 text-negative" />
          </div>
          <p className="text-xs text-gray-500">Transacciones revertidas o con error</p>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-dark-card rounded-xl border border-dark-border p-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por ID, hash, usuario o carnet..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center justify-center w-12 h-12 bg-dark-bg border border-dark-border rounded-lg text-gray-300 hover:text-white hover:border-primary-red/50 transition-all"
            title="Mostrar filtros avanzados"
          >
            <HiFilter className="w-5 h-5" />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 border-t border-dark-border pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-gray-400 mb-2">Estado</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-3.5 pr-12 appearance-none text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                >
                  <option value="Todos">Todos</option>
                  <option value="completada">Completadas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="fallida">Fallidas</option>
                </select>
                <HiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Tipo</label>
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-3.5 pr-12 appearance-none text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                >
                  <option value="Todos">Todos</option>
                  {uniqueTypes.length === 0 && <option value="transferencia">Transferencia</option>}
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <HiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Dirección</label>
              <div className="relative">
                <select
                  value={directionFilter}
                  onChange={(e) => {
                    setDirectionFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-3.5 pr-12 appearance-none text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                >
                  <option value="Todos">Todas</option>
                  <option value="saliente">Salidas</option>
                  <option value="entrante">Entradas</option>
                </select>
                <HiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 appearance-none [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 appearance-none [color-scheme:dark]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex flex-col items-center gap-3 text-gray-400">
            <span className="h-8 w-8 border-2 border-primary-red border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Cargando transacciones...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-negative text-sm">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center space-y-3 text-gray-400">
            <p className="text-lg font-semibold text-white">Sin transacciones</p>
            <p className="text-sm">
              Ajusta los filtros o verifica que se hayan generado operaciones en el sistema.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-bg/60">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Tipo / Dirección
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Referencia
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-dark-bg/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-accent-blue">{tx.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        {tx.user ? (
                          <div className="space-y-1">
                            <p className="text-sm text-white font-semibold">
                              {tx.user.nombres} {tx.user.apellidos}
                            </p>
                            <p className="text-xs text-gray-400">{tx.user.carnet}</p>
                            <p className="text-xs text-gray-500">{tx.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-300">Banco Central</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-semibold">
                          {formatAmount(tx.amount, tx.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-300 text-sm capitalize">{tx.type}</span>
                          <span className="text-xs text-gray-500">
                            {DIRECTION_LABELS[tx.direction] ?? tx.direction}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                            STATUS_COLORS[(tx.status as StatusChip) || 'pendiente'] ||
                            'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}
                        >
                          {STATUS_LABELS[tx.status] ?? tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{formatDateTime(tx.created_at)}</div>
                        {tx.completed_at && (
                          <div className="text-xs text-gray-500">
                            Liquidada: {formatDateTime(tx.completed_at)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex flex-col gap-1.5 text-xs">
                          {tx.reference ? (
                            <a
                              href={getEtherscanUrl(tx.reference) || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-accent-blue hover:text-primary-red transition-colors group"
                              title={`Ver en Etherscan: ${tx.reference}`}
                            >
                              <span>Ver en Etherscan</span>
                              <HiExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                            </a>
                          ) : tx.metadata?.error ? (
                            <div className="flex items-start gap-1.5">
                              <span className="text-negative font-semibold">Error:</span>
                              <span 
                                className="text-negative truncate" 
                                title={formatError(tx.metadata.error).full}
                              >
                                {formatError(tx.metadata.error).short}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                          {tx.metadata?.to && !tx.metadata?.error && (
                            <span className="font-mono truncate text-gray-500" title={`Destino: ${tx.metadata.to as string}`}>
                              Destino: {tx.metadata.to as string}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-dark-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-sm text-gray-400">
                Mostrando {transactions.length} de {total} transacciones
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm bg-dark-bg border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-bg/80 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-400">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm bg-dark-bg border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-bg/80 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}