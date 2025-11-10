import { useEffect, useMemo, useState } from 'react';
import {
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
  balance?: string;
}

type Movement = {
  id: string;
  type: 'fondos' | 'retiro' | 'transferencia';
  direction: 'entrante' | 'saliente';
  amount: number;
  currency: string;
  counterparty: string;
  description: string;
  status: 'completada' | 'pendiente' | 'fallida';
  created_at: string;
};

const mockMovements: Movement[] = [
  {
    id: 'CW-001',
    type: 'fondos',
    direction: 'entrante',
    amount: 50,
    currency: 'ETH',
    counterparty: 'Sepolia Faucet',
    description: 'Recarga de liquidez para pruebas',
    status: 'completada',
    created_at: '2024-11-02T10:30:00Z'
  },
  {
    id: 'CW-002',
    type: 'transferencia',
    direction: 'saliente',
    amount: 5.3,
    currency: 'ETH',
    counterparty: 'Wallet UFM Hackathon (0x9a...1234)',
    description: 'Fondeo para premio Hackathon',
    status: 'completada',
    created_at: '2024-11-02T12:00:00Z'
  },
  {
    id: 'CW-003',
    type: 'retiro',
    direction: 'saliente',
    amount: 1.2,
    currency: 'ETH',
    counterparty: 'Exchange interno',
    description: 'Retiro para pruebas de rendimiento',
    status: 'pendiente',
    created_at: '2024-11-03T08:45:00Z'
  },
  {
    id: 'CW-004',
    type: 'transferencia',
    direction: 'entrante',
    amount: 0.8,
    currency: 'ETH',
    counterparty: 'Wallet Café Blockchain',
    description: 'Liquidación de ventas del evento',
    status: 'completada',
    created_at: '2024-11-03T14:15:00Z'
  }
];

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

  const balanceFormatted = useMemo(() => {
    if (!status?.balance) return '—';
    const num = Number(status.balance);
    if (Number.isNaN(num)) return `${status.balance} ETH`;
    if (num === 0) return '0 ETH';
    if (num < 0.001) return `${num.toFixed(6)} ETH`;
    return `${num.toLocaleString('es-GT', { minimumFractionDigits: 4, maximumFractionDigits: 6 })} ETH`;
  }, [status?.balance]);

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
                <div className=" flex items-center justify-between">
                  <span className="text-gray-500">Red</span>
                  <span className="text-white font-semibold capitalize">{status.network}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Chain ID</span>
                  <span className="text-white font-semibold">{status.chainId}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500">RPC URL</span>
                  <p className="text-xs text-gray-400 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 break-words">
                    {status.rpcUrl}
                  </p>
                </div>
                <div className="border-t border-dark-border pt-3 flex items-center justify-between">
                  <span className="text-gray-500">Balance aproximado</span>
                  <span className="text-white font-semibold">{balanceFormatted}</span>
                </div>
              </div>
            )
          )}
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
            <h2 className="text-lg font-semibold text-white">Actividad reciente</h2>
            <p className="text-xs text-gray-500">
              Seguimiento de movimientos relevantes de la wallet central.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
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
              {mockMovements.map((movement) => (
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
                      <span className="text-gray-300 capitalize">{movement.type}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{movement.id}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {movement.counterparty}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">
                    {formatAmount(movement.amount, movement.currency)}
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
                    {movement.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

