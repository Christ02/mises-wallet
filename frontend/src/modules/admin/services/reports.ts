import api from '../../../services/api';

export interface GeneratedReport {
  id: number;
  name: string;
  entity: string;
  filters: Record<string, unknown>;
  columns: string[];
  file_path: string | null;
  format: string;
  status: string;
  error_message: string | null;
  created_at: string;
  user: {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
  } | null;
}

export async function fetchReports(limit = 20, offset = 0): Promise<GeneratedReport[]> {
  const response = await api.get('/api/admin/reports', {
    params: { limit, offset }
  });
  return response.data.data ?? [];
}

