import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiShoppingCart, 
  HiQrcode, 
  HiExclamationCircle, 
  HiArrowRight,
  HiQuestionMarkCircle,
  HiX,
  HiOfficeBuilding,
  HiCheckCircle,
  HiSearch
} from 'react-icons/hi';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../../services/api';

interface WalletBalance {
  balance: string;
  tokenSymbol: string;
  network: string;
}

interface MerchantOption {
  id: number;
  name: string;
  groupId: string;
  description?: string;
  eventName?: string;
  walletAddress?: string;
}

export default function Pay() {
  const navigate = useNavigate();
  const [merchantQuery, setMerchantQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantOption | null>(null);
  const [merchantResults, setMerchantResults] = useState<MerchantOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [usdToTokenRate, setUsdToTokenRate] = useState(1);
  const [tokenSymbol, setTokenSymbol] = useState('HC');
  const formatMerchantLabel = (merchant: MerchantOption) =>
    merchant.groupId ? `${merchant.name} · ${merchant.groupId}` : merchant.name;

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const response = await api.get('/api/wallet/balance');
        const { balance: tokenBalance, tokenSymbol: symbol, network, rechargeSummary } = response.data || {};
        if (tokenBalance !== undefined && symbol) {
          setBalance({
            balance: String(tokenBalance),
            tokenSymbol: symbol,
            network: network || 'Sepolia Testnet'
          });
          setTokenSymbol(symbol);
        }
        if (rechargeSummary?.usdToTokenRate) {
          setUsdToTokenRate(rechargeSummary.usdToTokenRate);
        }
      } catch (err: any) {
        console.error('Error loading balance:', err);
      } finally {
        setBalanceLoading(false);
      }
    };
    loadBalance();
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      // Limpiar el scanner de QR cuando el componente se desmonte
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.stop().catch(() => {
          // Ignorar errores al detener
        });
        qrCodeScannerRef.current.clear();
        qrCodeScannerRef.current = null;
      }
    };
  }, []);

  // Inicializar el scanner cuando el modal se abre
  useEffect(() => {
    if (!isScanning) return;

    // Esperar a que el DOM se actualice y el elemento qr-reader esté disponible
    const timer = setTimeout(async () => {
      try {
        // Verificar que el elemento existe
        const qrReaderElement = document.getElementById('qr-reader');
        if (!qrReaderElement) {
          setScanError('El elemento del scanner no está disponible. Por favor, intenta nuevamente.');
          setIsScanning(false);
          return;
        }

        // Limpiar cualquier scanner anterior
        if (qrCodeScannerRef.current) {
          try {
            await qrCodeScannerRef.current.stop();
            qrCodeScannerRef.current.clear();
          } catch (e) {
            // Ignorar errores al limpiar
          }
          qrCodeScannerRef.current = null;
        }

        // Crear el scanner
        qrCodeScannerRef.current = new Html5Qrcode('qr-reader');
        const scanner = qrCodeScannerRef.current;

        // Detectar si es móvil para ajustar el tamaño del área de escaneo
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        // Reducir el tamaño del área de escaneo para que sea más compacto
        const qrboxSize = isMobile ? 180 : 220;

        // Configuración optimizada para móviles
        const config = {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        // Intentar primero con la cámara trasera
        let cameraIdOrConfig: string | { facingMode: string } = { facingMode: 'environment' };
        
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            const backCamera = devices.find(device => 
              device.label.toLowerCase().includes('back') || 
              device.label.toLowerCase().includes('rear') ||
              device.label.toLowerCase().includes('environment')
            );
            if (backCamera) {
              cameraIdOrConfig = backCamera.id;
            } else {
              cameraIdOrConfig = devices[0].id;
            }
          }
        } catch (deviceErr) {
          console.log('No se pudieron obtener dispositivos, usando facingMode');
        }

        // Iniciar el escaneo
        await scanner.start(
          cameraIdOrConfig,
          config,
          async (decodedText, decodedResult) => {
            console.log('🔍 QR detectado:', decodedText);
            console.log('📊 Resultado completo:', decodedResult);
            await handleQrDetected(decodedText);
          },
          (errorMessage) => {
            // Solo loguear errores críticos, ignorar errores normales de escaneo continuo
            if (errorMessage && !errorMessage.includes('NotFoundException')) {
              console.log('⚠️ Error de escaneo:', errorMessage);
            }
          }
        );
      } catch (err: any) {
        console.error('Error starting QR scanner:', err);
        
        if (err.name === 'NotAllowedError' || err.message?.includes('permission') || err.message?.includes('Permission denied')) {
          setScanError('No se pudo acceder a la cámara. Por favor, permite el acceso a la cámara en la configuración de tu navegador.');
        } else if (err.name === 'NotFoundError' || err.message?.includes('camera') || err.message?.includes('No camera')) {
          setScanError('No se encontró una cámara en tu dispositivo. Verifica que tu dispositivo tenga una cámara disponible.');
        } else if (err.message?.includes('NotSupportedError') || err.message?.includes('not supported')) {
          setScanError('Tu navegador no soporta el escaneo de códigos QR. Intenta con Chrome, Safari o Firefox en su última versión.');
        } else {
          setScanError('No pudimos iniciar el escáner. Verifica los permisos de la cámara o intenta nuevamente.');
        }
        setIsScanning(false);
        
        if (qrCodeScannerRef.current) {
          try {
            await qrCodeScannerRef.current.stop();
            qrCodeScannerRef.current.clear();
          } catch (stopErr) {
            // Ignorar errores al detener
          }
          qrCodeScannerRef.current = null;
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [isScanning]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    const trimmedQuery = merchantQuery.trim();

    if (
      selectedMerchant &&
      trimmedQuery === formatMerchantLabel(selectedMerchant)
    ) {
      setMerchantResults([selectedMerchant]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    if (!trimmedQuery || trimmedQuery.length < 2) {
      setMerchantResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await api.get('/api/wallet/merchants/search', {
          params: { query: trimmedQuery }
        });
        const merchants: MerchantOption[] = (response.data?.merchants || []).map((merchant: any) => ({
          id: merchant.id,
          name: merchant.name,
          groupId: merchant.groupId,
          description: merchant.description,
          eventName: merchant.eventName,
          walletAddress: merchant.walletAddress
        }));
        setMerchantResults(merchants);
        setShowDropdown(true);
      } catch (err) {
        console.error('Error searching merchants:', err);
        setMerchantResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [merchantQuery, selectedMerchant]);

  const stopScan = async () => {
    if (qrCodeScannerRef.current) {
      try {
        await qrCodeScannerRef.current.stop();
        qrCodeScannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping QR scanner:', err);
      }
      qrCodeScannerRef.current = null;
    }
    setIsScanning(false);
    setScanError('');
  };

  const parseQrPayload = (raw: string): { groupId?: string; amount?: number } => {
    if (!raw) {
      console.log('❌ QR vacío');
      return {};
    }

    const trimmed = raw.trim();
    console.log('📝 QR raw:', raw);
    console.log('📝 QR trimmed:', trimmed);

    if (!trimmed) {
      console.log('❌ QR trimmed vacío');
      return {};
    }

    // JSON
    if (trimmed.startsWith('{')) {
      try {
        const obj = JSON.parse(trimmed);
        console.log('✅ QR es JSON:', obj);
        return {
          groupId: obj.groupId || obj.group_id || obj.group || undefined,
          amount: obj.amount ? Number(obj.amount) : undefined
        };
      } catch (e) {
        console.log('⚠️ Error parseando JSON:', e);
      }
    }

    // URL style
    try {
      if (trimmed.includes('://') || trimmed.startsWith('http') || trimmed.startsWith('https')) {
        const url = new URL(trimmed);
        const groupId =
          url.searchParams.get('groupId') ||
          url.searchParams.get('group_id') ||
          url.searchParams.get('group');
        const amountParam = url.searchParams.get('amount');
        console.log('✅ QR es URL:', { groupId, amount: amountParam });
        return {
          groupId: groupId || undefined,
          amount: amountParam ? Number(amountParam) : undefined
        };
      }
    } catch (e) {
      console.log('⚠️ Error parseando URL:', e);
    }

    // key=value;key2=value2 o key=value&key2=value2
    try {
      const normalized = trimmed.replace(/;/g, '&').replace(/,/g, '&');
      if (normalized.includes('=')) {
        const params = new URLSearchParams(normalized);
        const groupId =
          params.get('groupId') ||
          params.get('group_id') ||
          params.get('group') ||
          params.get('grupo') ||
          undefined;
        const amountParam =
          params.get('amount') || params.get('monto') || params.get('value') || undefined;
        console.log('✅ QR es key=value:', { groupId, amount: amountParam });
        return {
          groupId,
          amount: amountParam ? Number(amountParam) : undefined
        };
      }
    } catch (e) {
      console.log('⚠️ Error parseando key=value:', e);
    }

    // plain groupId - este es el caso más común para los QRs generados
    // El QR se genera con solo el groupId como texto plano
    // Limpiar solo espacios en blanco y saltos de línea, pero mantener el groupId completo
    const cleanGroupId = trimmed.replace(/[\s\n\r\t]/g, '').trim();
    console.log('✅ QR es texto plano (groupId):', cleanGroupId);
    
    // Si después de limpiar espacios está vacío, usar el trimmed original
    if (cleanGroupId.length > 0) {
      return { groupId: cleanGroupId };
    }
    
    // Fallback: usar el trimmed original
    return { groupId: trimmed };
  };

  const handleQrDetected = async (rawValue: string) => {
    console.log('🎯 Procesando QR detectado:', rawValue);
    
    // Detener el scanner inmediatamente para evitar múltiples detecciones
    if (qrCodeScannerRef.current) {
      try {
        await qrCodeScannerRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }

    setScanError('');
    const { groupId, amount: qrAmount } = parseQrPayload(rawValue);

    console.log('📋 Resultado del parseo:', { groupId, amount: qrAmount });

    if (!groupId || groupId.length === 0) {
      console.error('❌ No se encontró groupId en el QR');
      setScanError(
        `No pudimos encontrar un group-id válido en el código QR. Valor escaneado: "${rawValue.substring(0, 50)}". Verifica que sea un QR emitido por HayekCoin.`
      );
      setIsScanning(false);
      return;
    }

    console.log('✅ GroupId encontrado:', groupId);

    try {
      setIsSearching(true);
      const response = await api.get('/api/wallet/merchants/search', {
        params: { query: groupId }
      });
      const merchants: MerchantOption[] = (response.data?.merchants || []).map((merchant: any) => ({
        id: merchant.id,
        name: merchant.name,
        groupId: merchant.groupId,
        description: merchant.description,
        eventName: merchant.eventName,
        walletAddress: merchant.walletAddress
      }));

      if (!merchants.length) {
        setScanError(
          'No encontramos un comercio asociado a este QR. Verifica que el código sea correcto o intenta de nuevo.'
        );
        setIsScanning(false);
        return;
      }

      const merchant = merchants[0];
      setSelectedMerchant(merchant);
      setMerchantQuery(formatMerchantLabel(merchant));
      setMerchantResults(merchants);
      if (qrAmount && !Number.isNaN(qrAmount)) {
        setAmount(String(qrAmount));
      }
      setErrorMessage('');
      setSuccessMessage(`Comercio cargado desde QR: ${merchant.name}.`);
      setIsScanning(false);
      
      // Limpiar el scanner
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.clear();
        qrCodeScannerRef.current = null;
      }
    } catch (err) {
      console.error('Error resolving merchant from QR:', err);
      setScanError('Ocurrió un error al procesar el QR. Intenta nuevamente.');
      setIsScanning(false);
      
      // Limpiar el scanner en caso de error
      if (qrCodeScannerRef.current) {
        try {
          await qrCodeScannerRef.current.stop();
          qrCodeScannerRef.current.clear();
        } catch (stopErr) {
          console.error('Error stopping scanner after error:', stopErr);
        }
        qrCodeScannerRef.current = null;
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMerchant = (merchant: MerchantOption) => {
    setSelectedMerchant(merchant);
    setMerchantQuery(formatMerchantLabel(merchant));
    setShowDropdown(false);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!selectedMerchant) {
      setErrorMessage('Selecciona un comercio válido para continuar.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMessage('Ingresa una cantidad válida.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/api/wallet/merchants/pay', {
        merchantId: selectedMerchant.id,
        groupId: selectedMerchant.groupId,
        amount: parsedAmount
      });
      const message = response.data?.message || `Pago enviado a ${selectedMerchant.name}.`;
      setSuccessMessage(message);
      setMerchantQuery('');
      setMerchantResults([]);
      setSelectedMerchant(null);
      setAmount('');
      setTimeout(() => navigate('/transactions'), 1500);
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setErrorMessage(err.response?.data?.error || 'No se pudo procesar el pago. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.00';
    if (num < 0.001) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const convertTokenToGtq = (tokenBalance: string) => {
    const tokens = parseFloat(tokenBalance);
    if (!tokens || !usdToTokenRate) return '0.00';
    return (tokens / usdToTokenRate).toFixed(2);
  };

  return (
    <div>
        {/* Header Section */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <HiShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Pagar</h2>
              <p className="text-sm sm:text-base text-gray-400">Realiza pagos con tu wallet</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
          >
            <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary-red/20 via-primary-red/10 to-primary-red/5 border border-primary-red/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 relative overflow-hidden mt-8 sm:mt-10 lg:mt-12">
          <div className="absolute inset-0 bg-primary-red/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">Saldo Disponible</h3>
                <p className="text-sm sm:text-base text-gray-300">Fondos para realizar pagos</p>
              </div>
              <HiShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-primary-red/80" />
            </div>
            {balanceLoading ? (
              <div className="h-12 sm:h-16 flex items-center mt-4">
                <div className="animate-pulse bg-dark-bg/50 h-8 sm:h-12 w-32 sm:w-48 rounded"></div>
              </div>
            ) : balance && (
              <div className="mt-4">
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    {formatBalance(balance.balance)}
                  </span>
                  <span className="text-lg sm:text-xl text-gray-300 font-semibold">
                    {balance.tokenSymbol || tokenSymbol}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400">≈ Q{convertTokenToGtq(balance.balance)} GTQ</p>
              </div>
            )}
          </div>
        </div>

        {/* ESCANEAR QR Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 font-semibold">ESCANEAR QR</h3>
          <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md mb-6 sm:mb-8">
                <div className="w-full aspect-square bg-dark-bg border-2 border-dashed border-dark-border rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <HiQrcode className="w-32 h-32 sm:w-40 sm:h-40 text-gray-600" />
                  <div className="absolute inset-0 bg-primary-red/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-semibold text-sm sm:text-base">Tap para escanear</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsScanning(true)}
                className="w-full max-w-md px-6 py-4 sm:py-5 bg-primary-red hover:bg-primary-red/90 text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <HiQrcode className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Escanear Código QR</span>
              </button>
            </div>
          </div>
        </div>

        {/* PAGO MANUAL Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 font-semibold">PAGO MANUAL</h3>
          <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-8">
              {/* Merchant/Address Input */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2 sm:mb-3">
                    Nombre del comercio o grupo-id del equipo organizador
                </label>
                <div className="relative">
                  <HiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    value={merchantQuery}
                    onChange={(e) => {
                      setMerchantQuery(e.target.value);
                      setSelectedMerchant(null);
                      setErrorMessage('');
                    }}
                    onFocus={() => {
                      if (merchantResults.length > 0) {
                        setShowDropdown(true);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    placeholder="Busca el comercio (ej. Hackathon UFM)"
                    className="w-full pl-10 sm:pl-12 lg:pl-14 pr-4 sm:pr-5 lg:pr-6 py-3 sm:py-4 lg:py-5 bg-dark-bg border border-dark-border rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all text-sm sm:text-base"
                  />
                  {showDropdown && (
                    <div className="absolute z-20 mt-2 w-full bg-dark-bg border border-dark-border rounded-lg sm:rounded-xl shadow-xl max-h-72 overflow-y-auto">
                      {isSearching ? (
                        <div className="py-4 px-4 text-sm text-gray-400">
                          Buscando comercios...
                        </div>
                      ) : merchantResults.length === 0 ? (
                        <div className="py-4 px-4 text-sm text-gray-500">
                          No encontramos comercios que coincidan con tu búsqueda.
                        </div>
                      ) : (
                        merchantResults.map((merchant) => (
                          <button
                            key={merchant.id}
                            type="button"
                            onMouseDown={() => handleSelectMerchant(merchant)}
                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-dark-card transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center text-primary-red">
                              <HiOfficeBuilding className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">
                                {merchant.name}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {merchant.groupId}
                              </p>
                              {merchant.eventName && (
                                <p className="text-xs text-gray-500 truncate">
                                  {merchant.eventName}
                                </p>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Escribe al menos 2 caracteres y selecciona el comercio correcto de la lista.
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2 sm:mb-3">
                  Cantidad ({tokenSymbol})
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
                    }}
                    placeholder="0.00"
                    required
                    className="w-full px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 pr-16 sm:pr-20 bg-dark-bg border border-dark-border rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all text-sm sm:text-base lg:text-lg font-semibold"
                  />
                  <span className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base lg:text-lg font-medium">
                    {tokenSymbol}
                  </span>
                </div>
              </div>

              {selectedMerchant && (
                <div className="bg-dark-bg border border-dark-border rounded-lg p-4 sm:p-5 text-sm text-gray-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Comercio seleccionado</span>
                    <span className="text-xs text-gray-500">Grupo-id: {selectedMerchant.groupId}</span>
                  </div>
                  <p className="text-base font-semibold text-white">{selectedMerchant.name}</p>
                  {selectedMerchant.eventName && (
                    <p className="text-xs text-gray-400">{selectedMerchant.eventName}</p>
                  )}
                  {selectedMerchant.description && (
                    <p className="text-xs text-gray-500">{selectedMerchant.description}</p>
                  )}
                </div>
              )}

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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !amount || !selectedMerchant}
                className="w-full bg-primary-red hover:bg-primary-red/90 text-white font-bold py-4 sm:py-5 lg:py-6 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg lg:text-xl shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                    <span>Procesando pago...</span>
                  </>
                ) : (
                  <>
                    <HiShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Pagar</span>
                    <HiArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mt-8 sm:mt-10 lg:mt-12">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <HiExclamationCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-2">Pagos Seguros</p>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Verifica siempre el código QR antes de realizar un pago. 
                Los pagos son procesados en la red y no pueden ser revertidos una vez confirmados.
              </p>
            </div>
          </div>
        </div>

        {/* Help Modal */}
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
                    Puedes realizar pagos escaneando un código QR o ingresando manualmente el nombre o el grupo-id del comercio autorizado.
                  </p>
                  <p>
                    Verifica siempre el comercio y la cantidad antes de confirmar. Los pagos no pueden ser revertidos una vez enviados.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* QR Scanner Modal */}
        {isScanning && (
          <>
            <div
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
              onClick={stopScan}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="bg-dark-card border border-dark-border rounded-xl max-w-[320px] sm:max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Escanear código QR</h3>
                  <button
                    onClick={stopScan}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Apunta la cámara al código QR del comercio para cargar automáticamente el comercio y,
                  si está incluido, el monto a pagar.
                </p>
                <div className="relative w-full rounded-lg overflow-hidden border border-dark-border bg-black" style={{ aspectRatio: '1' }}>
                  <div
                    id="qr-reader"
                    ref={scannerContainerRef}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-8 border-2 border-primary-red/70 rounded-lg pointer-events-none z-10" />
                </div>
                {scanError && (
                  <div className="bg-negative/10 border border-negative/40 text-negative px-3 py-2 rounded-lg text-xs flex items-center space-x-2">
                    <HiExclamationCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="break-words">{scanError}</span>
                  </div>
                )}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={stopScan}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-xs text-gray-300 hover:bg-dark-bg/80 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                    Si tu navegador no soporta la cámara o escaneo de QR, puedes ingresar los datos
                    manualmente en la sección de pago.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
