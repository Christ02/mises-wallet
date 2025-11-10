import { AdminReportService } from '../services/adminReportService.js';

export class AdminReportController {
  static async list(req, res) {
    try {
      const { limit, offset } = req.query;
      const reports = await AdminReportService.listReports({
        limit,
        offset
      });
      res.status(200).json({ data: reports });
    } catch (error) {
      res.status(500).json({ error: error.message || 'Error al obtener reportes' });
    }
  }
}

