import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowDown, HiDuplicate, HiCheckCircle, HiQrcode } from 'react-icons/hi';
import Layout from '../components/layout/Layout';
import api from '../services/api';

export default function Receive() {
  const navigate = useNavigate();
  const [address, setAddress] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAddress = async () => {
      try {
        // TODO: Obtener dirección de wallet cuando el backend lo permita
        // const response = await api.get('/api/wallet/address');
        // setAddress(response.data.address);
        setAddress('0x0000000000000000000000000000000000000000'); // Placeholder
      } catch (err: any) {
        console.error('Error loading address:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAddress();
  }, []);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-dark-card rounded-lg transition-colors"
          >
            <HiArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Recibir ETH</h1>
            <p className="text-sm sm:text-base text-gray-400">Comparte tu dirección para recibir fondos</p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 sm:w-64 sm:h-64 bg-white rounded-xl p-4 mb-6 flex items-center justify-center">
              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red"></div>
              ) : (
                <HiQrcode className="w-full h-full text-gray-800" />
                // TODO: Implementar generación de QR real cuando tengamos la dirección
              )}
            </div>
            <p className="text-sm text-gray-400 mb-4 text-center">
              Escanea este código QR para recibir ETH
            </p>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Tu Dirección</h2>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 px-3 py-2 bg-dark-bg border border-dark-border rounded-lg hover:bg-dark-bg/80 transition-colors"
            >
              {copied ? (
                <>
                  <HiCheckCircle className="w-4 h-4 text-positive" />
                  <span className="text-sm text-positive">Copiado</span>
                </>
              ) : (
                <>
                  <HiDuplicate className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Copiar</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-dark-bg rounded-lg p-4 border border-dark-border">
            {loading ? (
              <div className="animate-pulse bg-dark-card h-6 rounded"></div>
            ) : (
              <p className="text-sm font-mono text-gray-300 break-all">{address || 'Cargando...'}</p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Comparte esta dirección para recibir ETH. Solo envía ETH a esta dirección en la red Sepolia.
          </p>
        </div>

        {/* Info */}
        <div className="bg-dark-card/50 border border-dark-border rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <HiArrowDown className="w-5 h-5 text-primary-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white mb-1">Información</p>
              <p className="text-xs text-gray-400">
                Asegúrate de que la red sea Sepolia Testnet antes de enviar fondos. 
                Los fondos enviados a una dirección incorrecta se perderán permanentemente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

