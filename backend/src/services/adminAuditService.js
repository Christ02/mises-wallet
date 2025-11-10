import { AuditLogRepository } from '../repositories/auditLogRepository.js';

const normalizeFilters = (filters = {}) => {
  const normalized = { ...filters };

  if (normalized.search) {
    normalized.search = normalized.search.trim();
  } else {
    delete normalized.search;
  }

  if (!normalized.action || normalized.action === 'Todos') {
    delete normalized.action;
  }

  if (!normalized.entity || normalized.entity === 'Todos') {
    delete normalized.entity;
  }

  if (!normalized.userId || Number.isNaN(Number(normalized.userId))) {
    delete normalized.userId;
  }

  if (!normalized.dateFrom) {
    delete normalized.dateFrom;
  }

  if (!normalized.dateTo) {
    delete normalized.dateTo;
  }

  normalized.limit = Number.isNaN(Number(filters.limit)) ? 25 : Math.min(Number(filters.limit), 200);
  normalized.offset = Number.isNaN(Number(filters.offset)) ? 0 : Number(filters.offset);

  return normalized;
};

const mapAuditLog = (log) => ({
  id: log.id,
  action: log.action,
  entity: log.entity,
  entity_id: log.entity_id,
  description: log.description,
  metadata: log.metadata || {},
  ip_address: log.ip_address,
  user_agent: log.user_agent,
  created_at: log.created_at,
  user: log.user
    ? {
        id: log.user.id,
        nombres: log.user.nombres,
        apellidos: log.user.apellidos,
        email: log.user.email,
        carnet: log.user.carnet_universitario
      }
    : null
});

export class AdminAuditService {
  static async listLogs(filters = {}) {
    const normalized = normalizeFilters(filters);
    const [logs, total] = await Promise.all([
      AuditLogRepository.findAll(normalized),
      AuditLogRepository.countAll(normalized)
    ]);

    return {
      data: logs.map(mapAuditLog),
      total,
      limit: normalized.limit,
      offset: normalized.offset
    };
  }
}

