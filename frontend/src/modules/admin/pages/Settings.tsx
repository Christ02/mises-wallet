import { useEffect, useState } from 'react';
import {
  HiCheckCircle,
  HiCog,
  HiEye,
  HiEyeOff,
  HiInformationCircle,
  HiLockClosed,
  HiSave,
  HiExclamationCircle
} from 'react-icons/hi';
import {
  fetchCentralWalletConfig,
  updateCentralWalletConfig,
  CentralWalletConfig
} from '../services/centralWallet';

type EmailProvider = 'resend' | 'mailtrap';

interface ResendSettings {
  provider: EmailProvider;
  resendApiKey: string;
  resendFromEmail: string;
  mailtrapApiToken: string;
  mailtrapFromEmail: string;
  mailtrapFromName: string;
}

const EMAIL_STORAGE_KEY = 'admin-email-settings';

const defaultEmailSettings: ResendSettings = {
  provider: 'resend',
  resendApiKey: '',
  resendFromEmail: 'noreply@mises-wallet.com',
  mailtrapApiToken: '',
  mailtrapFromEmail: 'noreply@mises-wallet.com',
  mailtrapFromName: 'Mises Wallet'
};

const defaultWalletSettings: CentralWalletConfig = {
  bankName: 'Banco Central UFM',
  network: 'sepolia',
  walletAddress: '',
  walletPrivateKey: '',
  publicApiKey: '',
  secretApiKey: '',
  tokenSymbol: 'HC',
  tokenAddress: '',
  tokenDecimals: 18
};

