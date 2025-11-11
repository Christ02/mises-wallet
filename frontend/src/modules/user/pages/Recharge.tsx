import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowDown, HiCreditCard, HiQuestionMarkCircle, HiX, HiChevronDown, HiExclamationCircle, HiCheckCircle } from 'react-icons/hi';
import api from '../../../services/api';

interface WalletBalanceSummary {
  balance: string;
  tokenSymbol: string;
  network: string;
}

interface RechargeSummary {
  tokenSymbol: string;
  totalTokens: number;
  totalUsd: number;
  usdToTokenRate: number;
}

export default function Recharge() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardExpanded, setCardExpanded] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [walletBalance, setWalletBalance] = useState<WalletBalanceSummary | null>(null);
  const [rechargeSummary, setRechargeSummary] = useState<RechargeSummary | null>(null);
  const [usdToTokenRate, setUsdToTokenRate] = useState(1);
  const [tokenSymbol, setTokenSymbol] = useState('HC');

  const quickAmounts = ['10', '25', '50', '75', '100', '250'];

  const formatTokenAmount = (value: number | string | null | undefined) => {
    const numeric = typeof value === 'string' ? parseFloat(value) : value ?? 0;
    if (!Number.isFinite(numeric)) return `0.0000`;
    if (numeric === 0) return '0.0000';
    if (numeric < 0.001) return numeric.toFixed(6);
    if (numeric < 1) return numeric.toFixed(4);
    return numeric.toFixed(4);
  };

  useEffect(() => {
    const loadBalances = async () => {
      try {
        const response = await api.get('/api/wallet/balance');
        const { balance, tokenSymbol: symbol, network, rechargeSummary: summary } = response.data || {};

        if (balance !== undefined && symbol) {
          setWalletBalance({
            balance: String(balance),
            tokenSymbol: symbol,
            network: network || 'Sepolia Testnet'
          });
          setTokenSymbol(symbol);
        }

        if (summary) {
          setRechargeSummary(summary);
          if (summary.usdToTokenRate) {
            setUsdToTokenRate(summary.usdToTokenRate);
          }
          if (summary.tokenSymbol) {
            setTokenSymbol(summary.tokenSymbol);
          }
        }
      } catch (err) {
        console.error('Error loading balances:', err);
      }
    };

    loadBalances();
  }, []);

  const convertedTokens = useMemo(() => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || !Number.isFinite(numericAmount)) {
      return '0.0000';
    }
    return (numericAmount * usdToTokenRate).toFixed(4);
  }, [amount, usdToTokenRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!cardExpanded) {
      setCardExpanded(true);
      return;
    }

    if (!cardNumber || !cardName || !cardExpiry || !cardCvv || !amount) {
      setErrorMessage('Completa la información de tarjeta y la cantidad a recargar.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setErrorMessage('Ingresa una cantidad válida mayor a 0.');
      return;
    }
    setLoading(true);

    try {
      const sanitizedNumber = cardNumber.replace(/\s/g, '');
      const response = await api.post('/api/wallet/recharge', {
        amountUsd: numericAmount,
        cardNumber: sanitizedNumber,
        cardHolder: cardName
      });

      const {
        tokenAmount,
        usdAmount,
        usdToTokenRate: newRate,
        tokenSymbol: newSymbol,
        balanceTokens,
        rechargeSummary: summary,
        network: updatedNetwork
      } = response.data || {};

      if (balanceTokens !== undefined && (newSymbol || tokenSymbol)) {
        const nextSymbol = newSymbol || tokenSymbol;
        const nextNetwork = updatedNetwork || walletBalance?.network || 'Sepolia Testnet';
        setWalletBalance({
          balance: String(balanceTokens),
          tokenSymbol: nextSymbol,
          network: nextNetwork
        });
      }

      if (summary) {
        setRechargeSummary(summary);
      }

      if (newRate) {
        setUsdToTokenRate(newRate);
      }
      if (newSymbol) {
        setTokenSymbol(newSymbol);
      }

      const finalTokenAmountRaw = tokenAmount ?? parseFloat(convertedTokens);
      const finalUsdAmount = usdAmount ?? numericAmount;
      const finalTokenAmount = Number.isFinite(finalTokenAmountRaw) ? finalTokenAmountRaw : 0;

      setSuccessMessage(
        `Recarga exitosa de ${finalTokenAmount.toFixed(4)} ${newSymbol || tokenSymbol} (≈ $${finalUsdAmount.toFixed(2)} USD).`
      );

      setAmount('');
      setCardNumber('');
      setCardName('');
      setCardExpiry('');
      setCardCvv('');
      setCardExpanded(false);

      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      console.error('Error processing recharge:', err);
      setErrorMessage(err.response?.data?.error || 'No se pudo procesar la recarga. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="mt-5">
          <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors bg-dark-card border border-dark-border px-3 py-2 rounded-lg"
          >
          <HiArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
          </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <HiCreditCard className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Recargar Wallet</h2>
            <p className="text-sm sm:text-base text-gray-400">Usa tu tarjeta para recibir HayekCoin (HC) en tu wallet universitaria</p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
        >
          <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        </div>

        {/* Wallet Overview */}
        <div className="bg-gradient-to-br from-primary-red/20 via-primary-red/10 to-primary-red/5 border border-primary-red/30 rounded-xl sm:rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">Saldo disponible</h3>
              <p className="text-xs sm:text-sm text-gray-400">HayekCoin listo para usar en la wallet</p>
            </div>
            <HiCreditCard className="w-10 h-10 text-primary-red/80" />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:space-x-6 space-y-3 sm:space-y-0">
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {formatTokenAmount(walletBalance?.balance)} {walletBalance?.tokenSymbol || tokenSymbol}
            </p>
            <div>
              <p className="text-sm sm:text-base text-gray-300">
                Red: {walletBalance?.network || 'Sepolia Testnet'}
              </p>
              <p className="text-xs text-gray-500">Tipo de cambio actual: 1 USD = {usdToTokenRate.toFixed(2)} {tokenSymbol}</p>
            </div>
          </div>
          {rechargeSummary && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-dark-card/60 border border-dark-border/60 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Recargas acumuladas</p>
                <p className="text-lg sm:text-xl font-semibold text-white">
                  {rechargeSummary.totalTokens.toFixed(4)} {rechargeSummary.tokenSymbol}
                </p>
              </div>
              <div className="bg-dark-card/60 border border-dark-border/60 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Equivalente estimado en USD</p>
                <p className="text-lg sm:text-xl font-semibold text-white">
                  ${rechargeSummary.totalUsd.toFixed(2)} USD
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  1 USD = {rechargeSummary.usdToTokenRate.toFixed(2)} {rechargeSummary.tokenSymbol}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Recharge Form */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="bg-negative/10 border border-negative/40 text-negative px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                <HiExclamationCircle className="w-5 h-5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-positive/10 border border-positive/40 text-positive px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                <HiCheckCircle className="w-5 h-5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad a Recargar (USD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all text-lg"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  USD
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Equivalente aproximado: <span className="text-white font-semibold">{convertedTokens}</span> {tokenSymbol}
              </p>
            </div>

            {/* Quick Amounts */}
            <div>
              <p className="text-sm text-gray-400 mb-3">Cantidades rápidas:</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => {
                      setAmount(quickAmount);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-gray-300 hover:border-primary-red/50 hover:text-white transition-colors"
                  >
                    ${quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Método de pago
              </label>
              <div className="bg-dark-bg border border-dark-border rounded-xl sm:rounded-2xl">
                <button
                  type="button"
                  onClick={() => setCardExpanded((prev) => !prev)}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-red/20 flex items-center justify-center">
                      <HiCreditCard className="w-5 h-5 text-primary-red" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">Tarjeta de crédito o débito</p>
                      <p className="text-xs text-gray-400">Visa, Mastercard y American Express</p>
                    </div>
                  </div>
                  <HiChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${cardExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {cardExpanded && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-6 sm:space-y-7 border-t border-dark-border">
                    <div className="h-px bg-dark-border/60" />
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                        Número de tarjeta
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, '').slice(0, 16);
                          const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                          setCardNumber(formatted);
                        }}
                        placeholder="0000 0000 0000 0000"
                        className="w-full px-4 py-3 bg-dark-bg/80 border border-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all text-base"
                        required={cardExpanded}
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                        Nombre en la tarjeta
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        placeholder="NOMBRE DEL TITULAR"
                        className="w-full px-4 py-3 bg-dark-bg/80 border border-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all text-base"
                        required={cardExpanded}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                          Fecha de expiración
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
                            const formatted = value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
                            setCardExpiry(formatted);
                          }}
                          placeholder="MM/AA"
                          className="w-full px-4 py-3 bg-dark-bg/80 border border-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all text-base"
                          required={cardExpanded}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                          CVV
                        </label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                          placeholder="123"
                          className="w-full px-4 py-3 bg-dark-bg/80 border border-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all text-base"
                          required={cardExpanded}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !amount || !cardNumber || !cardName || !cardExpiry || !cardCvv}
              className="w-full bg-primary-red hover:bg-primary-red/90 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <HiArrowDown className="w-5 h-5" />
                  <span>Recargar</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="bg-dark-card/50 border border-dark-border rounded-xl p-4">
          <p className="text-xs text-gray-400 text-center">
            Esta recarga es una simulación para pruebas: el cargo se captura en USD y se liquida instantáneamente en HayekCoin dentro de tu wallet.
          </p>
        </div>

      {showHelp && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Ayuda</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all"
                >
                  <HiX className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="space-y-4 text-sm sm:text-base text-gray-300">
                <p>Ingresa la cantidad en USD o selecciona una opción rápida para simular el pago con tarjeta.</p>
                <p>Automáticamente convertimos el monto a HayekCoin usando la tasa vigente. Esta operación es solo para pruebas y no mueve fondos reales.</p>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
  );
}

