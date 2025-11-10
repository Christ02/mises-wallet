import { useEffect, useMemo, useState } from 'react';
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

type EmailMode = 'smtp' | 'api';

interface SmtpSettings {
  host: string;
  port: string;
  username: string;
  password: string;
  secure: boolean;
  fromName: string;
  fromEmail: string;
}

interface ApiSettings {
  provider: string;
  apiKey: string;
  baseUrl: string;
  fromName: string;
  fromEmail: string;
}

interface EmailSettings {
  mode: EmailMode;
  smtp: SmtpSettings;
  api: ApiSettings;
}

const EMAIL_STORAGE_KEY = 'admin-email-settings';

const defaultEmailSettings: EmailSettings = {
  mode: 'smtp',
  smtp: {
    host: '',
    port: '587',
    username: '',
    password: '',
    secure: true,
    fromName: 'Banco Central',
    fromEmail: 'no-reply@ufm.edu'
  },
  api: {
    provider: '',
    apiKey: '',
    baseUrl: '',
    fromName: 'Banco Central',
    fromEmail: 'no-reply@ufm.edu'
  }
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
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(defaultEmailSettings);
  const [walletSettings, setWalletSettings] = useState<CentralWalletConfig>(defaultWalletSettings);

  const [emailSaving, setEmailSaving] = useState(false);
  const [walletSaving, setWalletSaving] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [walletSuccess, setWalletSuccess] = useState('');
  const [walletError, setWalletError] = useState('');
  const [walletLoading, setWalletLoading] = useState(true);

  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
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

  const currentEmailConfig = useMemo(() => {
    return emailSettings.mode === 'smtp' ? emailSettings.smtp : emailSettings.api;
  }, [emailSettings]);

  const handleEmailChange = (field: keyof SmtpSettings | keyof ApiSettings, value: string | boolean) => {
    if (emailSettings.mode === 'smtp') {
      setEmailSettings((prev) => ({
        ...prev,
        smtp: {
          ...prev.smtp,
          [field]: value
        }
      }));
    } else {
      setEmailSettings((prev) => ({
        ...prev,
        api: {
          ...prev.api,
          [field]: value
        }
      }));
    }
  };

  const handleEmailModeChange = (mode: EmailMode) => {
    setEmailSettings((prev) => ({
      ...prev,
      mode
    }));
  };

  const handleWalletChange = (field: keyof CentralWalletConfig, value: string | number) => {
    setWalletSettings((prev) => ({
      ...prev,
      [field]: value as any
    }));
  };

  const handleSaveEmail = async () => {
    setEmailSaving(true);
    try {
      localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(emailSettings));
      setEmailSuccess('Configuración de correo actualizada correctamente.');
    } catch (error) {
      console.error('Error guardando configuración de correo:', error);
      setEmailSuccess('Ocurrió un problema al guardar la configuración.');
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

  return (
    <div className="space-y-6">
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-red/20 border border-primary-red/30 text-primary-red">
              <HiCog className="w-5 h-5" />
            </span>
            Configuración del sistema
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Administra las integraciones de correo y las credenciales de la wallet del banco central.
          </p>
        </div>
      </div>

      <section className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Servidor de correos</h2>
            <p className="text-sm text-gray-400">
              Define cómo se envían las notificaciones del sistema. Elige entre SMTP tradicional o proveedores vía API.
            </p>
          </div>
          <div className="bg-dark-bg border border-dark-border rounded-full p-1 inline-flex">
            <button
              onClick={() => handleEmailModeChange('smtp')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                emailSettings.mode === 'smtp'
                  ? 'bg-primary-red text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              SMTP
            </button>
            <button
              onClick={() => handleEmailModeChange('api')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                emailSettings.mode === 'api'
                  ? 'bg-primary-red text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              API Key
            </button>
          </div>
        </div>

        {emailSuccess && (
          <div className="bg-positive/10 border border-positive/30 text-positive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <HiCheckCircle className="w-5 h-5" />
            <span>{emailSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {emailSettings.mode === 'smtp' ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Host *</label>
                  <input
                    type="text"
                    value={emailSettings.smtp.host}
                    onChange={(e) => handleEmailChange('host', e.target.value)}
                    placeholder="smtp.mailgun.org"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Puerto *</label>
                    <input
                      type="number"
                      value={emailSettings.smtp.port}
                      onChange={(e) => handleEmailChange('port', e.target.value)}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-7">
                    <input
                      id="smtp-secure"
                      type="checkbox"
                      checked={emailSettings.smtp.secure}
                      onChange={(e) => handleEmailChange('secure', e.target.checked)}
                      className="h-4 w-4 rounded border-dark-border bg-dark-bg text-primary-red focus:ring-primary-red"
                    />
                    <label htmlFor="smtp-secure" className="text-sm text-gray-300">
                      Usar TLS/SSL
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Usuario *</label>
                  <input
                    type="text"
                    value={emailSettings.smtp.username}
                    onChange={(e) => handleEmailChange('username', e.target.value)}
                    placeholder="postmaster@midominio.com"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña *</label>
                  <div className="relative">
                    <input
                      type={showSmtpPassword ? 'text' : 'password'}
                      value={emailSettings.smtp.password}
                      onChange={(e) => handleEmailChange('password', e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                    >
                      {showSmtpPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre remitente *</label>
                  <input
                    type="text"
                    value={emailSettings.smtp.fromName}
                    onChange={(e) => handleEmailChange('fromName', e.target.value)}
                    placeholder="Banco Central UFM"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Correo remitente *</label>
                  <input
                    type="email"
                    value={emailSettings.smtp.fromEmail}
                    onChange={(e) => handleEmailChange('fromEmail', e.target.value)}
                    placeholder="no-reply@ufm.edu"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  />
                </div>
                <div className="bg-dark-bg/60 border border-dark-border rounded-xl p-4 text-sm text-gray-400 flex items-start gap-3">
                  <HiInformationCircle className="w-5 h-5 text-primary-red flex-shrink-0" />
                  <p>
                    Asegúrate de que el proveedor SMTP permita enviar correos desde el dominio configurado y que las
                    credenciales estén vigentes.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Proveedor *</label>
                  <input
                    type="text"
                    value={emailSettings.api.provider}
                    onChange={(e) => handleEmailChange('provider', e.target.value)}
                    placeholder="Mailgun, SendGrid..."
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">API Key *</label>
                  <input
                    type="text"
                    value={emailSettings.api.apiKey}
                    onChange={(e) => handleEmailChange('apiKey', e.target.value)}
                    placeholder="key-xxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Endpoint base *</label>
                  <input
                    type="url"
                    value={emailSettings.api.baseUrl}
                    onChange={(e) => handleEmailChange('baseUrl', e.target.value)}
                    placeholder="https://api.mailgun.net/v3/tu-dominio"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre remitente *</label>
                  <input
                    type="text"
                    value={emailSettings.api.fromName}
                    onChange={(e) => handleEmailChange('fromName', e.target.value)}
                    placeholder="Banco Central UFM"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Correo remitente *</label>
                  <input
                    type="email"
                    value={emailSettings.api.fromEmail}
                    onChange={(e) => handleEmailChange('fromEmail', e.target.value)}
                    placeholder="no-reply@ufm.edu"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  />
                </div>
                <div className="bg-dark-bg/60 border border-dark-border rounded-xl p-4 text-sm text-gray-400 flex items-start gap-3">
                  <HiInformationCircle className="w-5 h-5 text-primary-red flex-shrink-0" />
                  <p>
                    Verifica los límites de envío y dominios autorizados del proveedor. Algunos servicios requieren
                    verificación adicional del remitente.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={handleSaveEmail}
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
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Private Key *</label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={walletSettings.walletPrivateKey}
                  onChange={(e) => handleWalletChange('walletPrivateKey', e.target.value)}
                  placeholder="Clave privada en formato hex"
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 font-mono resize-none pr-12"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKey((prev) => !prev)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white"
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

        <div className="flex items-center justify-end">
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
      </section>
    </div>
  );
}

