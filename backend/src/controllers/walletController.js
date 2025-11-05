import { UserWalletService } from '../services/userWalletService.js';

export class WalletController {
  /**
   * GET /api/wallet/balance
   * El usuario solo ve su balance, no la dirección técnica
   */
  static async getBalance(req, res) {
    try {
      const userId = req.user.id; // Del JWT token
      
      const balance = await UserWalletService.getBalance(userId);
      
      res.status(200).json({
        balance: balance.balance,
        currency: 'ETH',
        network: 'Sepolia Testnet'
        // NO incluimos address, private key, etc.
      });
    } catch (error) {
      console.error('Error en getBalance:', error);
      res.status(500).json({
        error: 'Error al obtener balance'
      });
    }
  }

  /**
   * POST /api/wallet/send
   * El usuario solo proporciona: destino y cantidad
   * NO necesita saber su dirección técnica
   */
  static async sendTokens(req, res) {
    try {
      const userId = req.user.id;
      const { to, amount } = req.body;
      
      // Validar que amount sea válido
      if (!amount || amount <= 0) {
        return res.status(400).json({
          error: 'Cantidad inválida'
        });
      }

      if (!to || !to.match(/^0x[a-fA-F0-9]{40}$/)) {
        return res.status(400).json({
          error: 'Dirección de destino inválida'
        });
      }

      const result = await UserWalletService.sendTokens(userId, to, amount);
      
      res.status(200).json({
        message: 'Transacción enviada exitosamente',
        transactionHash: result.transactionHash,
        status: result.status
        // NO incluimos dirección de origen
      });
    } catch (error) {
      console.error('Error en sendTokens:', error);
      res.status(500).json({
        error: error.message || 'Error al enviar transacción'
      });
    }
  }

  /**
   * GET /api/wallet/history
   * Historial de transacciones del usuario
   */
  static async getHistory(req, res) {
    try {
      const userId = req.user.id;
      
      const history = await UserWalletService.getTransactionHistory(userId);
      
      res.status(200).json({
        transactions: history
        // Sin información técnica de direcciones
      });
    } catch (error) {
      console.error('Error en getHistory:', error);
      res.status(500).json({
        error: 'Error al obtener historial'
      });
    }
  }
}

