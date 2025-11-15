import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiCreditCard,
  HiDownload,
  HiExternalLink,
  HiRefresh,
  HiShieldCheck,
  HiSwitchHorizontal,
  HiClipboard,
  HiCheckCircle,
  HiArrowRight
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
  // Sepolia testnet
  if (isTransactionHash(hash)) {
    return `https://sepolia.etherscan.io/tx/${hash}`;
  }
  return `https://sepolia.etherscan.io/address/${hash}`;
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
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);
  
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 5;

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
      {/* Header */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-red to-primary-red/80 border border-primary-red/40 text-white flex items-center justify-center shadow-lg flex-shrink-0">
            <HiCreditCard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Wallet central</h1>
            <p className="text-sm text-gray-400">
              Controla la liquidez del banco central y los movimientos estratégicos.
            </p>
          </div>
        </div>
      </div>

      {/* Estado de la red - Card destacada */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Estado de la red</h2>
            <p className="text-xs text-gray-500">Información de conexión y configuración</p>
          </div>
          <button
            onClick={() => {
              refresh();
              fetchActivity();
              fetchSettlements();
              fetchWithdrawals();
            }}
            className="inline-flex items-center gap-2 px-3 py-2 bg-dark-bg border border-dark-border hover:border-primary-red/50 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all"
          >
            <HiRefresh className="w-4 h-4" />
            Refrescar
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-dark-bg/60 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-negative/10 border border-negative/30 text-negative px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : (
          status && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Balance destacado - Mitad izquierda */}
              <div className="bg-gradient-to-br from-primary-red/10 to-primary-red/5 border border-primary-red/20 rounded-xl p-5 flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs uppercase tracking-wider text-gray-500 mb-2">Balance disponible</span>
                  <span className="text-2xl font-bold text-white mb-2">{balanceFormatted}</span>
                  {totalSupplyFormatted && (
                    <div className="text-xs text-gray-400">
                      Total supply: <span className="text-gray-300 font-semibold">{totalSupplyFormatted}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de red y token - Mitad derecha */}
              <div className="bg-dark-bg/50 border border-dark-border rounded-lg p-4 space-y-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Red</span>
                    <span className="text-sm text-white font-semibold capitalize">{status.network}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Chain ID</span>
                    <span className="text-sm text-white font-semibold font-mono">{status.chainId}</span>
                  </div>
                  <div className="pt-2 border-t border-dark-border space-y-3">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Dirección</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-white font-mono break-all flex-1" title={status.address}>
                          {truncateAddress(status.address)}
                        </code>
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(status.address);
                              setCopiedAddress(true);
                              setTimeout(() => setCopiedAddress(false), 2000);
                            } catch (err) {
                              console.error('Error copying address', err);
                            }
                          }}
                          className="p-1.5 hover:bg-dark-bg rounded-lg transition-colors flex-shrink-0"
                          title="Copiar dirección"
                        >
                          {copiedAddress ? (
                            <HiCheckCircle className="w-4 h-4 text-positive" />
                          ) : (
                            <HiClipboard className="w-4 h-4 text-gray-400 hover:text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                    {status.token && (
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Contrato</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-white font-mono break-all flex-1" title={status.token.contract}>
                            {truncateAddress(status.token.contract)}
                          </code>
                          <button
                            onClick={async () => {
                              if (!status.token?.contract) return;
                              try {
                                await navigator.clipboard.writeText(status.token.contract);
                                setCopiedContract(true);
                                setTimeout(() => setCopiedContract(false), 2000);
                              } catch (err) {
                                console.error('Error copying contract', err);
                              }
                            }}
                            className="p-1.5 hover:bg-dark-bg rounded-lg transition-colors flex-shrink-0"
                            title="Copiar contrato"
                          >
                            {copiedContract ? (
                              <HiCheckCircle className="w-4 h-4 text-positive" />
                            ) : (
                              <HiClipboard className="w-4 h-4 text-gray-400 hover:text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {status.token && (
                    <div className="pt-2 border-t border-dark-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Símbolo</span>
                        <span className="text-sm text-white font-semibold">{status.token.symbol}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Solicitudes de liquidación */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">Solicitudes de liquidación</h2>
          <p className="text-xs text-gray-500">
            Gestiona las solicitudes de equipos que necesitan convertir su saldo a efectivo (100% del balance).
          </p>
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
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center">
                <HiCreditCard className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-sm font-semibold text-gray-300 mb-1">No hay solicitudes pendientes</p>
              <p className="text-xs text-gray-500">
                Los equipos podrán solicitar liquidación cuando sus eventos finalicen.
              </p>
            </div>
          ) : (
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
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {settlements.slice(0, ITEMS_PER_PAGE).map((settlement) => (
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
                              <HiExternalLink className="w-3 h-3" />
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
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>
        {settlements.length >= 1 && settlements.length <= ITEMS_PER_PAGE && (
          <div className="mt-4">
            <button
              onClick={() => navigate('/admin/central-wallet/settlements')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg text-sm font-medium transition-all"
            >
              Ver todas
              <HiArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Solicitudes de retiro */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">Solicitudes de retiro de usuarios</h2>
          <p className="text-xs text-gray-500">
            Revisa las solicitudes que los usuarios enviaron para llevar HayekCoin a cuentas externas.
          </p>
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
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center">
                <HiCreditCard className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-sm font-semibold text-gray-300 mb-1">No hay solicitudes de retiro pendientes</p>
              <p className="text-xs text-gray-500">
                Los usuarios podrán solicitar retiros desde su panel de usuario.
              </p>
            </div>
          ) : (
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
                  {withdrawals.slice(0, ITEMS_PER_PAGE).map((withdrawal) => (
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
          )}
        </div>
        {withdrawals.length >= 1 && withdrawals.length <= ITEMS_PER_PAGE && (
          <div className="mt-4">
            <button
              onClick={() => navigate('/admin/central-wallet/withdrawals')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg text-sm font-medium transition-all"
            >
              Ver todas
              <HiArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Actividad reciente */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">Actividad reciente</h2>
          <p className="text-xs text-gray-500">
            Seguimiento de movimientos relevantes de la wallet central.
          </p>
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
                  {movements.slice(0, ITEMS_PER_PAGE).map((movement) => (
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
          )}
        </div>
        {movements.length >= 1 && (
          <div className="mt-4">
            <button
              onClick={() => navigate('/admin/central-wallet/activity')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg text-sm font-medium transition-all"
            >
              Ver todas
              <HiArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


