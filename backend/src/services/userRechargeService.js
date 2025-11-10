import { TransactionRepository } from '../repositories/transactionRepository.js';
import { CurrencyService } from './currencyService.js';
import { WalletService } from './walletService.js';
import { CentralWalletService } from './centralWalletService.js';

const determineCardBrand = (cardNumber) => {
  const sanitized = (cardNumber || '').replace(/\D/g, '');
  if (sanitized.startsWith('4')) return 'visa';
  if (/^(5[1-5])/.test(sanitized)) return 'mastercard';
  if (/^3[47]/.test(sanitized)) return 'amex';
  if (/^6(?:011|5)/.test(sanitized)) return 'discover';
  return 'desconocida';
};

const sanitizeNumber = (value) => {
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(numeric) ? numeric : 0;
};

export class UserRechargeService {
  static async createRechargeTransaction(userId, { amountHayek, amountUsd, cardNumber, cardHolder }) {
    const tokenRate = CurrencyService.getUsdToTokenRate();

    let tokenAmount = sanitizeNumber(amountHayek);
    let usdAmount = sanitizeNumber(amountUsd);

    if (!tokenAmount && usdAmount) {
      tokenAmount = CurrencyService.convertUsdToToken(usdAmount, tokenRate);
    }

    if (!usdAmount && tokenAmount) {
      usdAmount = CurrencyService.convertTokenToUsd(tokenAmount, tokenRate);
    }

    if (!tokenAmount || tokenAmount <= 0) {
      throw new Error('Cantidad inválida para recarga');
    }

    const sanitizedNumber = (cardNumber || '').replace(/\D/g, '');
    if (!sanitizedNumber || sanitizedNumber.length < 12) {
      throw new Error('Número de tarjeta inválido');
    }

    const cardLast4 = sanitizedNumber.slice(-4) || null;
    const cardBrand = determineCardBrand(sanitizedNumber);
    const description = cardLast4 ? `Recarga con tarjeta **** ${cardLast4}` : 'Recarga con tarjeta';

    const userWallet = await WalletService.getUserWallet(userId);
    if (!userWallet?.address) {
      throw new Error('El usuario no tiene una wallet asignada');
    }

    await CentralWalletService.ensureSettingsLoaded();
    const tokenSymbol = CentralWalletService.getTokenSymbol();

    const transferResult = await CentralWalletService.transferTokens(userWallet.address, tokenAmount);
    if (transferResult.status !== 'confirmed') {
      throw new Error('La transferencia desde la wallet central falló');
    }

    const transaction = await TransactionRepository.create({
      user_id: userId,
      type: 'recarga',
      status: 'completada',
      direction: 'entrante',
      amount: tokenAmount.toFixed(4),
      currency: tokenSymbol,
      description,
      metadata: {
        source: 'card',
        card_last4: cardLast4,
        card_brand: cardBrand,
        card_holder: cardHolder || null,
        token_amount: parseFloat(tokenAmount.toFixed(4)),
        token_symbol: tokenSymbol,
        token_decimals: CentralWalletService.getTokenDecimals(),
        token_contract: CentralWalletService.getTokenAddress(),
        token_transfer_hash: transferResult.hash,
        usd_amount: usdAmount ? parseFloat(usdAmount.toFixed(2)) : null,
        usd_to_token_rate: tokenRate
      }
    });

    return {
      transaction,
      tokenAmount: parseFloat(tokenAmount.toFixed(4)),
      usdAmount: usdAmount ? parseFloat(usdAmount.toFixed(2)) : null,
      rate: tokenRate,
      tokenSymbol
    };
  }

  static async getUserRechargeSummary(userId) {
    await CentralWalletService.ensureSettingsLoaded();
    const tokenSymbol = CentralWalletService.getTokenSymbol();

    const totalTokens = await TransactionRepository.sumAmountByUser(userId, {
      currency: tokenSymbol,
      type: 'recarga',
      direction: 'entrante',
      status: 'completada'
    });

    const rate = CurrencyService.getUsdToTokenRate();
    const totalUsd = CurrencyService.convertTokenToUsd(totalTokens, rate);

    return {
      tokenSymbol,
      totalTokens: parseFloat(totalTokens.toFixed(4)),
      totalUsd: parseFloat(totalUsd.toFixed(2)),
      usdToTokenRate: rate
    };
  }
}


