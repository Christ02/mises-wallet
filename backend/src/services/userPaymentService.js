import { EventBusinessRepository } from '../repositories/eventBusinessRepository.js';
import { UserWalletService } from './userWalletService.js';

export class UserPaymentService {
  static async searchMerchants(query, limit) {
    const rawMerchants = await EventBusinessRepository.searchWithWallets(query, limit);
    return rawMerchants
      .filter((merchant) => merchant.wallet_address)
      .map((merchant) => ({
        id: merchant.id,
        name: merchant.name,
        groupId: merchant.group_id,
        description: merchant.description,
        eventId: merchant.event_id,
        eventName: merchant.event_name,
        eventStatus: merchant.event_status,
        walletAddress: merchant.wallet_address
      }));
  }

  static async resolveMerchant({ merchantId, groupId }) {
    let merchant = null;
    if (merchantId) {
      merchant = await EventBusinessRepository.findByIdWithWallet(merchantId);
    } else if (groupId) {
      merchant = await EventBusinessRepository.findByGroupIdWithWallet(groupId);
    }

    if (!merchant || !merchant.wallet_address) {
      return null;
    }

    return merchant;
  }

  static async payMerchant(userId, { merchantId, groupId, amount }) {
    const merchant = await this.resolveMerchant({ merchantId, groupId });

    if (!merchant) {
      throw new Error('No se encontró un comercio válido con wallet disponible');
    }

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!numericAmount || numericAmount <= 0) {
      throw new Error('Cantidad inválida para el pago');
    }

    const metadata = {
      type: 'merchant_payment',
      merchant_business_id: merchant.id,
      merchant_group_id: merchant.group_id,
      merchant_name: merchant.name,
      merchant_event_id: merchant.event_id,
      merchant_event_name: merchant.event_name,
      merchant_wallet_address: merchant.wallet_address
    };

    const result = await UserWalletService.sendTokens(
      userId,
      merchant.wallet_address,
      numericAmount,
      metadata
    );

    return {
      transaction: result,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        groupId: merchant.group_id,
        eventName: merchant.event_name
      }
    };
  }
}


