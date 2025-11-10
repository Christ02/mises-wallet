import { ethers } from 'ethers';
import { EncryptionService } from './encryptionService.js';
import { CentralWalletService } from './centralWalletService.js';
import { config } from '../config/config.js';

export class WalletService {
  static getProvider() {
    return new ethers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL ||
        config.sepolia?.rpcUrl ||
        'https://sepolia.infura.io/v3/YOUR_KEY'
    );
  }

  static getTokenContract(providerOrSigner) {
    return CentralWalletService.getTokenContract(providerOrSigner);
  }

  static getTokenSymbol() {
    return CentralWalletService.getTokenSymbol();
  }

  static getTokenDecimals() {
    return CentralWalletService.getTokenDecimals();
  }


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
      await CentralWalletService.ensureSettingsLoaded();
      const wallet = await this.getUserWallet(userId);
      if (!wallet) {
        return { balance: '0.0', network: 'sepolia', currency: this.getTokenSymbol() };
      }

      const provider = this.getProvider();
      const contract = this.getTokenContract(provider);
      const decimals = this.getTokenDecimals();
      const balance = await contract.balanceOf(wallet.address);

      return {
        balance: ethers.formatUnits(balance, decimals),
        network: wallet.network,
        currency: this.getTokenSymbol()
      };
    } catch (error) {
      console.error('Error al obtener balance:', error);
      return { balance: '0.0', network: 'sepolia', currency: this.getTokenSymbol() };
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
  static async sendTransaction(userId, toAddress, amount, metadata = {}, options = {}) {
    let txRecord;
    let metadataPayload;
    try {
      await CentralWalletService.ensureSettingsLoaded();
      const walletRecord = await this.getUserWallet(userId);
      if (!walletRecord) {
        throw new Error('Wallet no encontrada para este usuario');
      }

      const { TransactionRepository } = await import('../repositories/transactionRepository.js');
      const tokenSymbol = this.getTokenSymbol();
      const decimals = this.getTokenDecimals();
      const transactionType = options.transactionType || 'transferencia';

      const numericAmount =
        typeof amount === 'number'
          ? amount
          : parseFloat(typeof amount === 'string' ? amount : amount?.toString() || '0');

      if (!numericAmount || numericAmount <= 0) {
        throw new Error('Cantidad inválida para transferencia de token');
      }

      const currentBalanceInfo = await this.getBalanceForUser(userId);
      const availableBalance = parseFloat(currentBalanceInfo.balance || '0');
      if (!Number.isFinite(availableBalance) || availableBalance < numericAmount) {
        throw new Error(`Saldo insuficiente de ${tokenSymbol}. Disponible: ${availableBalance.toFixed(4)}`);
      }

      await CentralWalletService.ensureGasBalance(walletRecord.address);

      metadataPayload = {
        to_address: toAddress,
        token_symbol: tokenSymbol,
        token_decimals: decimals,
        token_amount: numericAmount,
        ...metadata
      };

      const amountFormatted = numericAmount.toFixed(4);
      const description =
        options.description ||
        (metadata?.recipient_name
          ? `Transferencia a ${metadata.recipient_name}`
          : `Transferencia hacia ${toAddress}`);

      txRecord = await TransactionRepository.create({
        user_id: userId,
        type: transactionType,
        status: 'pendiente',
        direction: 'saliente',
        amount: amountFormatted,
        currency: tokenSymbol,
        description,
        metadata: metadataPayload
      });

      const privateKey = await this.getDecryptedPrivateKey(userId);
      const provider = this.getProvider();
      const signer = new ethers.Wallet(privateKey, provider);
      const contract = this.getTokenContract(signer);
      const amountUnits = ethers.parseUnits(amountFormatted, decimals);

      const tx = await contract.transfer(toAddress, amountUnits);

      await TransactionRepository.updateById(txRecord.id, {
        reference: tx.hash,
        status: 'en_proceso',
        metadata: { ...metadataPayload, hash: tx.hash }
      });

      const receipt = await tx.wait();
      const finalStatus = receipt.status === 1 ? 'completada' : 'fallida';

      await TransactionRepository.updateById(txRecord.id, {
        status: finalStatus,
        completed_at: new Date(),
        metadata: {
          ...metadataPayload,
          hash: tx.hash,
          block_number: receipt.blockNumber,
          gas_used: receipt.gasUsed?.toString(),
          token_symbol: tokenSymbol,
          token_decimals: decimals,
          token_contract: CentralWalletService.getTokenAddress()
        }
      });

      return {
        transactionHash: tx.hash,
        status: finalStatus === 'completada' ? 'confirmed' : 'failed',
        transactionId: txRecord.id
      };
    } catch (error) {
      if (txRecord) {
        const { TransactionRepository } = await import('../repositories/transactionRepository.js');
        await TransactionRepository.updateById(txRecord.id, {
          status: 'fallida',
          completed_at: new Date(),
          metadata: {
            ...(txRecord?.metadata || metadataPayload || {}),
            error: error.message
          }
        });
      }
      throw new Error(`Error al enviar transacción: ${error.message}`);
    }
  }

  static async getTransactions(userId, options = {}) {
    const { TransactionRepository } = await import('../repositories/transactionRepository.js');
    return TransactionRepository.findByUserId(userId, options);
  }
}