export default function Settings() {
  const [emailSettings, setEmailSettings] = useState<ResendSettings>(defaultEmailSettings);
  const [walletSettings, setWalletSettings] = useState<CentralWalletConfig>(defaultWalletSettings);

  const [emailSaving, setEmailSaving] = useState(false);
  const [walletSaving, setWalletSaving] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [walletSuccess, setWalletSuccess] = useState('');
  const [walletError, setWalletError] = useState('');
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletTesting, setWalletTesting] = useState(false);
  const [walletTestMessage, setWalletTestMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const [showResendApiKey, setShowResendApiKey] = useState(false);
  const [showMailtrapApiToken, setShowMailtrapApiToken] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showSecretApiKey, setShowSecretApiKey] = useState(false);

  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
      if (storedEmail) {
        const parsed = JSON.parse(storedEmail);
        setEmailSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading email settings from storage:', error);
    }

    const loadWalletConfig = async () => {
      setWalletLoading(true);
      try {
        const response = await fetchCentralWalletConfig();
        if (response) {
          setWalletSettings((prev) => ({
            ...prev,
            ...response,
            walletPrivateKey: '',
            secretApiKey: ''
          }));
        }
        setWalletError('');
      } catch (error) {
        console.error('Error loading wallet settings:', error);
        setWalletError('No se pudo cargar la configuración actual de la wallet.');
      } finally {
        setWalletLoading(false);
      }
    };

    loadWalletConfig();
  }, []);

  useEffect(() => {
    if (!emailSuccess) return;
    const timeout = setTimeout(() => setEmailSuccess(''), 4000);
    return () => clearTimeout(timeout);
  }, [emailSuccess]);

  useEffect(() => {
    if (!walletSuccess) return;
    const timeout = setTimeout(() => setWalletSuccess(''), 4000);
    return () => clearTimeout(timeout);
  }, [walletSuccess]);

  const handleEmailChange = (field: keyof ResendSettings, value: string) => {
    setEmailSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProviderChange = (provider: EmailProvider) => {
    setEmailSettings((prev) => ({
      ...prev,
      provider
    }));
  };

  const handleWalletChange = (field: keyof CentralWalletConfig, value: string | number) => {
    setWalletSettings((prev) => ({
      ...prev,
      [field]: value as any
    }));
  };

  const handleSaveEmail = async (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevenir cualquier comportamiento por defecto
    e?.stopPropagation(); // Detener propagación del evento
    
    setEmailSaving(true);
    setEmailSuccess('');
    
    console.log('🔄 Guardando configuración de email...', emailSettings);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('📤 Enviando request a /api/admin/settings/email');
      
      const response = await fetch('/api/admin/settings/email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailSettings)
      });

      console.log('📥 Response status:', response.status);

      // Verificar si la respuesta tiene contenido antes de parsear JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
            console.log('📥 Response data:', data);
          } catch (parseError) {
            console.error('Error parseando JSON:', parseError);
            throw new Error(`Error del servidor (${response.status}): ${text || 'Sin contenido'}`);
          }
        } else {
          data = {};
        }
      } else {
        const text = await response.text();
        throw new Error(`Error del servidor (${response.status}): ${text || 'El endpoint no está disponible. Verifica que el código esté desplegado en producción.'}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Error al guardar configuración (${response.status})`);
      }

      // También guardar en localStorage como backup
      localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(emailSettings));
      
      setEmailSuccess(data.message || 'Configuración de correo actualizada correctamente.');
      if (data.note) {
        console.log('ℹ️', data.note);
      }
      if (data.railwayUpdated === false) {
        console.warn('⚠️ Las variables se guardaron solo para esta sesión. Para persistir, actualiza las variables en Railway dashboard.');
      }
    } catch (error: any) {
      console.error('❌ Error guardando configuración de correo:', error);
      setEmailSuccess(error.message || 'Ocurrió un problema al guardar la configuración.');
    } finally {
      setEmailSaving(false);
    }
  };

  const handleSaveWallet = async () => {
    setWalletSaving(true);
    try {
      setWalletError('');
      const payload: CentralWalletConfig = {
        ...walletSettings,
        tokenDecimals:
          typeof walletSettings.tokenDecimals === 'string'
            ? parseInt(walletSettings.tokenDecimals, 10) || 18
            : walletSettings.tokenDecimals
      };

      const result = await updateCentralWalletConfig(payload);
      setWalletSettings((prev) => ({
        ...prev,
        ...result,
        walletPrivateKey: '',
        secretApiKey: ''
      }));
      setWalletSuccess('Credenciales de la wallet central actualizadas correctamente.');
    } catch (error: any) {
      console.error('Error guardando configuración de wallet:', error);
      const message = error?.response?.data?.error || 'Ocurrió un problema al guardar las credenciales.';
      setWalletError(message);
    } finally {
      setWalletSaving(false);
    }
  };

  const handleTestWallet = async () => {
    setWalletTesting(true);
    setWalletTestMessage(null);
    try {
      // Probamos la conexión usando el endpoint real de estado
      const res = await fetch('/api/admin/central-wallet/status', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const balance = data?.tokenBalance ?? data?.balance ?? null;
      setWalletTestMessage({
        type: 'ok',
        text: balance !== null
          ? `Conexión exitosa. Balance disponible: ${balance} ${data?.tokenSymbol || 'HC'}.`
          : 'Conexión exitosa.'
      });
    } catch (err: any) {
      setWalletTestMessage({
        type: 'error',
        text: err?.message || 'No se pudo conectar con la wallet central.'
      });
    } finally {
      setWalletTesting(false);
      setTimeout(() => setWalletTestMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-red to-primary-red/80 border border-primary-red/40 text-white flex items-center justify-center shadow-lg flex-shrink-0">
            <HiCog className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Configuración del sistema</h1>
            <p className="text-sm text-gray-400">
              Administra las integraciones de correo y las credenciales de la wallet del banco central.
            </p>
          </div>
        </div>
      </div>

      <section className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Configuración de correo electrónico</h2>
            <p className="text-sm text-gray-400 mt-1">
              Elige entre Resend (producción) o Mailtrap (pruebas) para enviar correos
            </p>
          </div>
          <div className="bg-dark-bg border border-dark-border rounded-full p-1 inline-flex">
            <button
              onClick={() => handleProviderChange('resend')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                emailSettings.provider === 'resend'
                  ? 'bg-primary-red text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Resend
            </button>
            <button
              onClick={() => handleProviderChange('mailtrap')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                emailSettings.provider === 'mailtrap'
                  ? 'bg-primary-red text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mailtrap
            </button>
          </div>
        </div>

        {emailSuccess && (
          <div className="bg-positive/10 border border-positive/30 text-positive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <HiCheckCircle className="w-5 h-5" />
            <span>{emailSuccess}</span>
          </div>
        )}

        {emailSettings.provider === 'resend' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Resend API Key *</label>
                <div className="relative">
                  <input
                    type={showResendApiKey ? 'text' : 'password'}
                    value={emailSettings.resendApiKey}
                    onChange={(e) => handleEmailChange('resendApiKey', e.target.value)}
                    placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResendApiKey((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showResendApiKey ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Tu API key de Resend. Obtén tu key en{' '}
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-red hover:text-primary-red/80 underline"
                  >
                    resend.com/api-keys
                  </a>
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Correo remitente *</label>
                <input
                  type="email"
                  value={emailSettings.resendFromEmail}
                  onChange={(e) => handleEmailChange('resendFromEmail', e.target.value)}
                  placeholder="noreply@tudominio.com"
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  El dominio del correo debe estar verificado en tu cuenta de Resend.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Mailtrap API Token *</label>
              <div className="relative">
                <input
                  type={showMailtrapApiToken ? 'text' : 'password'}
                  value={emailSettings.mailtrapApiToken}
                  onChange={(e) => handleEmailChange('mailtrapApiToken', e.target.value)}
                  placeholder="2667f58c9d749883c67770c58a18c192"
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowMailtrapApiToken((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showMailtrapApiToken ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Tu API token de Mailtrap. Obtén tu token en{' '}
                <a
                  href="https://mailtrap.io/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-red hover:text-primary-red/80 underline"
                >
                  mailtrap.io/api-tokens
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Correo remitente *</label>
              <input
                type="email"
                value={emailSettings.mailtrapFromEmail}
                onChange={(e) => handleEmailChange('mailtrapFromEmail', e.target.value)}
                placeholder="noreply@tudominio.com"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre remitente</label>
              <input
                type="text"
                value={emailSettings.mailtrapFromName}
                onChange={(e) => handleEmailChange('mailtrapFromName', e.target.value)}
                placeholder="Mises Wallet"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={(e) => handleSaveEmail(e)}
            disabled={emailSaving}
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg font-semibold transition-all disabled:opacity-60"
          >
            {emailSaving ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <HiSave className="w-5 h-5" />
                Guardar configuración
              </>
            )}
          </button>
        </div>
      </section>

      <section className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Credenciales de wallet (Banco Central)</h2>
            <p className="text-sm text-gray-400">
              Administra las claves y accesos necesarios para firmar transacciones desde la wallet del banco central.
            </p>
          </div>
        </div>

        {walletSuccess && (
          <div className="bg-positive/10 border border-positive/30 text-positive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <HiCheckCircle className="w-5 h-5" />
            <span>{walletSuccess}</span>
          </div>
        )}

        {walletError && (
          <div className="bg-negative/10 border border-negative/30 text-negative px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <HiExclamationCircle className="w-5 h-5" />
            <span>{walletError}</span>
          </div>
        )}

        {walletLoading ? (
          <div className="py-8 flex items-center justify-center text-gray-400 text-sm">
            <span className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-3" />
            Cargando configuración...
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del banco</label>
              <input
                type="text"
                value={walletSettings.bankName}
                onChange={(e) => handleWalletChange('bankName', e.target.value)}
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Red / Network</label>
              <input
                type="text"
                value={walletSettings.network}
                onChange={(e) => handleWalletChange('network', e.target.value)}
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dirección de la wallet *</label>
              <input
                type="text"
                value={walletSettings.walletAddress}
                onChange={(e) => handleWalletChange('walletAddress', e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Private Key *</label>
              <div className="relative">
                <input
                  type={showPrivateKey ? 'text' : 'password'}
                  value={walletSettings.walletPrivateKey}
                  onChange={(e) => handleWalletChange('walletPrivateKey', e.target.value)}
                  placeholder="Clave privada en formato hex"
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 font-mono pr-12"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKey((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                  title={showPrivateKey ? 'Ocultar' : 'Mostrar'}
                >
                  {showPrivateKey ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
              {!showPrivateKey && walletSettings.walletPrivateKey && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                  <HiLockClosed className="w-4 h-4" />
                  <span>La clave se almacena encriptada en el backend. Aquí solo se muestra para referencia.</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Key pública</label>
                <input
                  type="text"
                  value={walletSettings.publicApiKey}
                  onChange={(e) => handleWalletChange('publicApiKey', e.target.value)}
                  placeholder="pk_live_..."
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Key secreta</label>
                <div className="relative">
                  <input
                    type={showSecretApiKey ? 'text' : 'password'}
                    value={walletSettings.secretApiKey}
                    onChange={(e) => handleWalletChange('secretApiKey', e.target.value)}
                    placeholder="sk_live_..."
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretApiKey((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showSecretApiKey ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Token contract *</label>
                <input
                  type="text"
                  value={walletSettings.tokenAddress}
                  onChange={(e) => handleWalletChange('tokenAddress', e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Símbolo</label>
                  <input
                    type="text"
                    value={walletSettings.tokenSymbol}
                    onChange={(e) => handleWalletChange('tokenSymbol', e.target.value)}
                    placeholder="HC"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Decimales</label>
                  <input
                    type="number"
                    value={walletSettings.tokenDecimals}
                    onChange={(e) => handleWalletChange('tokenDecimals', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        <div className="bg-dark-bg/60 border border-dark-border rounded-xl p-4 text-sm text-gray-400 flex items-start gap-3">
          <HiInformationCircle className="w-5 h-5 text-primary-red flex-shrink-0" />
          <p>
            Las credenciales deben coincidir con las configuradas en el backend. Asegúrate de proteger las claves
            privadas y rotarlas periódicamente según las políticas del banco central.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleTestWallet}
            disabled={walletTesting}
            className="inline-flex items-center gap-2 px-5 py-3 bg-dark-bg border border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg/80 rounded-lg font-medium transition-all disabled:opacity-60"
            title="Probar conexión con la wallet central"
          >
            {walletTesting ? (
              <>
                <span className="h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                Probando...
              </>
            ) : (
              <>
                <HiInformationCircle className="w-5 h-5" />
                Probar conexión
              </>
            )}
          </button>
          <button
            onClick={handleSaveWallet}
            disabled={walletSaving}
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg font-semibold transition-all disabled:opacity-60"
          >
            {walletSaving ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <HiSave className="w-5 h-5" />
                Guardar credenciales
              </>
            )}
          </button>
        </div>
        {walletTestMessage && (
          <div
            className={`mt-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border ${
              walletTestMessage.type === 'ok'
                ? 'bg-positive/10 text-positive border-positive/30'
                : 'bg-negative/10 text-negative border-negative/30'
            }`}
          >
            {walletTestMessage.type === 'ok' ? (
              <HiCheckCircle className="w-5 h-5" />
            ) : (
              <HiExclamationCircle className="w-5 h-5" />
            )}
            <span>{walletTestMessage.text}</span>
          </div>
        )}
      </section>
    </div>
  );
}

