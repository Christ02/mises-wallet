import { CentralWalletSettingsRepository } from '../repositories/centralWalletSettingsRepository.js';
import { EncryptionService } from './encryptionService.js';

const maskSecret = (value) => {
  if (!value) return null;
  if (value.length <= 6) return '*'.repeat(value.length);
  return `${value.slice(0, 3)}****${value.slice(-3)}`;
};

export class CentralWalletSettingsService {
  static cachedSettings = null;

  static async getSettings({ includeSecrets = false } = {}) {
    if (!this.cachedSettings) {
      this.cachedSettings = await CentralWalletSettingsRepository.getSettings();
    }

    if (!this.cachedSettings) {
      return null;
    }

    const decryptedPrivateKey = EncryptionService.decrypt(
      this.cachedSettings.private_key_encrypted
    );
    const decryptedSecretApiKey = this.cachedSettings.secret_api_key_encrypted
      ? EncryptionService.decrypt(this.cachedSettings.secret_api_key_encrypted)
      : null;

    return {
      bankName: this.cachedSettings.bank_name,
      network: this.cachedSettings.network,
      walletAddress: this.cachedSettings.wallet_address,
      walletPrivateKey: includeSecrets ? decryptedPrivateKey : null,
      publicApiKey: this.cachedSettings.public_api_key,
      secretApiKey: includeSecrets ? decryptedSecretApiKey : maskSecret(decryptedSecretApiKey),
      tokenSymbol: this.cachedSettings.token_symbol,
      tokenAddress: this.cachedSettings.token_address,
      tokenDecimals: this.cachedSettings.token_decimals
    };
  }

  static async getSettingsForOperations() {
    const settings = await this.getSettings({ includeSecrets: true });
    if (!settings) {
      return null;
    }
    return settings;
  }

  static async upsertSettings(payload, userId) {
    if (!payload.walletPrivateKey || !payload.walletAddress || !payload.tokenAddress) {
      throw new Error('La dirección de la wallet, token y la clave privada son obligatorias');
    }

    const encryptedPrivateKey = EncryptionService.encrypt(
      payload.walletPrivateKey.startsWith('0x') ? payload.walletPrivateKey : `0x${payload.walletPrivateKey}`
    );

    const encryptedSecretApiKey = payload.secretApiKey
      ? EncryptionService.encrypt(payload.secretApiKey)
      : null;

    const saved = await CentralWalletSettingsRepository.upsert({
      bank_name: payload.bankName || 'Banco Central',
      network: payload.network || 'sepolia',
      wallet_address: payload.walletAddress,
      private_key_encrypted: encryptedPrivateKey,
      public_api_key: payload.publicApiKey || null,
      secret_api_key_encrypted: encryptedSecretApiKey,
      token_symbol: payload.tokenSymbol || 'HC',
      token_address: payload.tokenAddress,
      token_decimals: payload.tokenDecimals || 18,
      updated_by: userId
    });

    this.cachedSettings = saved;

    return this.getSettings({ includeSecrets: false });
  }

  static resetCache() {
    this.cachedSettings = null;
  }
}


