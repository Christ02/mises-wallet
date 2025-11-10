import { WithdrawalRequestRepository } from '../repositories/withdrawalRequestRepository.js';
import { WalletService } from './walletService.js';
import { CentralWalletService } from './centralWalletService.js';

export class UserWithdrawalService {
  static async requestWithdrawal(userId, { amount, notes }) {
    await CentralWalletService.ensureSettingsLoaded();
    const tokenSymbol = CentralWalletService.getTokenSymbol();

    const numericAmount =
      typeof amount === 'number'
        ? amount
        : parseFloat(typeof amount === 'string' ? amount : amount?.toString() || '0');

    if (!numericAmount || numericAmount <= 0) {
      throw new Error('Cantidad inválida para retirar');
    }

    const existingPending = await WithdrawalRequestRepository.findPendingByUser(userId);
    if (existingPending) {
      throw new Error('Ya tienes una solicitud de retiro en proceso');
    }

    const balanceInfo = await WalletService.getBalanceForUser(userId);
    const available = parseFloat(balanceInfo.balance || '0');
    if (numericAmount > available) {
      throw new Error(`Saldo insuficiente para retirar. Disponible: ${available.toFixed(4)} ${tokenSymbol}`);
    }

    const request = await WithdrawalRequestRepository.create({
      user_id: userId,
      amount: numericAmount,
      token_symbol: tokenSymbol,
      notes
    });

    return request;
  }

  static async listUserRequests(userId, options) {
    return WithdrawalRequestRepository.findByUser(userId, options);
  }

  static async listAll({ limit, offset }) {
    return WithdrawalRequestRepository.findAll({ limit, offset });
  }

  static async approveWithdrawal({ requestId, adminId, txHash }) {
    const request = await WithdrawalRequestRepository.findById(requestId);
    if (!request) {
      throw new Error('Solicitud de retiro no encontrada');
    }
    if (!['pendiente', 'en_proceso'].includes(request.status)) {
      throw new Error('La solicitud ya fue procesada');
    }

    await CentralWalletService.ensureSettingsLoaded();
    const centralAddress = CentralWalletService.getCentralWalletAddress();
    let transactionHash = txHash || null;

    if (!transactionHash) {
      const transferResult = await WalletService.sendTransaction(
        request.user_id,
        centralAddress,
        request.amount,
        {
          context: 'user_withdrawal',
          withdrawal_request_id: requestId,
          processed_by_admin: adminId
        },
        {
          transactionType: 'retiro',
          description: 'Retiro aprobado hacia el banco central'
        }
      );

      transactionHash = transferResult.transactionHash;
    }

    const updated = await WithdrawalRequestRepository.updateStatus(requestId, {
      status: 'completado',
      processed_by: adminId,
      tx_hash: transactionHash
    });

    return updated;
  }

  static async rejectWithdrawal({ requestId, adminId, notes }) {
    const request = await WithdrawalRequestRepository.findById(requestId);
    if (!request) {
      throw new Error('Solicitud de retiro no encontrada');
    }
    if (!['pendiente', 'en_proceso'].includes(request.status)) {
      throw new Error('La solicitud ya fue procesada');
    }

    return WithdrawalRequestRepository.updateStatus(requestId, {
      status: 'rechazado',
      processed_by: adminId,
      notes
    });
  }
}


