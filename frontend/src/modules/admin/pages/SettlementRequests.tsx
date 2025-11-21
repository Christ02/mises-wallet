import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiCreditCard, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import api from '../../../services/api';
import Pagination from '../components/Pagination';
import { usePermissions } from '../../../hooks/usePermissions';

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

const ITEMS_PER_PAGE = 10;

export default function SettlementRequests() {
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { hasPermission } = usePermissions();
  // Permiso para aprobar/rechazar (solo super_admin)
  const canApprove = hasPermission('centralWallet.approve');

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/admin/central-wallet/settlements');
      setSettlements(response.data?.settlements || []);
      setCurrentPage(1); // Resetear a la primera página cuando se cargan nuevos datos
    } catch (err: any) {
      console.error('Error fetching settlements', err);
      setError(err.response?.data?.error || 'No se pudo obtener las solicitudes de liquidación');
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

  const truncateAddress = (address: string, startChars = 6, endChars = 4): string => {
    if (!address || address.length <= startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  };

  const getEtherscanUrl = (hash: string): string | null => {
    if (!hash || !/^0x[a-fA-F0-9]{64}$/.test(hash)) return null;
    return `https://sepolia.etherscan.io/tx/${hash}`;
  };

  // Estadísticas
  const stats = useMemo(() => {
    const total = settlements.length;
    const pending = settlements.filter(s => s.status === 'pendiente').length;
    const paid = settlements.filter(s => s.status === 'pagado').length;
    const rejected = settlements.filter(s => s.status === 'rechazado').length;
    const totalAmount = settlements.reduce((sum, s) => sum + s.requested_amount, 0);
    
    return { total, pending, paid, rejected, totalAmount };
  }, [settlements]);

  // Paginación
  const paginatedSettlements = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return settlements.slice(startIndex, endIndex);
  }, [settlements, currentPage]);

  const totalPages = Math.max(Math.ceil(settlements.length / ITEMS_PER_PAGE), 1);

  const handleApprove = async (settlement: Settlement) => {
    if (!canApprove) return;
    const confirmed = window.confirm(
      `¿Seguro que deseas APROBAR la liquidación del equipo "${settlement.business_name}" por ${settlement.requested_amount} ${settlement.token_symbol}?`
    );
    if (!confirmed) return;

    setProcessingId(settlement.id);
    try {
      await api.post(`/api/admin/central-wallet/settlements/${settlement.id}/approve`);
      await fetchSettlements();
    } catch (err: any) {
      console.error('Error approving settlement', err);
      alert(err.response?.data?.error || 'No se pudo aprobar la solicitud de liquidación');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (settlement: Settlement) => {
    if (!canApprove) return;
    const notes = window.prompt(
      `Motivo del rechazo para la liquidación del equipo "${settlement.business_name}" (opcional):`
    ) || undefined;

    const confirmed = window.confirm('¿Seguro que deseas RECHAZAR esta solicitud de liquidación?');
    if (!confirmed) return;

    setProcessingId(settlement.id);
    try {
      await api.post(`/api/admin/central-wallet/settlements/${settlement.id}/reject`, {
        notes: notes || null
      });
      await fetchSettlements();
    } catch (err: any) {
      console.error('Error rejecting settlement', err);
      alert(err.response?.data?.error || 'No se pudo rechazar la solicitud de liquidación');
    } finally {
      setProcessingId(null);
    }
  };

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
            <HiCreditCard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Solicitudes de liquidación</h1>
            <p className="text-sm text-gray-400">Todas las solicitudes de liquidación de equipos de eventos</p>
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
            <p className="text-xs uppercase tracking-wider text-gray-500">Pagadas</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.paid}</p>
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
        ) : settlements.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center">
              <HiCreditCard className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-sm font-semibold text-gray-300 mb-1">No hay solicitudes</p>
            <p className="text-xs text-gray-500">
              Los equipos podrán solicitar liquidación cuando sus eventos finalicen.
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
                        Evento
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Equipo / ID
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Fecha solicitud
                      </th>
                      {canApprove && (
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {paginatedSettlements.map((settlement) => (
                      <tr key={settlement.id} className="hover:bg-dark-bg/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-white font-semibold">
                          {settlement.event_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div className="font-semibold text-white">{settlement.business_name}</div>
                          <div className="text-xs text-gray-500">ID: {settlement.group_id || '—'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-semibold">
                          {settlement.requested_amount.toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}{' '}
                          {settlement.token_symbol}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 capitalize">
                          {settlement.method || 'efectivo'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                              settlement.status === 'pendiente'
                                ? 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20'
                                : settlement.status === 'pagado'
                                ? 'bg-positive/10 text-positive border border-positive/20'
                                : 'bg-negative/10 text-negative border border-negative/20'
                            }`}
                          >
                            {settlement.status.toUpperCase()}
                          </span>
                          {settlement.token_transfer_hash && (
                            <div className="mt-1">
                              {getEtherscanUrl(settlement.token_transfer_hash) ? (
                                <a
                                  href={getEtherscanUrl(settlement.token_transfer_hash)!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-accent-blue hover:text-primary-red transition-colors"
                                  title={`Ver en Etherscan: ${settlement.token_transfer_hash}`}
                                >
                                  <span>Ver en Etherscan</span>
                                </a>
                              ) : (
                                <div className="text-xs text-gray-500 font-mono" title={settlement.token_transfer_hash}>
                                  {truncateAddress(settlement.token_transfer_hash)}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {formatDateTime(settlement.created_at)}
                        </td>
                        {canApprove && (
                          <td className="px-6 py-4">
                            {settlement.status === 'pendiente' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(settlement)}
                                  disabled={processingId === settlement.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-positive/10 hover:bg-positive/20 text-positive border border-positive/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                                >
                                  <HiCheckCircle className="w-4 h-4" />
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => handleReject(settlement)}
                                  disabled={processingId === settlement.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-negative/10 hover:bg-negative/20 text-negative border border-negative/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                                >
                                  <HiXCircle className="w-4 h-4" />
                                  Rechazar
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 italic">Sin acciones</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </div>
      {settlements.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={settlements.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}
    </div>
  );
}

