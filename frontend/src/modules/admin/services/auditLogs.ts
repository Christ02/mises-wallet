import api from '../../../services/api';

export interface AuditLog {
  id: number;
  action: string;
  entity: string | null;
  entity_id: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user: {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    carnet: string;
  } | null;
}

export interface AuditLogFilters {
  search?: string;
  action?: string;
  entity?: string;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
  page?: number;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogListResponse> {
  const response = await api.get('/api/admin/audit/logs', {
    params: filters
  });
  return response.data;
}

