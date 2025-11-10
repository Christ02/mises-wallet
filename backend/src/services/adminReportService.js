import { ReportRepository } from '../repositories/reportRepository.js';

export class AdminReportService {
  static async listReports({ limit = 20, offset = 0 } = {}) {
    return ReportRepository.findAll({ limit, offset });
  }
}

