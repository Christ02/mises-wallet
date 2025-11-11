import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowUp, HiCheckCircle, HiExclamationCircle, HiQuestionMarkCircle, HiSearch, HiUserCircle, HiX } from 'react-icons/hi';
import api from '../../../services/api';

interface RecipientOption {
  id: number;
  fullName: string;
  carnet: string;
  email: string;
  walletAddress: string;
}

export default function Send() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientOption | null>(null);
  const [recipientResults, setRecipientResults] = useState<RecipientOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState('HC');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedRecipient) {
        setError('Selecciona un destinatario válido');
        setLoading(false);
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (!parsedAmount || parsedAmount <= 0) {
        setError('Ingresa una cantidad válida');
        setLoading(false);
        return;
      }

      await api.post('/api/wallet/send', {
        carnet: selectedRecipient.carnet,
        amount: parsedAmount
      });
      navigate('/transactions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar fondos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    const trimmedQuery = searchTerm.trim();

    if (!trimmedQuery || trimmedQuery.length < 2) {
      setRecipientResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      setHighlightIndex(-1);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await api.get('/api/wallet/recipients/search', {
          params: { query: trimmedQuery, limit: 10 }
        });
        setRecipientResults(response.data?.recipients || []);
        setShowDropdown(true);
        setHighlightIndex(-1);
      } catch (fetchError) {
        console.error('Error fetching recipients', fetchError);
        setRecipientResults([]);
        setShowDropdown(false);
        setHighlightIndex(-1);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [searchTerm, selectedRecipient]);

  useEffect(() => {
    const loadTokenSymbol = async () => {
      try {
        const response = await api.get('/api/wallet/balance');
        if (response.data?.tokenSymbol) {
          setTokenSymbol(response.data.tokenSymbol);
        }
      } catch (err) {
        console.error('Error fetching wallet symbol', err);
      }
    };

    loadTokenSymbol();
  }, []);

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
            <HiArrowUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Enviar HayekCoin</h2>
            <p className="text-sm sm:text-base text-gray-400">Envía {tokenSymbol} a otro carnet universitario</p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
        >
          <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        </div>

        {/* Send Form */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                <HiExclamationCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Recipient Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Carnet universitario del destinatario
              </label>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedRecipient(null);
                    setError('');
                    setHighlightIndex(-1);
                  }}
                  onFocus={() => {
                    if (recipientResults.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  onKeyDown={(e) => {
                    if (!showDropdown || recipientResults.length === 0) {
                      return;
                    }

                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHighlightIndex((prev) => {
                        const next = prev + 1;
                        return next >= recipientResults.length ? 0 : next;
                      });
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightIndex((prev) => {
                        const next = prev - 1;
                        if (next < 0) {
                          return recipientResults.length - 1;
                        }
                        return next;
                      });
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      const indexToUse = highlightIndex >= 0 ? highlightIndex : 0;
                      const recipientToSelect = recipientResults[indexToUse];
                      if (recipientToSelect) {
                        setSelectedRecipient(recipientToSelect);
                        setSearchTerm(`${recipientToSelect.fullName} · ${recipientToSelect.carnet}`);
                        setShowDropdown(false);
                        setHighlightIndex(-1);
                      }
                    } else if (e.key === 'Escape') {
                      setShowDropdown(false);
                      setHighlightIndex(-1);
                    }
                  }}
                  placeholder="Busca por carnet, nombre o correo"
                  className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all text-sm"
                />
                {showDropdown && (
                  <div className="absolute z-20 mt-2 w-full bg-dark-bg border border-dark-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-4 text-sm text-gray-400">
                        Buscando destinatarios...
                      </div>
                    ) : recipientResults.length === 0 ? (
                      <div className="py-4 px-4 text-sm text-gray-500">
                        No encontramos resultados para esa búsqueda.
                      </div>
                    ) : (
                      recipientResults.map((recipient) => (
                        <button
                          key={recipient.id}
                          type="button"
                          onMouseDown={() => {
                            setSelectedRecipient(recipient);
                            setSearchTerm(`${recipient.fullName} · ${recipient.carnet}`);
                            setShowDropdown(false);
                            setHighlightIndex(-1);
                          }}
                          onClick={() => {
                            setSelectedRecipient(recipient);
                            setSearchTerm(`${recipient.fullName} · ${recipient.carnet}`);
                            setShowDropdown(false);
                            setHighlightIndex(-1);
                          }}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                            highlightIndex >= 0 && recipientResults[highlightIndex]?.id === recipient.id
                              ? 'bg-primary-red/10 border-l-2 border-primary-red'
                              : 'hover:bg-dark-card'
                          }`}
                        >
                          <HiUserCircle className="w-8 h-8 text-primary-red/80 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{recipient.fullName}</p>
                            <p className="text-xs text-gray-400 truncate">{recipient.carnet}</p>
                            <p className="text-xs text-gray-500 truncate">{recipient.email}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Escribe al menos 2 caracteres y selecciona al destinatario correcto de la lista.
              </p>
            </div>

            {selectedRecipient && (
              <div className="bg-dark-bg/60 border border-dark-border rounded-lg px-4 py-3 flex items-start gap-3">
                <HiCheckCircle className="w-6 h-6 text-positive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-semibold">{selectedRecipient.fullName}</p>
                  <p className="text-xs text-gray-400">Carnet: {selectedRecipient.carnet}</p>
                  <p className="text-xs text-gray-500">Correo: {selectedRecipient.email}</p>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad ({tokenSymbol})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all text-lg"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {tokenSymbol}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !amount || !selectedRecipient}
              className="w-full bg-primary-red hover:bg-primary-red/90 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <HiArrowUp className="w-5 h-5" />
                  <span>Enviar</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Warning */}
        <div className="bg-accent-yellow/10 border border-accent-yellow/50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <HiExclamationCircle className="w-5 h-5 text-accent-yellow flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-accent-yellow mb-1">Advertencia</p>
              <p className="text-xs text-gray-300">
                Las transacciones en blockchain son irreversibles. Verifica cuidadosamente el carnet y la cantidad antes de confirmar.
              </p>
            </div>
          </div>
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
                <p>Busca al destinatario por su carnet, nombre o correo y selecciona la opción correcta antes de continuar.</p>
                <p>Revisa la cantidad y confirma: las transacciones de HayekCoin no se pueden revertir una vez enviadas.</p>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
  );
}

