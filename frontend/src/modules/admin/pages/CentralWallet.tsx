import { useEffect, useMemo, useState } from 'react';
import {
  HiCheckCircle,
  HiCreditCard,
  HiCurrencyDollar,
  HiDownload,
  HiLightningBolt,
  HiRefresh,
  HiShieldCheck,
  HiSwitchHorizontal,
  HiUpload
} from 'react-icons/hi';
import api, { API_BASE_URL } from '../../../services/api';

interface WalletStatusResponse {
  network: string;
  chainId: string;
  rpcUrl: string;
  address: string;
  token?: {
    contract: string;
    symbol: string;
    decimals: number;
    balance?: string;
    totalSupply?: string;
  };
}

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

const useWalletStatus = () => {
  const [status, setStatus] = useState<WalletStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/admin/central-wallet/status');
      setStatus(response.data);
    } catch (err: any) {
      console.error('Error fetching central wallet status', err);
      setError(err.response?.data?.error || 'No se pudo obtener el estado de la wallet central');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return { status, loading, error, refresh: fetchStatus };
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

export default function CentralWallet() {
  const { status, loading, error, refresh } = useWalletStatus();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(true);
  const [movementsError, setMovementsError] = useState<string | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [settlementsLoading, setSettlementsLoading] = useState(true);
  const [settlementsError, setSettlementsError] = useState<string | null>(null);
  const [processingSettlement, setProcessingSettlement] = useState<number | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [withdrawalsError, setWithdrawalsError] = useState<string | null>(null);
  const [processingWithdrawal, setProcessingWithdrawal] = useState<number | null>(null);

  const fetchActivity = async () => {
    setMovementsLoading(true);
    setMovementsError(null);
    try {
      const response = await api.get('/api/admin/central-wallet/activity');
      setMovements(response.data?.movements || []);
    } catch (err: any) {
      console.error('Error fetching central wallet activity', err);
      setMovementsError(err.response?.data?.error || 'No se pudo obtener la actividad de la wallet central');
    } finally {
      setMovementsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchSettlements = async () => {
    setSettlementsLoading(true);
    setSettlementsError(null);
    try {
      const response = await api.get('/api/admin/central-wallet/settlements');
      setSettlements(response.data?.settlements || []);
    } catch (err: any) {
      console.error('Error fetching settlements', err);
      setSettlementsError(err.response?.data?.error || 'No se pudo obtener las solicitudes de liquidación');
    } finally {
      setSettlementsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchWithdrawals = async () => {
    setWithdrawalsLoading(true);
    setWithdrawalsError(null);
    try {
      const response = await api.get('/api/admin/central-wallet/withdrawals');
      setWithdrawals(response.data?.withdrawals || []);
    } catch (err: any) {
      console.error('Error fetching withdrawals', err);
      setWithdrawalsError(err.response?.data?.error || 'No se pudieron obtener las solicitudes de retiro');
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApproveSettlement = async (settlementId: number) => {
    try {
      setProcessingSettlement(settlementId);
      await api.post(`/api/admin/central-wallet/settlements/${settlementId}/approve`);
      await fetchSettlements();
      await Promise.all([refresh(), fetchActivity()]);
    } catch (err: any) {
      console.error('Error approving settlement', err);
      setSettlementsError(err.response?.data?.error || 'No se pudo aprobar la liquidación');
    } finally {
      setProcessingSettlement(null);
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: number) => {
    try {
      setProcessingWithdrawal(withdrawalId);
      await api.post(`/api/admin/central-wallet/withdrawals/${withdrawalId}/approve`);
      await Promise.all([fetchWithdrawals(), fetchActivity(), refresh()]);
    } catch (err: any) {
      console.error('Error approving withdrawal', err);
      setWithdrawalsError(err.response?.data?.error || 'No se pudo aprobar la solicitud de retiro');
    } finally {
      setProcessingWithdrawal(null);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: number) => {
    const notes = prompt('Motivo del rechazo (opcional):') || undefined;
    try {
      setProcessingWithdrawal(withdrawalId);
      await api.post(`/api/admin/central-wallet/withdrawals/${withdrawalId}/reject`, { notes });
      await Promise.all([fetchWithdrawals(), fetchActivity(), refresh()]);
    } catch (err: any) {
      console.error('Error rejecting withdrawal', err);
      setWithdrawalsError(err.response?.data?.error || 'No se pudo rechazar la solicitud de retiro');
    } finally {
      setProcessingWithdrawal(null);
    }
  };

  const balanceFormatted = useMemo(() => {
    const balance = status?.token?.balance;
    const symbol = status?.token?.symbol || 'HC';
    if (!balance) return '—';
    const num = Number(balance);
    if (Number.isNaN(num)) return `${balance} ${symbol}`;
    if (Math.abs(num) >= 1_000_000_000) {
      return `${num.toExponential(4)} ${symbol}`;
    }
    return `${num.toLocaleString('es-GT', { maximumFractionDigits: 4 })} ${symbol}`;
  }, [status?.token?.balance, status?.token?.symbol]);

  const totalSupplyFormatted = useMemo(() => {
    const supply = status?.token?.totalSupply;
    const symbol = status?.token?.symbol || 'HC';
    if (!supply) return null;
    const num = Number(supply);
    if (Number.isNaN(num)) return `${supply} ${symbol}`;
    if (Math.abs(num) >= 1_000_000_000) {
      return `${num.toExponential(4)} ${symbol}`;
    }
    return `${num.toLocaleString('es-GT', { maximumFractionDigits: 4 })} ${symbol}`;
  }, [status?.token?.totalSupply, status?.token?.symbol]);

  return (
    <div className="space-y-6">
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-red to-primary-red/70 border border-primary-red/40 text-white flex items-center justify-center shadow-lg">
            <HiCreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Wallet central</h1>
            <p className="text-sm text-gray-400">
              Controla la liquidez del banco central y los movimientos estratégicos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end lg:self-auto">
          <a
            href={`${API_BASE_URL}/api/admin/reports`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg font-semibold transition-all"
          >
            <HiDownload className="w-5 h-5" />
            Exportar actividad
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Estado de la red</h2>
            <HiShieldCheck className="w-5 h-5 text-primary-red" />
          </div>
          {loading ? (
            <div className="space-y-3 text-gray-500">
              <div className="h-4 bg-dark-bg/60 rounded animate-pulse" />
              <div className="h-4 bg-dark-bg/60 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-dark-bg/60 rounded animate-pulse w-1/2" />
            </div>
          ) : error ? (
            <p className="text-sm text-negative">{error}</p>
          ) : (
            status && (
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Red</span>
                  <span className="text-white font-semibold capitalize">{status.network}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Chain ID</span>
                  <span className="text-white font-semibold">{status.chainId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Dirección</span>
                  <span className="text-white font-semibold truncate max-w-[60%]" title={status.address}>
                    {status.address}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500">RPC URL</span>
                  <p className="text-xs text-gray-400 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 break-words">
                    {status.rpcUrl}
                  </p>
                </div>
                {status.token && (
                  <div className="space-y-1 border-t border-dark-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Token</span>
                      <span className="text-white font-semibold">{status.token.symbol}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Contrato</span>
                      <span
                        className="text-white font-semibold truncate max-w-[60%]"
                        title={status.token.contract}
                      >
                        {status.token.contract}
                      </span>
                    </div>
                  </div>
                )}
                <div className="border-t border-dark-border pt-3 flex items-center justify-between">
                  <span className="text-gray-500">Balance disponible</span>
                  <span className="text-white font-semibold">{balanceFormatted}</span>
                </div>
                {totalSupplyFormatted && (
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Total supply</span>
                    <span className="text-gray-200 font-semibold">{totalSupplyFormatted}</span>
                  </div>
                )}
              </div>
            )
          )}
          <button
            onClick={() => {
              refresh();
              fetchActivity();
              fetchSettlements();
              fetchWithdrawals();
            }}
            className="inline-flex items-center gap-2 text-xs text-primary-red hover:text-primary-red/80 transition"
          >
            <HiRefresh className="w-4 h-4" />
            Refrescar
          </button>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Acciones rápidas</h2>
              <p className="text-xs text-gray-500">
                Ejecuta movimientos estratégicos controlados por el banco central.
              </p>
            </div>
            <HiLightningBolt className="w-6 h-6 text-primary-red" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button className="bg-dark-bg border border-dark-border rounded-xl p-4 flex flex-col items-start gap-3 hover:border-primary-red/40 transition">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <HiUpload className="w-4 h-4 text-primary-red" />
                Recarga de liquidez
              </span>
              <p className="text-xs text-gray-500 text-left">
                Deposita fondos desde un faucet o wallet autorizada para mantener la disponibilidad.
              </p>
            </button>
            <button className="bg-dark-bg border border-dark-border rounded-xl p-4 flex flex-col items-start gap-3 hover:border-primary-red/40 transition">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <HiSwitchHorizontal className="w-4 h-4 text-primary-red" />
                Transferir a comercio
              </span>
              <p className="text-xs text-gray-500 text-left">
                Envía fondos a uno de los equipos o comercios vinculados a eventos.
              </p>
            </button>
            <button className="bg-dark-bg border border-dark-border rounded-xl p-4 flex flex-col items-start gap-3 hover:border-primary-red/40 transition">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <HiCurrencyDollar className="w-4 h-4 text-primary-red" />
                Liquidar reservas
              </span>
              <p className="text-xs text-gray-500 text-left">
                Registra una liquidación hacia cuentas bancarias tradicionales para recompensas o premios.
              </p>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Solicitudes de liquidación</h2>
            <p className="text-xs text-gray-500">
              Gestiona las solicitudes de equipos que necesitan convertir su saldo a efectivo (100% del balance).
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          {settlementsLoading ? (
            <div className="py-10 text-center text-sm text-gray-500">
              <span className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin inline-block mr-3" />
              Cargando solicitudes...
            </div>
          ) : settlementsError ? (
            <div className="py-6 text-center text-sm text-negative">{settlementsError}</div>
          ) : settlements.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">
              No hay solicitudes pendientes. Los equipos podrán solicitar liquidación cuando sus eventos finalicen.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-dark-bg/60">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Equipo / ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Fecha solicitud
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {settlements.map((settlement) => (
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
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-[160px]" title={settlement.token_transfer_hash}>
                          {settlement.token_transfer_hash}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatDateTime(settlement.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {settlement.status === 'pendiente' ? (
                        <button
                          onClick={() => handleApproveSettlement(settlement.id)}
                          disabled={processingSettlement === settlement.id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg text-xs font-semibold transition disabled:opacity-60"
                        >
                          {processingSettlement === settlement.id ? (
                            <>
                              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              <HiCheckCircle className="w-4 h-4" />
                              Aprobar y liquidar
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">Sin acciones</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Solicitudes de retiro de usuarios</h2>
            <p className="text-xs text-gray-500">
              Revisa las solicitudes que los usuarios enviaron para llevar HayekCoin a cuentas externas.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          {withdrawalsLoading ? (
            <div className="py-10 text-center text-sm text-gray-500">
              <span className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin inline-block mr-3" />
              Cargando solicitudes...
            </div>
          ) : withdrawalsError ? (
            <div className="py-6 text-center text-sm text-negative">{withdrawalsError}</div>
          ) : withdrawals.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">
              No hay solicitudes de retiro pendientes.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-dark-bg/60">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Notas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {withdrawals.map((withdrawal) => (
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
                    <td className="px-6 py-4 text-sm text-gray-400">{withdrawal.notes || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {withdrawal.status === 'pendiente' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveWithdrawal(withdrawal.id)}
                            disabled={processingWithdrawal === withdrawal.id}
                            className="px-3 py-2 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg text-xs font-semibold transition disabled:opacity-60"
                          >
                            {processingWithdrawal === withdrawal.id ? 'Procesando...' : 'Aprobar'}
                          </button>
                          <button
                            onClick={() => handleRejectWithdrawal(withdrawal.id)}
                            disabled={processingWithdrawal === withdrawal.id}
                            className="px-3 py-2 bg-dark-bg border border-dark-border hover:border-negative text-negative rounded-lg text-xs font-semibold transition disabled:opacity-60"
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Sin acciones</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Actividad reciente</h2>
            <p className="text-xs text-gray-500">
              Seguimiento de movimientos relevantes de la wallet central.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          {movementsLoading ? (
            <div className="py-10 text-center text-sm text-gray-500">
              <span className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin inline-block mr-3" />
              Cargando actividad...
            </div>
          ) : movementsError ? (
            <div className="py-10 text-center text-sm text-negative">{movementsError}</div>
          ) : movements.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              Aún no hay movimientos registrados con la wallet central.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-dark-bg/60">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Movimiento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Contraparte
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Comentarios
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-dark-bg/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-semibold flex items-center gap-2">
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
                        <div className="text-xs text-gray-500 mt-1">{movement.reference}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {movement.counterparty}
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
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {movement.metadata?.description ||
                        movement.metadata?.note ||
                        movement.metadata?.reason ||
                        '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

