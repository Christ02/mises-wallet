import { AdminAuditService } from '../services/adminAuditService.js';

export class AdminAuditController {
  static async list(req, res) {
    try {
      const { search, action, entity, userId, dateFrom, dateTo, limit, offset, page } = req.query;

      let normalizedOffset = offset;
      let normalizedLimit = limit;

      if (page && !offset) {
        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const pageSize = Math.max(parseInt(limit, 10) || 25, 1);
        normalizedOffset = (pageNumber - 1) * pageSize;
        normalizedLimit = pageSize;
      }

      const response = await AdminAuditService.listLogs({
        search,
        action,
        entity,
        userId,
        dateFrom,
        dateTo,
        limit: normalizedLimit,
        offset: normalizedOffset
      });

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message || 'Error al obtener logs de auditoría' });
    }
  }
}

