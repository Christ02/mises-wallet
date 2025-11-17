import { ethers } from 'ethers';
import { EncryptionService } from './encryptionService.js';
import { CentralWalletService } from './centralWalletService.js';
import { config } from '../config/config.js';
import { UserRepository } from '../repositories/userRepository.js';
import EmailService from './emailService.js';

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

      // Esperar el receipt con timeout de 5 minutos (300 segundos)
      let receipt;
      try {
        receipt = await Promise.race([
          tx.wait(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout esperando confirmación de transacción')), 300000)
          )
        ]);
      } catch (waitError) {
        // Si hay timeout o error, verificar el estado de la transacción en la blockchain
        console.warn(`Timeout o error esperando receipt para tx ${tx.hash}, verificando estado...`);
        const txStatus = await this.verifyTransactionStatus(tx.hash);
        if (txStatus) {
          receipt = txStatus;
        } else {
          // Si no se puede verificar, dejar en 'en_proceso' para verificación posterior
          console.warn(`No se pudo verificar el estado de la transacción ${tx.hash}, quedará en 'en_proceso'`);
          return {
            transactionHash: tx.hash,
            status: 'pending',
            transactionId: txRecord.id
          };
        }
      }

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

      // Enviar correo de notificación de envío al remitente y recepción al destinatario
      if (finalStatus === 'completada') {
        // Obtener información del remitente
        let sender = null;
        try {
          sender = await UserRepository.findById(userId);
        } catch (error) {
          console.error('Error obteniendo información del remitente:', error);
        }

        // Enviar correo de notificación de envío al remitente
        if (sender && sender.email) {
          try {
            const senderName = `${sender.nombres} ${sender.apellidos}`;
            const toName = metadataPayload?.recipient_name || metadataPayload?.merchant_name || null;
            const sendHtml = EmailService.generateSendNotification({
              userName: senderName,
              amount: numericAmount.toFixed(4),
              tokenSymbol,
              toName,
              txHash: tx.hash,
              date: new Date()
            });

            await EmailService.sendEmail({
              to: sender.email,
              subject: 'Notificación - Transferencia Enviada - Mises Wallet',
              html: sendHtml
            });
          } catch (emailError) {
            console.error('Error enviando correo de notificación de envío:', emailError);
          }
        }

        // Verificar si el destinatario es un usuario del sistema y enviar notificación de recepción
        try {
          const { WalletRepository } = await import('../repositories/walletRepository.js');
          const recipientWallet = await WalletRepository.findByAddress(toAddress.toLowerCase());
          if (recipientWallet && recipientWallet.user_id) {
            const recipient = await UserRepository.findById(recipientWallet.user_id);
            if (recipient && recipient.email) {
              // Crear transacción entrante para el receptor
              const recipientTx = await TransactionRepository.create({
                user_id: recipientWallet.user_id,
                type: metadataPayload?.type === 'merchant_payment' ? 'pago' : 'transferencia',
                status: 'completada',
                direction: 'entrante',
                amount: numericAmount.toFixed(4),
                currency: tokenSymbol,
                description: metadataPayload?.recipient_name 
                  ? `Transferencia de ${metadataPayload.recipient_name}`
                  : `Transferencia recibida`,
                reference: tx.hash,
                metadata: {
                  ...metadataPayload,
                  hash: tx.hash,
                  block_number: receipt.blockNumber,
                  from_address: walletRecord.address,
                  sender_name: sender ? `${sender.nombres} ${sender.apellidos}` : null,
                  token_symbol: tokenSymbol,
                  token_decimals: decimals,
                  token_contract: CentralWalletService.getTokenAddress()
                },
                completed_at: new Date()
              });

              // Enviar correo de notificación de recepción
              const recipientName = `${recipient.nombres} ${recipient.apellidos}`;
              const fromName = sender ? `${sender.nombres} ${sender.apellidos}` : null;
              const receiveHtml = EmailService.generateReceiveNotification({
                userName: recipientName,
                amount: numericAmount.toFixed(4),
                tokenSymbol,
                fromName,
                txHash: tx.hash,
                date: new Date()
              });

              await EmailService.sendEmail({
                to: recipient.email,
                subject: 'Notificación - Transferencia Recibida - Mises Wallet',
                html: receiveHtml
              });
            }
          }
        } catch (receiveError) {
          // No fallar si no se puede notificar al receptor
          console.error('Error notificando receptor de transferencia:', receiveError);
        }
      }

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

  /**
   * Verifica el estado de una transacción en la blockchain
   * @param {string} txHash - Hash de la transacción
   * @returns {Promise<object|null>} - Receipt de la transacción o null si no se encuentra
   */
  static async verifyTransactionStatus(txHash) {
    try {
      const provider = this.getProvider();
      const receipt = await provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      console.error(`Error verificando transacción ${txHash}:`, error.message);
      return null;
    }
  }

  /**
   * Verifica y actualiza transacciones que están en estado 'en_proceso'
   * Este método puede ser llamado periódicamente por un cron job
   * @param {number} maxAgeMinutes - Máximo tiempo en minutos para considerar una transacción como fallida si no se confirma
   * @returns {Promise<{checked: number, updated: number, failed: number}>}
   */
  static async checkPendingTransactions(maxAgeMinutes = 30) {
    const { TransactionRepository } = await import('../repositories/transactionRepository.js');
    
    try {
      // Obtener todas las transacciones en estado 'en_proceso' con hash
      const pendingTxs = await TransactionRepository.findByStatus('en_proceso');
      
      const maxAge = new Date();
      maxAge.setMinutes(maxAge.getMinutes() - maxAgeMinutes);
      
      let checked = 0;
      let updated = 0;
      let failed = 0;

      for (const tx of pendingTxs) {
        if (!tx.reference) {
          // Si no tiene hash, marcar como fallida si es muy antigua
          if (new Date(tx.created_at) < maxAge) {
            await TransactionRepository.updateById(tx.id, {
              status: 'fallida',
              completed_at: new Date(),
              metadata: {
                ...(tx.metadata || {}),
                error: 'Transacción sin hash y sin confirmar después del tiempo límite'
              }
            });
            failed++;
          }
          continue;
        }

        checked++;
        const receipt = await this.verifyTransactionStatus(tx.reference);
        
        if (receipt) {
          // Transacción confirmada
          const finalStatus = receipt.status === 1 ? 'completada' : 'fallida';
          await TransactionRepository.updateById(tx.id, {
            status: finalStatus,
            completed_at: new Date(),
            metadata: {
              ...(tx.metadata || {}),
              hash: tx.reference,
              block_number: receipt.blockNumber,
              gas_used: receipt.gasUsed?.toString(),
              verified_at: new Date().toISOString()
            }
          });
          updated++;
        } else {
          // Si no se encuentra el receipt y la transacción es muy antigua, marcar como fallida
          const txDate = new Date(tx.created_at);
          if (txDate < maxAge) {
            await TransactionRepository.updateById(tx.id, {
              status: 'fallida',
              completed_at: new Date(),
              metadata: {
                ...(tx.metadata || {}),
                error: 'Transacción no confirmada después del tiempo límite',
                verified_at: new Date().toISOString()
              }
            });
            failed++;
          }
        }
      }

      return { checked, updated, failed };
    } catch (error) {
      console.error('Error verificando transacciones pendientes:', error);
      throw error;
    }
  }
}

