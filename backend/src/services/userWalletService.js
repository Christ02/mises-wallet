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
  static async sendTokens(userId, toAddress, amount) {
    return await WalletService.sendTransaction(userId, toAddress, amount);
  }

  /**
   * Obtiene el historial de transacciones del usuario
   * Filtrado por userId, no por dirección técnica
   */
  static async getTransactionHistory(userId) {
    // Implementar consulta a la blockchain o tabla de transacciones
    // Usando el userId, no la dirección
    const wallet = await WalletService.getUserWallet(userId);
    if (!wallet) {
      return [];
    }

    // Aquí consultarías la blockchain o tu tabla de transacciones
    // usando wallet.address internamente, pero retornando solo datos
    // relevantes para el usuario sin mencionar direcciones técnicas
    return [];
  }
}

