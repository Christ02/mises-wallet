import api from '../../../services/api';

export interface CentralWalletConfig {
  bankName: string;
  network: string;
  walletAddress: string;
  walletPrivateKey?: string;
  publicApiKey?: string;
  secretApiKey?: string;
  tokenSymbol: string;
  tokenAddress: string;
  tokenDecimals: number;
}

export async function fetchCentralWalletConfig(): Promise<Partial<CentralWalletConfig> | null> {
  const response = await api.get('/api/admin/central-wallet/config');
  return response.data || null;
}

export async function updateCentralWalletConfig(payload: CentralWalletConfig) {
  const response = await api.put('/api/admin/central-wallet/config', payload);
  return response.data;
}


