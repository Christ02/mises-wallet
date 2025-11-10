const DEFAULT_USD_TO_TOKEN_RATE = parseFloat(
  process.env.USD_TO_HC_RATE || process.env.USD_TO_UFM_RATE || '1'
);

const sanitizeNumber = (value) => {
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(numeric) ? numeric : 0;
};

export class CurrencyService {
  static getUsdToTokenRate() {
    const envRate = parseFloat(process.env.USD_TO_HC_RATE || process.env.USD_TO_UFM_RATE || '0');
    if (!Number.isFinite(envRate) || envRate <= 0) {
      return DEFAULT_USD_TO_TOKEN_RATE;
    }
    return envRate;
  }

  static convertUsdToToken(amountUsd, customRate) {
    const rate = customRate ?? this.getUsdToTokenRate();
    const numericAmount = sanitizeNumber(amountUsd);
    if (!numericAmount) {
      return 0;
    }
    return parseFloat((numericAmount * rate).toFixed(4));
  }

  static convertTokenToUsd(amountToken, customRate) {
    const rate = customRate ?? this.getUsdToTokenRate();
    const numericAmount = sanitizeNumber(amountToken);
    if (!numericAmount) {
      return 0;
    }
    if (!rate) {
      return 0;
    }
    return parseFloat((numericAmount / rate).toFixed(2));
  }

  // Legacy aliases (UFM naming)
  static getUsdToUfmRate() {
    return this.getUsdToTokenRate();
  }

  static convertUsdToUfm(amountUsd, customRate) {
    return this.convertUsdToToken(amountUsd, customRate);
  }
}


