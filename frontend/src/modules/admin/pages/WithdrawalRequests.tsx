import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiChevronLeft, HiChevronRight, HiCreditCard } from 'react-icons/hi';
import api from '../../../services/api';

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

const ITEMS_PER_PAGE = 10;

export default function WithdrawalRequests() {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/admin/central-wallet/withdrawals');
      setWithdrawals(response.data?.withdrawals || []);
    } catch (err: any) {
      console.error('Error fetching withdrawals', err);
      setError(err.response?.data?.error || 'No se pudieron obtener las solicitudes de retiro');
    } finally {
      setLoading(false);
    }
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

  // Estadísticas
  const stats = useMemo(() => {
    const total = withdrawals.length;
    const pending = withdrawals.filter(w => w.status === 'pendiente').length;
    const approved = withdrawals.filter(w => w.status === 'aprobado' || w.status === 'completado').length;
    const rejected = withdrawals.filter(w => w.status === 'rechazado').length;
    const totalAmount = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    return { total, pending, approved, rejected, totalAmount };
  }, [withdrawals]);

  // Paginación
  const paginatedWithdrawals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return withdrawals.slice(startIndex, endIndex);
  }, [withdrawals, currentPage]);

  const totalPages = Math.ceil(withdrawals.length / ITEMS_PER_PAGE);

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
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <HiCreditCard className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Solicitudes de retiro de usuarios</h1>
              <p className="text-sm text-gray-400">Todas las solicitudes de retiro de HayekCoin de usuarios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Total</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-red/20 border border-primary-red/30 flex items-center justify-center">
            <HiCreditCard className="w-6 h-6 text-primary-red" />
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Pendientes</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.pending}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-yellow/10 border border-accent-yellow/30 flex items-center justify-center">
            <HiCreditCard className="w-6 h-6 text-accent-yellow" />
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Aprobadas</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.approved}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-positive/10 border border-positive/30 flex items-center justify-center">
            <HiCreditCard className="w-6 h-6 text-positive" />
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Rechazadas</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.rejected}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-negative/10 border border-negative/30 flex items-center justify-center">
            <HiCreditCard className="w-6 h-6 text-negative" />
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Monto total</p>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.totalAmount.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-red/20 border border-primary-red/30 flex items-center justify-center">
            <HiCreditCard className="w-6 h-6 text-primary-red" />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500">
            <span className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin inline-block mr-3" />
            Cargando solicitudes...
          </div>
        ) : error ? (
          <div className="py-6 text-center text-sm text-negative">{error}</div>
        ) : withdrawals.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center">
              <HiCreditCard className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-sm font-semibold text-gray-300 mb-1">No hay solicitudes de retiro</p>
            <p className="text-xs text-gray-500">
              Los usuarios podrán solicitar retiros desde su panel de usuario.
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
                        Usuario
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
                    {paginatedWithdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="hover:bg-dark-bg/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-white font-semibold">
                          {withdrawal.user ? (
                            <>
                              <div>{`${withdrawal.user.nombres || ''} ${withdrawal.user.apellidos || ''}`.trim() || withdrawal.user.carnet}</div>
                              <div className="text-xs text-gray-500">Carnet: {withdrawal.user.carnet}</div>
                            </>
                          ) : (
                            'Usuario'
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-semibold">
                          {withdrawal.amount.toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}{' '}
                          {withdrawal.token_symbol}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                              withdrawal.status === 'pendiente'
                                ? 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20'
                                : withdrawal.status === 'aprobado' || withdrawal.status === 'completado'
                                ? 'bg-positive/10 text-positive border border-positive/20'
                                : withdrawal.status === 'rechazado'
                                ? 'bg-negative/10 text-negative border border-negative/20'
                                : 'bg-gray-600/10 text-gray-300 border border-gray-600/20'
                            }`}
                          >
                            {withdrawal.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{formatDateTime(withdrawal.created_at)}</td>
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
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, withdrawals.length)} de {withdrawals.length} solicitudes
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

