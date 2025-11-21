const DEFAULT_GTQ_TO_TOKEN_RATE = parseFloat(
  process.env.GTQ_TO_HC_RATE || process.env.USD_TO_HC_RATE || process.env.USD_TO_UFM_RATE || '1'
);

const sanitizeNumber = (value) => {
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(numeric) ? numeric : 0;
};

export class CurrencyService {
  // Obtener tasa de cambio de Quetzales a Token (1 Q = 1 HC por defecto)
  static getGtqToTokenRate() {
    const envRate = parseFloat(process.env.GTQ_TO_HC_RATE || process.env.USD_TO_HC_RATE || process.env.USD_TO_UFM_RATE || '0');
    if (!Number.isFinite(envRate) || envRate <= 0) {
      return DEFAULT_GTQ_TO_TOKEN_RATE;
    }
    return envRate;
  }

  // Alias para mantener compatibilidad con código existente
  // Por compatibilidad, este método conserva el nombre pero usa GTQ como base.
  static getUsdToTokenRate() {
    return this.getGtqToTokenRate();
  }

  // Convertir Quetzales a Tokens
  static convertGtqToToken(amountGtq, customRate) {
    const rate = customRate ?? this.getGtqToTokenRate();
    const numericAmount = sanitizeNumber(amountGtq);
    if (!numericAmount) {
      return 0;
    }
    return parseFloat((numericAmount * rate).toFixed(4));
  }

  // Alias para mantener compatibilidad
  static convertUsdToToken(amountGtq, customRate) {
    return this.convertGtqToToken(amountGtq, customRate);
  }

  // Convertir Tokens a Quetzales
  static convertTokenToGtq(amountToken, customRate) {
    const rate = customRate ?? this.getGtqToTokenRate();
    const numericAmount = sanitizeNumber(amountToken);
    if (!numericAmount) {
      return 0;
    }
    if (!rate) {
      return 0;
    }
    return parseFloat((numericAmount / rate).toFixed(2));
  }

  // Alias para mantener compatibilidad
  static convertTokenToUsd(amountToken, customRate) {
    return this.convertTokenToGtq(amountToken, customRate);
  }

  // Legacy aliases (UFM naming)
  static getUsdToUfmRate() {
    return this.getGtqToTokenRate();
  }

  static convertUsdToUfm(amountUsd, customRate) {
    return this.convertGtqToToken(amountUsd, customRate);
  }
}


