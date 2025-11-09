import { WalletService } from './walletService.js';
import { EncryptionService } from './encryptionService.js';

export class BusinessWalletService {
  static async createWalletForBusiness(businessId) {
    const { EventBusinessWalletRepository } = await import('../repositories/eventBusinessWalletRepository.js');

    const walletData = WalletService.createWallet();
    const encryptedPrivateKey = EncryptionService.encrypt(walletData.privateKey);
    let encryptedMnemonic = null;

    if (walletData.mnemonic) {
      encryptedMnemonic = EncryptionService.encrypt(walletData.mnemonic);
    }

    const wallet = await EventBusinessWalletRepository.create({
      business_id: businessId,
      address: walletData.address,
      private_key_encrypted: encryptedPrivateKey,
      mnemonic_encrypted: encryptedMnemonic,
      network: 'sepolia'
    });

    return {
      id: wallet.id,
      address: wallet.address,
      network: wallet.network
    };
  }

  static async getWalletByBusinessId(businessId) {
    const { EventBusinessWalletRepository } = await import('../repositories/eventBusinessWalletRepository.js');
    return EventBusinessWalletRepository.findByBusinessId(businessId);
  }
}
