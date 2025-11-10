import { WalletService } from './walletService.js';

/**
 * Servicio para operaciones de wallet del usuario
 * TODAS las operaciones usan el userId/carnet, NO la dirección técnica
 */
export class UserWalletService {
  /**
   * Obtiene el balance del usuario
   * El usuario solo ve su balance, no sabe que hay una wallet técnica
   */
  static async getBalance(userId) {
    return await WalletService.getBalanceForUser(userId);
  }

  /**
   * Envía tokens desde la wallet del usuario
   * El usuario solo proporciona: destino y cantidad
   * NO necesita saber su dirección técnica
   */
  static async sendTokens(userId, toAddress, amount, metadata = {}, options = {}) {
    return await WalletService.sendTransaction(userId, toAddress, amount, metadata, options);
  }

  /**
   * Obtiene el historial de transacciones del usuario
   * Filtrado por userId, no por dirección técnica
   */
  static async getTransactionHistory(userId) {
    const result = await WalletService.getTransactions(userId);
    return result || [];
  }
}

