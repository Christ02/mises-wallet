import { CentralWalletService } from '../services/centralWalletService.js';

export class CentralWalletController {
  static async status(_req, res) {
    try {
      const status = await CentralWalletService.getStatus();
      res.status(200).json(status);
    } catch (error) {
      res.status(500).json({ error: error.message || 'Error al obtener estado de la wallet central' });
    }
  }
}

