import { WithdrawalRequestRepository } from '../repositories/withdrawalRequestRepository.js';
import { WalletService } from './walletService.js';
import { CentralWalletService } from './centralWalletService.js';
import { UserRepository } from '../repositories/userRepository.js';
import EmailService from './emailService.js';

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

    // Enviar correo de recibo digital al usuario
    try {
      const user = await UserRepository.findById(request.user_id);
      if (user && user.email) {
        const userName = `${user.nombres} ${user.apellidos}`;
        const receiptHtml = EmailService.generateWithdrawalReceipt({
          userName,
          amount: request.amount,
          tokenSymbol: request.token_symbol,
          txHash: transactionHash,
          date: updated.updated_at || updated.created_at
        });

        await EmailService.sendEmail({
          to: user.email,
          subject: 'Recibo Digital - Retiro Aprobado - Mises Wallet',
          html: receiptHtml
        });
      }
    } catch (emailError) {
      // No fallar la aprobación si el correo falla, solo loguear
      console.error('Error enviando correo de recibo de retiro:', emailError);
    }

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

    const updated = await WithdrawalRequestRepository.updateStatus(requestId, {
      status: 'rechazado',
      processed_by: adminId,
      notes
    });

    // Enviar correo de notificación de rechazo al usuario
    try {
      const user = await UserRepository.findById(request.user_id);
      if (user && user.email) {
        const userName = `${user.nombres} ${user.apellidos}`;
        const rejectionHtml = EmailService.generateWithdrawalRejection({
          userName,
          amount: request.amount,
          tokenSymbol: request.token_symbol,
          notes: notes || null,
          date: updated.updated_at || updated.created_at
        });

        await EmailService.sendEmail({
          to: user.email,
          subject: 'Notificación - Solicitud de Retiro Rechazada - Mises Wallet',
          html: rejectionHtml
        });
      }
    } catch (emailError) {
      // No fallar el rechazo si el correo falla, solo loguear
      console.error('Error enviando correo de rechazo de retiro:', emailError);
    }

    return updated;
  }
}


