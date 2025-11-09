import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowDown, HiCreditCard, HiQuestionMarkCircle, HiX, HiChevronDown } from 'react-icons/hi';

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

  const quickAmounts = ['0.01', '0.05', '0.1', '0.5', '1.0', '5.0'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardExpanded) {
      setCardExpanded(true);
      return;
    }

    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      return;
    }
    setLoading(true);
    
    // TODO: Implementar lógica de recarga
    setTimeout(() => {
      setLoading(false);
      navigate('/wallet');
    }, 2000);
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="mt-5">
          <button
          onClick={() => navigate('/wallet')}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors bg-dark-card border border-dark-border px-3 py-2 rounded-lg"
          >
          <HiArrowLeft className="w-4 h-4" />
          <span>Volver a la wallet</span>
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
            <p className="text-sm sm:text-base text-gray-400">Agrega fondos a tu wallet en pocos pasos</p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
        >
          <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        </div>

        {/* Recharge Form */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad a Recargar (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all text-lg"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ETH
                </span>
              </div>
            </div>

            {/* Quick Amounts */}
            <div>
              <p className="text-sm text-gray-400 mb-3">Cantidades rápidas:</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount)}
                    className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-gray-300 hover:border-primary-red/50 hover:text-white transition-colors"
                  >
                    {quickAmount}
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
            La recarga se procesará en la red Sepolia Testnet. Los fondos son de prueba únicamente.
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
                <p>
                  Ingresa la cantidad que deseas recargar o selecciona una de las cantidades rápidas.
                </p>
                <p>
                  Una vez confirmada, la recarga se procesará en la red Sepolia Testnet. Los fondos son de prueba.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
  );
}

