import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiChevronLeft, HiChevronRight, HiSwitchHorizontal, HiExternalLink } from 'react-icons/hi';
import api from '../../../services/api';

type Movement = {
  id: string | number;
  type: string;
  direction: 'entrante' | 'saliente';
  amount: number;
  currency: string;
  counterparty: string;
  status: string;
  created_at: string;
  reference?: string | null;
  metadata?: Record<string, any>;
};

const ITEMS_PER_PAGE = 10;

export default function CentralWalletActivity() {
  const navigate = useNavigate();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    fetchActivity();
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/api/admin/central-wallet/status');
      setStatus(response.data);
    } catch (err) {
      console.error('Error fetching status', err);
    }
  };

  const fetchActivity = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/admin/central-wallet/activity');
      setMovements(response.data?.movements || []);
    } catch (err: any) {
      console.error('Error fetching activity', err);
      setError(err.response?.data?.error || 'No se pudo obtener la actividad de la wallet central');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const normalized = amount.toLocaleString('es-GT', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 6
    });
    return `${normalized} ${currency}`;
  };

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    return date.toLocaleString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateAddress = (address: string, startChars = 6, endChars = 4): string => {
    if (!address || address.length <= startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  };

  const isEthereumAddress = (str: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(str);
  };

  const isTransactionHash = (str: string): boolean => {
    return /^0x[a-fA-F0-9]{64}$/.test(str);
  };

  const getEtherscanUrl = (hash: string): string | null => {
    if (!hash || (!isEthereumAddress(hash) && !isTransactionHash(hash))) return null;
    if (isTransactionHash(hash)) {
      return `https://sepolia.etherscan.io/tx/${hash}`;
    }
    return `https://sepolia.etherscan.io/address/${hash}`;
  };

  // Estadísticas
  const stats = useMemo(() => {
    const total = movements.length;
    const incoming = movements.filter(m => m.direction === 'entrante').length;
    const outgoing = movements.filter(m => m.direction === 'saliente').length;
    const completed = movements.filter(m => m.status === 'completada').length;
    const pending = movements.filter(m => m.status === 'pendiente').length;
    const totalIncoming = movements
      .filter(m => m.direction === 'entrante')
      .reduce((sum, m) => sum + m.amount, 0);
    const totalOutgoing = movements
      .filter(m => m.direction === 'saliente')
      .reduce((sum, m) => sum + m.amount, 0);
    
    return { total, incoming, outgoing, completed, pending, totalIncoming, totalOutgoing };
  }, [movements]);

  // Paginación
  const paginatedMovements = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return movements.slice(startIndex, endIndex);
  }, [movements, currentPage]);

  const totalPages = Math.ceil(movements.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/admin/central-wallet')}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-dark-card border border-dark-border px-3 py-2 rounded-lg"
      >
        <HiArrowLeft className="w-4 h-4" />
        <span className="text-sm">Volver a wallet central</span>
      </button>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-red to-primary-red/80 border border-primary-red/40 text-white flex items-center justify-center shadow-lg flex-shrink-0">
            <HiSwitchHorizontal className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Actividad reciente</h1>
            <p className="text-sm text-gray-400">Todos los movimientos de la wallet central</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Total movimientos</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-red/20 border border-primary-red/30 flex items-center justify-center">
            <HiSwitchHorizontal className="w-6 h-6 text-primary-red" />
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Entrantes</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.incoming}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatAmount(stats.totalIncoming, status?.token?.symbol || 'HC')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-positive/10 border border-positive/30 flex items-center justify-center">
            <HiSwitchHorizontal className="w-6 h-6 text-positive" />
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Salientes</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.outgoing}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatAmount(stats.totalOutgoing, status?.token?.symbol || 'HC')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-negative/10 border border-negative/30 flex items-center justify-center">
            <HiSwitchHorizontal className="w-6 h-6 text-negative" />
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Completadas</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.completed}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pending} pendientes
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-positive/10 border border-positive/30 flex items-center justify-center">
            <HiSwitchHorizontal className="w-6 h-6 text-positive" />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500">
            <span className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin inline-block mr-3" />
            Cargando actividad...
          </div>
        ) : error ? (
          <div className="py-10 text-center text-sm text-negative">{error}</div>
        ) : movements.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center">
              <HiSwitchHorizontal className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-sm font-semibold text-gray-300 mb-1">Aún no hay movimientos registrados</p>
            <p className="text-xs text-gray-500">
              Los movimientos de la wallet central aparecerán aquí cuando se realicen transacciones.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="border border-dark-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-dark-bg/60">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Movimiento
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Contraparte
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {paginatedMovements.map((movement) => (
                      <tr key={movement.id} className="hover:bg-dark-bg/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm text-white font-semibold flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                                movement.direction === 'entrante'
                                  ? 'bg-positive/10 text-positive border-positive/20'
                                  : 'bg-negative/10 text-negative border-negative/20'
                              }`}
                            >
                              {movement.direction === 'entrante' ? 'Entrada' : 'Salida'}
                            </span>
                            <span className="text-gray-300 capitalize">
                              {movement.type || 'operación'}
                            </span>
                          </div>
                          {movement.reference && (
                            <div className="mt-1.5">
                              {getEtherscanUrl(movement.reference) ? (
                                <a
                                  href={getEtherscanUrl(movement.reference)!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-accent-blue hover:text-primary-red transition-colors"
                                  title={`Ver en Etherscan: ${movement.reference}`}
                                >
                                  <span>Ver en Etherscan</span>
                                  <HiExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <div className="text-xs text-gray-500 font-mono" title={movement.reference}>
                                  {truncateAddress(movement.reference)}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-[200px]">
                          {isEthereumAddress(movement.counterparty) ? (
                            <div className="flex items-center gap-1.5">
                              <code className="font-mono text-xs" title={movement.counterparty}>
                                {truncateAddress(movement.counterparty)}
                              </code>
                              {getEtherscanUrl(movement.counterparty) && (
                                <a
                                  href={getEtherscanUrl(movement.counterparty)!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent-blue hover:text-primary-red transition-colors"
                                  title={`Ver wallet en Etherscan: ${movement.counterparty}`}
                                >
                                  <HiExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="truncate block" title={movement.counterparty}>
                              {movement.counterparty}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-semibold">
                          {formatAmount(
                            movement.amount,
                            movement.currency || status?.token?.symbol || 'HC'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                              movement.status === 'completada'
                                ? 'bg-positive/10 text-positive border border-positive/20'
                                : movement.status === 'pendiente'
                                ? 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20'
                                : 'bg-negative/10 text-negative border border-negative/20'
                            }`}
                          >
                            {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {formatDateTime(movement.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, movements.length)} de {movements.length} movimientos
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white hover:border-primary-red/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <HiChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-300">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white hover:border-primary-red/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <HiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

