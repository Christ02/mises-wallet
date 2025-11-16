import { useEffect, useState } from 'react';
import {
  HiUserCircle,
  HiShieldCheck,
  HiMail,
  HiIdentification,
  HiClipboardCopy,
  HiSave,
  HiExclamationCircle,
  HiCheckCircle,
  HiEye,
  HiEyeOff
} from 'react-icons/hi';
import api from '../../../services/api';

interface User {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  carnet_universitario: string;
  role: string;
}

export default function AdminProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        setForm({
          nombres: parsed.nombres || '',
          apellidos: parsed.apellidos || '',
          email: parsed.email || '',
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  if (!user) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 text-gray-400">
        Cargando perfil...
      </div>
    );
  }

  const initials = `${user.nombres?.charAt(0) ?? ''}${user.apellidos?.charAt(0) ?? ''}`.toUpperCase();
  const fullName = `${user.nombres} ${user.apellidos}`;
  const roleDisplay = user.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const validateProfile = () => {
    const errors: Record<string, string> = {};
    if (!form.nombres.trim()) errors.nombres = 'Los nombres son obligatorios';
    if (!form.apellidos.trim()) errors.apellidos = 'Los apellidos son obligatorios';
    if (!form.email.trim()) errors.email = 'El email es obligatorio';
    if (!form.email.endsWith('@ufm.edu')) errors.email = 'Debe ser un email @ufm.edu';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!validateProfile()) return;
    setSavingProfile(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const res = await api.put(`/api/admin/users/${user.id}`, {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        email: form.email.trim(),
      });
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileSuccess('Perfil actualizado correctamente.');
    } catch (err: any) {
      setProfileError(err?.response?.data?.error || 'No se pudo actualizar el perfil.');
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileSuccess(''), 4000);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    setChangingPassword(true);
    try {
      await api.put(`/api/admin/users/${user.id}`, {
        password: passwordForm.newPassword
      });
      setPasswordSuccess('Contraseña actualizada correctamente.');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err?.response?.data?.error || 'No se pudo actualizar la contraseña.');
    } finally {
      setChangingPassword(false);
      setTimeout(() => setPasswordSuccess(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-red to-primary-red/80 border border-primary-red/40 text-white flex items-center justify-center shadow-lg flex-shrink-0">
            <HiUserCircle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Perfil</h1>
            <p className="text-sm text-gray-400">Información de tu cuenta de administrador.</p>
          </div>
        </div>
      </div>

      {/* Layout principal: resumen a la izquierda, pestañas a la derecha */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Columna izquierda - resumen */}
        <div className="space-y-4 xl:col-span-1">
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-dark-border flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full text-white font-semibold flex items-center justify-center shadow-lg text-lg">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white truncate">{fullName}</h2>
                  <HiShieldCheck className="w-4 h-4 text-primary-red" />
                </div>
                <p className="text-sm text-primary-red">{roleDisplay}</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HiMail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">Correo electrónico</p>
                      <p className="text-sm text-white font-medium break-all">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copy(user.email, 'email')}
                    className="p-2 text-gray-400 hover:text-white hover:bg-dark-card rounded-lg transition"
                    title="Copiar correo"
                  >
                    <HiClipboardCopy className="w-5 h-5" />
                  </button>
                </div>
                {copied === 'email' && <p className="mt-2 text-xs text-primary-red">Copiado al portapapeles</p>}
              </div>

              <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HiIdentification className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">Carnet universitario</p>
                      <p className="text-sm text-white font-medium break-all">{user.carnet_universitario}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copy(user.carnet_universitario, 'carnet')}
                    className="p-2 text-gray-400 hover:text-white hover:bg-dark-card rounded-lg transition"
                    title="Copiar carnet"
                  >
                    <HiClipboardCopy className="w-5 h-5" />
                  </button>
                </div>
                {copied === 'carnet' && <p className="mt-2 text-xs text-primary-red">Copiado al portapapeles</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - pestañas de edición */}
        <div className="space-y-4 xl:col-span-2">
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-dark-border">
              <button
                className={`flex-1 px-4 sm:px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'info'
                    ? 'text-white border-b-2 border-primary-red bg-dark-bg'
                    : 'text-gray-400 hover:text-white hover:bg-dark-bg/40'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Datos personales
              </button>
              <button
                className={`flex-1 px-4 sm:px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'security'
                    ? 'text-white border-b-2 border-primary-red bg-dark-bg'
                    : 'text-gray-400 hover:text-white hover:bg-dark-bg/40'
                }`}
                onClick={() => setActiveTab('security')}
              >
                Seguridad
              </button>
            </div>

            <div className="p-6 space-y-6">
              {activeTab === 'info' && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Datos personales</h3>
                    <p className="text-sm text-gray-400">Actualiza tu información básica.</p>
                  </div>
                  {profileError && (
                    <div className="bg-negative/10 border border-negative/30 text-negative px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <HiExclamationCircle className="w-5 h-5" />
                      <span>{profileError}</span>
                    </div>
                  )}
                  {profileSuccess && (
                    <div className="bg-positive/10 border border-positive/30 text-positive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <HiCheckCircle className="w-5 h-5" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nombres</label>
                      <input
                        type="text"
                        value={form.nombres}
                        onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                        className="w-full h-12 px-4 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/40 focus:border-primary-red/40 transition-all"
                        placeholder="Tu nombre"
                      />
                      {formErrors.nombres && <p className="mt-1 text-xs text-negative">{formErrors.nombres}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Apellidos</label>
                      <input
                        type="text"
                        value={form.apellidos}
                        onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                        className="w-full h-12 px-4 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/40 focus:border-primary-red/40 transition-all"
                        placeholder="Tus apellidos"
                      />
                      {formErrors.apellidos && <p className="mt-1 text-xs text-negative">{formErrors.apellidos}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email institucional</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full h-12 px-4 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/40 focus:border-primary-red/40 transition-all"
                        placeholder="usuario@ufm.edu"
                      />
                      {formErrors.email && <p className="mt-1 text-xs text-negative">{formErrors.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg font-semibold transition-all disabled:opacity-60"
                    >
                      {savingProfile ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <HiSave className="w-5 h-5" />
                          Guardar cambios
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'security' && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Seguridad</h3>
                    <p className="text-sm text-gray-400">Cambia tu contraseña de acceso.</p>
                  </div>
                  {passwordError && (
                    <div className="bg-negative/10 border border-negative/30 text-negative px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <HiExclamationCircle className="w-5 h-5" />
                      <span>{passwordError}</span>
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="bg-positive/10 border border-positive/30 text-positive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <HiCheckCircle className="w-5 h-5" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nueva contraseña</label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full h-12 px-4 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/40 focus:border-primary-red/40 transition-all pr-12"
                        placeholder="Mínimo 8 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((p) => !p)}
                        className="absolute inset-y-8 right-3 flex items-center text-gray-400 hover:text-white"
                      >
                        {showNewPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar contraseña</label>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full h-12 px-4 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/40 focus:border-primary-red/40 transition-all pr-12"
                        placeholder="Repite la nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute inset-y-8 right-3 flex items-center text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg font-semibold transition-all disabled:opacity-60"
                    >
                      {changingPassword ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <HiSave className="w-5 h-5" />
                          Actualizar contraseña
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


