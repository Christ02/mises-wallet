import { UserWalletService } from '../services/userWalletService.js';
import { UserRepository } from '../repositories/userRepository.js';
import { WalletService } from '../services/walletService.js';
import { UserPaymentService } from '../services/userPaymentService.js';
import { UserRechargeService } from '../services/userRechargeService.js';
import { UserWithdrawalService } from '../services/userWithdrawalService.js';

export class WalletController {
  /**
   * GET /api/wallet/balance
   * El usuario solo ve su balance, no la dirección técnica
   */
  static async getBalance(req, res) {
    try {
      const userId = req.user.id;

      const [balance, rechargeSummary] = await Promise.all([
        UserWalletService.getBalance(userId),
        UserRechargeService.getUserRechargeSummary(userId)
      ]);

      res.status(200).json({
        balance: balance.balance,
        tokenSymbol: balance.currency,
        network: balance.network,
        rechargeSummary
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
      const { carnet, amount } = req.body;

      const numericAmount = parseFloat(amount);
      if (!numericAmount || numericAmount <= 0) {
        return res.status(400).json({
          error: 'Cantidad inválida'
        });
      }

      if (!carnet || typeof carnet !== 'string' || carnet.trim().length < 3) {
        return res.status(400).json({
          error: 'Carnet del destinatario inválido'
        });
      }

      const recipient = await UserRepository.findByCarnet(carnet.trim());
      if (!recipient || recipient.status !== 'activo') {
        return res.status(404).json({
          error: 'No se encontró un destinatario activo con ese carnet'
        });
      }

      if (recipient.id === userId) {
        return res.status(400).json({
          error: 'No puedes enviarte fondos a ti mismo'
        });
      }

      const recipientWallet = await WalletService.getUserWallet(recipient.id);
      if (!recipientWallet?.address) {
        return res.status(400).json({
          error: 'El destinatario no tiene una wallet habilitada'
        });
      }

      const metadata = {
        recipient_user_id: recipient.id,
        recipient_name: `${recipient.nombres} ${recipient.apellidos}`.trim(),
        recipient_carnet: recipient.carnet_universitario,
        to_address: recipientWallet.address
      };

      const result = await UserWalletService.sendTokens(userId, recipientWallet.address, numericAmount, metadata);

      res.status(200).json({
        message: 'Transacción enviada exitosamente',
        transactionHash: result.transactionHash,
        status: result.status,
        recipient: {
          id: recipient.id,
          nombres: recipient.nombres,
          apellidos: recipient.apellidos,
          carnet: recipient.carnet_universitario
        }
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
      });
    } catch (error) {
      console.error('Error en getHistory:', error);
      res.status(500).json({
        error: 'Error al obtener historial'
      });
    }
  }

  static async searchRecipients(req, res) {
    try {
      const requesterId = req.user.id;
      const { query = '', limit } = req.query;

      if (!query || query.toString().trim().length < 2) {
        return res.status(200).json({ recipients: [] });
      }

      const recipients = await UserRepository.searchActiveUsers(query.toString().trim(), limit);
      const filtered = recipients.filter((user) => user.id !== requesterId && user.wallet_address);

      const payload = filtered.map((user) => ({
        id: user.id,
        fullName: `${user.nombres} ${user.apellidos}`.trim(),
        carnet: user.carnet_universitario,
        email: user.email,
        walletAddress: user.wallet_address
      }));

      return res.status(200).json({ recipients: payload });
    } catch (error) {
      console.error('Error en searchRecipients:', error);
      return res.status(500).json({ error: 'Error al buscar destinatarios' });
    }
  }

  static async searchMerchants(req, res) {
    try {
      const { query = '', limit } = req.query;

      if (!query || query.toString().trim().length < 2) {
        return res.status(200).json({ merchants: [] });
      }

      const merchants = await UserPaymentService.searchMerchants(query.toString().trim(), limit);

      return res.status(200).json({ merchants });
    } catch (error) {
      console.error('Error en searchMerchants:', error);
      return res.status(500).json({ error: 'Error al buscar comercios' });
    }
  }

  static async payMerchant(req, res) {
    try {
      const userId = req.user.id;
      const { merchantId, groupId, amount } = req.body;

      const normalizedMerchantId =
        merchantId !== undefined && merchantId !== null && merchantId !== ''
          ? Number(merchantId)
          : undefined;

      if (!groupId && (normalizedMerchantId === undefined || Number.isNaN(normalizedMerchantId))) {
        return res.status(400).json({
          error: 'Identificador de comercio inválido'
        });
      }

      const normalizedGroupId = groupId ? String(groupId).trim() : undefined;

      const paymentResult = await UserPaymentService.payMerchant(userId, {
        merchantId: normalizedMerchantId,
        groupId: normalizedGroupId,
        amount
      });

      return res.status(200).json({
        message: 'Pago procesado correctamente',
        transactionHash: paymentResult.transaction.transactionHash,
        status: paymentResult.transaction.status,
        merchant: paymentResult.merchant
      });
    } catch (error) {
      console.error('Error en payMerchant:', error);
      return res.status(500).json({
        error: error.message || 'Error al procesar el pago'
      });
    }
  }

  static async recharge(req, res) {
    try {
      const userId = req.user.id;
      const {
        amountHayek,
        amountHc,
        amountUsd,
        cardNumber,
        cardHolder
      } = req.body || {};

      const tokenInput = amountHayek ?? amountHc;
      const tokenAmount = tokenInput !== undefined ? parseFloat(tokenInput) : undefined;
      const usdAmount = amountUsd !== undefined ? parseFloat(amountUsd) : undefined;

      if ((!tokenAmount || tokenAmount <= 0) && (!usdAmount || usdAmount <= 0)) {
        return res.status(400).json({ error: 'Cantidad inválida' });
      }

      const sanitizedCardNumber = typeof cardNumber === 'string' ? cardNumber.replace(/\s+/g, '') : '';
      if (!sanitizedCardNumber || sanitizedCardNumber.replace(/\D/g, '').length < 12) {
        return res.status(400).json({ error: 'Número de tarjeta inválido' });
      }

      const rechargeResult = await UserRechargeService.createRechargeTransaction(userId, {
        amountHayek: tokenAmount,
        amountUsd: usdAmount,
        cardNumber: sanitizedCardNumber,
        cardHolder
      });

      const summary = await UserRechargeService.getUserRechargeSummary(userId);

      return res.status(200).json({
        message: 'Recarga realizada exitosamente',
        tokenAmount: rechargeResult.tokenAmount,
        usdAmount: rechargeResult.usdAmount,
        usdToTokenRate: rechargeResult.rate,
        tokenSymbol: rechargeResult.tokenSymbol,
        balanceTokens: summary.totalTokens,
        balanceUsd: summary.totalUsd,
        rechargeSummary: summary,
        transaction: rechargeResult.transaction
      });
    } catch (error) {
      console.error('Error en recharge:', error);
      return res.status(500).json({
        error: error.message || 'Error al procesar la recarga'
      });
    }
  }

  static async requestWithdrawal(req, res) {
    try {
      const userId = req.user.id;
      const { amount, notes } = req.body || {};

      const request = await UserWithdrawalService.requestWithdrawal(userId, {
        amount,
        notes
      });

      return res.status(201).json({
        message: 'Solicitud de retiro creada correctamente',
        request
      });
    } catch (error) {
      console.error('Error en requestWithdrawal:', error);
      return res.status(400).json({ error: error.message || 'No se pudo crear la solicitud de retiro' });
    }
  }

  static async listWithdrawals(req, res) {
    try {
      const userId = req.user.id;
      const { limit, offset } = req.query;
      const requests = await UserWithdrawalService.listUserRequests(userId, {
        limit: Number.isNaN(Number(limit)) ? 20 : Number(limit),
        offset: Number.isNaN(Number(offset)) ? 0 : Number(offset)
      });
      return res.status(200).json({ withdrawals: requests });
    } catch (error) {
      console.error('Error en listWithdrawals:', error);
      return res.status(500).json({ error: error.message || 'Error al obtener solicitudes de retiro' });
    }
  }
}

