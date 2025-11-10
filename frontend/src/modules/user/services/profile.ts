import api from '../../../services/api';

export interface UserProfile {
  user: {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    carnet_universitario: string;
    role: string;
    status?: string;
  };
  wallet: {
    balance: string;
    tokenSymbol: string;
    network: string;
  };
  rechargeSummary: {
    tokenSymbol: string;
    totalTokens: number;
    totalUsd: number;
    usdToTokenRate: number;
  };
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await api.get('/api/user/profile');
  return response.data;
}


