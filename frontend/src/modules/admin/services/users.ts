import api from '../../../services/api';

export interface AdminUserSummary {
  id: number;
  nombres: string;
  apellidos: string;
  carnet: string;
  email: string;
  status: string;
}

export async function searchAdminUsers(query: string, limit = 5): Promise<AdminUserSummary[]> {
  if (!query || !query.trim()) {
    return [];
  }

  const response = await api.get('/api/admin/users/search', {
    params: {
      query,
      limit
    }
  });

  return response.data.data ?? [];
}
