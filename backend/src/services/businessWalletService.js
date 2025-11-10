import { WalletService } from './walletService.js';
import { EncryptionService } from './encryptionService.js';
import { CentralWalletService } from './centralWalletService.js';
import { ethers } from 'ethers';

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

  static async getBalanceForBusiness(businessId) {
    const walletRecord = await this.getWalletByBusinessId(businessId);
    if (!walletRecord?.address) {
      throw new Error('El negocio no tiene una wallet asignada');
    }
    await CentralWalletService.ensureSettingsLoaded();
    const provider = CentralWalletService.getProvider();
    const contract = CentralWalletService.getTokenContract(provider);
    const decimals = CentralWalletService.getTokenDecimals();
    const balance = await contract.balanceOf(walletRecord.address);
    return {
      address: walletRecord.address,
      balanceTokens: parseFloat(ethers.formatUnits(balance, decimals))
    };
  }

  static async transferFullBalanceToCentralWallet(businessId, amountTokens) {
    const walletRecord = await this.getWalletByBusinessId(businessId);
    if (!walletRecord?.address) {
      throw new Error('El negocio no tiene una wallet asignada');
    }

    await CentralWalletService.ensureSettingsLoaded();

    const privateKey = EncryptionService.decrypt(walletRecord.private_key_encrypted);
    if (!privateKey) {
      throw new Error('No se pudo recuperar la clave privada del negocio');
    }

    const provider = CentralWalletService.getProvider();
    const signer = new ethers.Wallet(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`, provider);

    await CentralWalletService.ensureGasBalance(signer.address);

    const contract = CentralWalletService.getTokenContract(signer);
    const decimals = CentralWalletService.getTokenDecimals();

    const amountUnits = ethers.parseUnits(
      typeof amountTokens === 'string' ? amountTokens : amountTokens.toString(),
      decimals
    );

    const centralAddress = CentralWalletService.getCentralWalletAddress();
    const tx = await contract.transfer(centralAddress, amountUnits);
    const receipt = await tx.wait();

    return {
      hash: tx.hash,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      token_symbol: CentralWalletService.getTokenSymbol(),
      decimals
    };
  }
}
