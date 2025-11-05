import { ethers } from 'ethers';
import { EncryptionService } from './encryptionService.js';

export class WalletService {
  /**
   * Crea una nueva wallet para Sepolia testnet
   * SOLO USO INTERNO - El usuario nunca ve esto
   */
  static createWallet() {
    const wallet = ethers.Wallet.createRandom();
    
    return {
      address: wallet.address.toLowerCase(),
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || null
    };
  }

  /**
   * Guarda una wallet encriptada silenciosamente
   * El usuario NO sabe que esto está pasando
   */
  static async saveWallet(walletData, userId) {
    const { WalletRepository } = await import('../repositories/walletRepository.js');
    
    const encryptedPrivateKey = EncryptionService.encrypt(walletData.privateKey);
    
    let encryptedMnemonic = null;
    if (walletData.mnemonic) {
      encryptedMnemonic = EncryptionService.encrypt(walletData.mnemonic);
    }
    
    const wallet = await WalletRepository.create({
      user_id: userId,
      address: walletData.address,
      private_key_encrypted: encryptedPrivateKey,
      mnemonic_encrypted: encryptedMnemonic,
      network: 'sepolia'
    });
    
    // NO retornamos información sensible al usuario
    return {
      id: wallet.id,
      network: wallet.network,
      created_at: wallet.created_at
    };
  }

  /**
   * Obtiene la wallet de un usuario por su ID
   * SOLO para uso interno del backend
   */
  static async getUserWallet(userId) {
    const { WalletRepository } = await import('../repositories/walletRepository.js');
    return await WalletRepository.findByUserId(userId);
  }

  /**
   * Obtiene el balance de la wallet del usuario
   * El usuario solo ve "balance", no la dirección técnica
   */
  static async getBalanceForUser(userId) {
    try {
      const wallet = await this.getUserWallet(userId);
      if (!wallet) {
        return { balance: '0.0', network: 'sepolia' };
      }

      const { config } = await import('../config/config.js');
      const provider = new ethers.JsonRpcProvider(
        process.env.SEPOLIA_RPC_URL || config.sepolia?.rpcUrl || 'https://sepolia.infura.io/v3/YOUR_KEY'
      );
      
      const balance = await provider.getBalance(wallet.address);
      
      // Retornamos solo el balance, NO la dirección
      return {
        balance: ethers.formatEther(balance),
        network: wallet.network
      };
    } catch (error) {
      console.error('Error al obtener balance:', error);
      return { balance: '0.0', network: 'sepolia' };
    }
  }

  /**
   * Desencripta la private key SOLO para operaciones internas
   * ⚠️ NUNCA exponer al frontend
   */
  static async getDecryptedPrivateKey(userId) {
    const wallet = await this.getUserWallet(userId);
    if (!wallet) {
      throw new Error('Wallet no encontrada para este usuario');
    }
    
    const { WalletRepository } = await import('../repositories/walletRepository.js');
    const fullWallet = await WalletRepository.findById(wallet.id);
    
    const decryptedKey = EncryptionService.decrypt(fullWallet.private_key_encrypted);
    return decryptedKey;
  }

  /**
   * Envía una transacción desde la wallet del usuario
   * El usuario solo necesita su carnet (ya autenticado)
   */
  static async sendTransaction(userId, toAddress, amount) {
    try {
      const privateKey = await this.getDecryptedPrivateKey(userId);
      const wallet = new ethers.Wallet(privateKey);
      
      const { config } = await import('../config/config.js');
      const provider = new ethers.JsonRpcProvider(
        process.env.SEPOLIA_RPC_URL || config.sepolia?.rpcUrl || 'https://sepolia.infura.io/v3/YOUR_KEY'
      );
      
      const connectedWallet = wallet.connect(provider);
      
      const tx = await connectedWallet.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(amount.toString())
      });
      
      // Retornamos solo el hash de la transacción, NO la dirección de la wallet
      return {
        transactionHash: tx.hash,
        status: 'pending'
      };
    } catch (error) {
      throw new Error(`Error al enviar transacción: ${error.message}`);
    }
  }
}

