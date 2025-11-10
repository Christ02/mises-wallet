import api from '../../../services/api';

export interface AdminTransaction {
  id: number;
  reference: string | null;
  type: string;
  status: string;
  direction: string;
  amount: string;
  currency: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  user: {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    carnet: string;
  } | null;
}

export interface TransactionFilters {
  search?: string;
  status?: string;
  type?: string;
  direction?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
  page?: number;
}

export interface TransactionListResponse {
  data: AdminTransaction[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchTransactions(filters: TransactionFilters = {}): Promise<TransactionListResponse> {
  const response = await api.get('/api/admin/transactions', {
    params: filters
  });
  return response.data;
}

