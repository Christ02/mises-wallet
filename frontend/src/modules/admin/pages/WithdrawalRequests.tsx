import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiCreditCard, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import api from '../../../services/api';
import { useModal } from '../../../hooks/useModal';
import { usePermissions } from '../../../hooks/usePermissions';
import Pagination from '../components/Pagination';

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
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  // Prevenir scroll del body cuando hay modales abiertos
  useModal(rejectModalOpen || approveModalOpen);

  // Permisos
  const { hasPermission } = usePermissions();
  const canApprove = hasPermission('centralWallet.approve');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/admin/central-wallet/withdrawals');
      setWithdrawals(response.data?.withdrawals || []);
      setCurrentPage(1); // Resetear a la primera página cuando se cargan nuevos datos
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

  const totalPages = Math.max(Math.ceil(withdrawals.length / ITEMS_PER_PAGE), 1);

  const handleApprove = async (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setApproveModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedWithdrawal) return;

    setProcessingId(selectedWithdrawal.id);
    try {
      await api.post(`/api/admin/central-wallet/withdrawals/${selectedWithdrawal.id}/approve`);
      await fetchWithdrawals();
      setApproveModalOpen(false);
      setSelectedWithdrawal(null);
    } catch (err: any) {
      console.error('Error approving withdrawal', err);
      alert(err.response?.data?.error || 'No se pudo aprobar la solicitud de retiro');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setRejectNotes('');
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedWithdrawal) return;

    setProcessingId(selectedWithdrawal.id);
    try {
      await api.post(`/api/admin/central-wallet/withdrawals/${selectedWithdrawal.id}/reject`, {
        notes: rejectNotes || null
      });
      await fetchWithdrawals();
      setRejectModalOpen(false);
      setSelectedWithdrawal(null);
      setRejectNotes('');
    } catch (err: any) {
      console.error('Error rejecting withdrawal', err);
      alert(err.response?.data?.error || 'No se pudo rechazar la solicitud de retiro');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
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
            <HiCreditCard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Solicitudes de retiro de usuarios</h1>
            <p className="text-sm text-gray-400">Todas las solicitudes de retiro de HayekCoin de usuarios</p>
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
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Acciones
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
                        <td className="px-6 py-4">
                          {withdrawal.status === 'pendiente' ? (
                            canApprove ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(withdrawal)}
                                  disabled={processingId === withdrawal.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-positive/10 hover:bg-positive/20 text-positive border border-positive/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                                >
                                  <HiCheckCircle className="w-4 h-4" />
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => handleReject(withdrawal)}
                                  disabled={processingId === withdrawal.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-negative/10 hover:bg-negative/20 text-negative border border-negative/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                                >
                                  <HiXCircle className="w-4 h-4" />
                                  Rechazar
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">Solo super admin puede aprobar</span>
                            )
                          ) : (
                            <span className="text-xs text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </div>
      {withdrawals.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={withdrawals.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}

      {/* Modal de confirmación para aprobar */}
      {approveModalOpen && selectedWithdrawal && createPortal(
        <div
          className="bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            width: '100vw', 
            height: '100vh', 
            margin: 0,
            padding: '1rem',
            zIndex: 9999
          }}
          onClick={() => {
            setApproveModalOpen(false);
            setSelectedWithdrawal(null);
          }}
        >
          <div
            className="bg-dark-card border border-dark-border rounded-xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-positive/10 border border-positive/30 flex items-center justify-center">
                  <HiCheckCircle className="w-6 h-6 text-positive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Aprobar solicitud de retiro</h3>
                  <p className="text-sm text-gray-400">¿Estás seguro de aprobar esta solicitud?</p>
                </div>
              </div>

              <div className="bg-dark-bg/60 border border-dark-border rounded-lg p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Usuario:</span>
                    <span className="text-white font-medium">
                      {selectedWithdrawal.user
                        ? `${selectedWithdrawal.user.nombres || ''} ${selectedWithdrawal.user.apellidos || ''}`.trim() || selectedWithdrawal.user.carnet
                        : 'Usuario desconocido'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monto:</span>
                    <span className="text-white font-medium">
                      {selectedWithdrawal.amount.toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}{' '}
                      {selectedWithdrawal.token_symbol}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setApproveModalOpen(false);
                    setSelectedWithdrawal(null);
                  }}
                  className="px-4 py-2 bg-dark-bg border border-dark-border text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmApprove}
                  disabled={processingId === selectedWithdrawal.id}
                  className="px-4 py-2 bg-positive hover:bg-positive/90 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {processingId === selectedWithdrawal.id ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <HiCheckCircle className="w-4 h-4" />
                      Aprobar
                    </>
                  )}
                </button>
              </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de confirmación para rechazar */}
      {rejectModalOpen && selectedWithdrawal && createPortal(
        <div
          className="bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            width: '100vw', 
            height: '100vh', 
            margin: 0,
            padding: '1rem',
            zIndex: 9999
          }}
          onClick={() => {
            setRejectModalOpen(false);
            setSelectedWithdrawal(null);
            setRejectNotes('');
          }}
        >
          <div
            className="bg-dark-card border border-dark-border rounded-xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-negative/10 border border-negative/30 flex items-center justify-center">
                  <HiXCircle className="w-6 h-6 text-negative" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Rechazar solicitud de retiro</h3>
                  <p className="text-sm text-gray-400">¿Estás seguro de rechazar esta solicitud?</p>
                </div>
              </div>

              <div className="bg-dark-bg/60 border border-dark-border rounded-lg p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Usuario:</span>
                    <span className="text-white font-medium">
                      {selectedWithdrawal.user
                        ? `${selectedWithdrawal.user.nombres || ''} ${selectedWithdrawal.user.apellidos || ''}`.trim() || selectedWithdrawal.user.carnet
                        : 'Usuario desconocido'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monto:</span>
                    <span className="text-white font-medium">
                      {selectedWithdrawal.amount.toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}{' '}
                      {selectedWithdrawal.token_symbol}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Motivo del rechazo (opcional)
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Ingresa el motivo del rechazo..."
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setSelectedWithdrawal(null);
                    setRejectNotes('');
                  }}
                  className="px-4 py-2 bg-dark-bg border border-dark-border text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmReject}
                  disabled={processingId === selectedWithdrawal.id}
                  className="px-4 py-2 bg-negative hover:bg-negative/90 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {processingId === selectedWithdrawal.id ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <HiXCircle className="w-4 h-4" />
                      Rechazar
                    </>
                  )}
                </button>
              </div>
          </div>
        </div>,
        document.body
      )}
      </div>
    </>
  );
}

