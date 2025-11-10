import { AdminTransactionService } from '../services/adminTransactionService.js';

export class AdminTransactionController {
  static async list(req, res) {
    try {
      const { search, status, type, direction, dateFrom, dateTo, limit, offset, page } = req.query;

      let normalizedOffset = offset;
      let normalizedLimit = limit;

      if (page && !offset) {
        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const pageSize = Math.max(parseInt(limit, 10) || 25, 1);
        normalizedOffset = (pageNumber - 1) * pageSize;
        normalizedLimit = pageSize;
      }

      const response = await AdminTransactionService.listTransactions({
        search,
        status,
        type,
        direction,
        dateFrom,
        dateTo,
        limit: normalizedLimit,
        offset: normalizedOffset
      });

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message || 'Error al obtener transacciones' });
    }
  }
}

