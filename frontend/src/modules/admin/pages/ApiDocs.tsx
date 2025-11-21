import { useState } from 'react';
import {
  HiBookOpen,
  HiCode,
  HiLink,
  HiShieldCheck,
  HiServer,
  HiLightningBolt
} from 'react-icons/hi';

const baseUrl =
  import.meta.env.VITE_API_BASE_URL || 'https://mises-wallet-production.up.railway.app';

type Endpoint = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth: 'public' | 'user' | 'admin' | 'super_admin';
  rateLimitNote?: string;
  params?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
};

type Section = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  endpoints: Endpoint[];
};

// Secciones para **usuarios finales**
const userSections: Section[] = [
  {
    id: 'auth',
    title: 'Autenticación y usuarios',
    description: 'Inicio de sesión, registro de cuentas y administración básica de usuarios.',
    icon: HiShieldCheck,
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Inicia sesión y devuelve un token JWT para usar en el sistema.',
        auth: 'public',
        rateLimitNote: '5 intentos por minuto por IP',
        params: [
          {
            name: 'email',
            type: 'string',
            required: true,
            description: 'Correo electrónico institucional del usuario.'
          },
          {
            name: 'password',
            type: 'string',
            required: true,
            description: 'Contraseña del usuario.'
          }
        ]
      },
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Registra un nuevo usuario final en el sistema.',
        auth: 'public',
        rateLimitNote: '5 intentos por minuto por IP',
        params: [
          { name: 'nombres', type: 'string', required: true, description: 'Nombres del usuario.' },
          { name: 'apellidos', type: 'string', required: true, description: 'Apellidos del usuario.' },
          {
            name: 'carnet_universitario',
            type: 'string',
            required: true,
            description: 'Carnet universitario único.'
          },
          {
            name: 'email',
            type: 'string',
            required: true,
            description: 'Correo @ufm.edu válido.'
          },
          {
            name: 'password',
            type: 'string',
            required: true,
            description: 'Contraseña (mínimo 8 caracteres).'
          },
          {
            name: 'confirmPassword',
            type: 'string',
            required: true,
            description: 'Debe coincidir con password.'
          }
        ]
      },
      {
        method: 'POST',
        path: '/api/auth/forgot-password',
        description: 'Solicita un correo de restablecimiento de contraseña.',
        auth: 'public',
        params: [
          {
            name: 'email',
            type: 'string',
            required: true,
            description: 'Correo del usuario que desea recuperar acceso.'
          }
        ]
      },
      {
        method: 'POST',
        path: '/api/auth/reset-password',
        description: 'Actualiza la contraseña usando el token enviado al correo.',
        auth: 'public',
        params: [
          {
            name: 'token',
            type: 'string',
            required: true,
            description: 'Token de recuperación recibido por correo.'
          },
          {
            name: 'password',
            type: 'string',
            required: true,
            description: 'Nueva contraseña (mínimo 8 caracteres).'
          }
        ]
      },
      {
        method: 'GET',
        path: '/api/auth/me',
        description: 'Devuelve la información del usuario autenticado.',
        auth: 'user'
      }
    ]
  },
  {
    id: 'profile',
    title: 'Perfil de usuario',
    description: 'Obtención del perfil completo del usuario autenticado.',
    icon: HiShieldCheck,
    endpoints: [
      {
        method: 'GET',
        path: '/api/user/profile',
        description: 'Devuelve el perfil del usuario actual (datos básicos y wallet).',
        auth: 'user'
      }
    ]
  },
  {
    id: 'wallet',
    title: 'Wallet de usuario',
    description: 'Operaciones principales de la wallet de HayekCoin del usuario final.',
    icon: HiLightningBolt,
    endpoints: [
      {
        method: 'GET',
        path: '/api/wallet/balance',
        description: 'Obtiene el balance actual de HayekCoin del usuario.',
        auth: 'user'
      },
      {
        method: 'GET',
        path: '/api/wallet/history',
        description: 'Historial de transacciones del usuario (recargas, pagos, envíos).',
        auth: 'user'
      },
      {
        method: 'GET',
        path: '/api/wallet/recipients/search',
        description: 'Búsqueda de otros usuarios por nombre/carnet para enviar HC.',
        auth: 'user',
        params: [
          {
            name: 'query',
            type: 'string',
            required: true,
            description: 'Texto a buscar (mínimo 2 caracteres).'
          },
          {
            name: 'limit',
            type: 'number',
            required: false,
            description: 'Máximo de resultados a devolver (por defecto 10).'
          }
        ]
      },
      {
        method: 'GET',
        path: '/api/wallet/merchants/search',
        description: 'Búsqueda de negocios/equipos para pagar con QR o buscador.',
        auth: 'user',
        params: [
          {
            name: 'query',
            type: 'string',
            required: true,
            description: 'Texto a buscar (nombre de negocio o event/group-id).'
          },
          {
            name: 'limit',
            type: 'number',
            required: false,
            description: 'Máximo de resultados a devolver.'
          }
        ]
      },
      {
        method: 'POST',
        path: '/api/wallet/merchants/pay',
        description: 'Pago a un negocio/equipo de evento usando group-id o QR.',
        auth: 'user',
        params: [
          {
            name: 'merchantId',
            type: 'number',
            required: false,
            description: 'ID interno del negocio/equipo (alternativo a groupId).'
          },
          {
            name: 'groupId',
            type: 'string',
            required: false,
            description: 'Identificador de grupo usado en el QR.'
          },
          {
            name: 'amount',
            type: 'number',
            required: true,
            description: 'Cantidad de HC a pagar.'
          }
        ]
      },
      {
        method: 'POST',
        path: '/api/wallet/send',
        description: 'Transfiere HayekCoin directamente a otro usuario.',
        auth: 'user',
        params: [
          {
            name: 'carnet',
            type: 'string',
            required: true,
            description: 'Carnet universitario del destinatario.'
          },
          {
            name: 'amount',
            type: 'number',
            required: true,
            description: 'Cantidad de HC a enviar.'
          }
        ]
      },
      {
        method: 'POST',
        path: '/api/wallet/recharge',
        description: 'Inicia una recarga de HayekCoin desde quetzales (GTQ).',
        auth: 'user',
        params: [
          {
            name: 'amountHayek',
            type: 'number',
            required: false,
            description: 'Cantidad de HC a comprar (equivalente en GTQ).'
          },
          {
            name: 'amountUsd',
            type: 'number',
            required: false,
            description: 'Monto en GTQ (para compatibilidad histórica).'
          },
          {
            name: 'cardNumber',
            type: 'string',
            required: true,
            description: 'Número de tarjeta simulado para pruebas (mínimo 12 dígitos).'
          },
          {
            name: 'cardHolder',
            type: 'string',
            required: false,
            description: 'Nombre del titular de la tarjeta (solo informativo).'
          }
        ]
      },
      {
        method: 'POST',
        path: '/api/wallet/withdrawals',
        description: 'Crea una solicitud de retiro de HayekCoin hacia GTQ.',
        auth: 'user',
        params: [
          {
            name: 'amount',
            type: 'number',
            required: true,
            description: 'Cantidad de HC a retirar.'
          },
          {
            name: 'notes',
            type: 'string',
            required: false,
            description: 'Notas opcionales para la administración.'
          }
        ]
      },
      {
        method: 'GET',
        path: '/api/wallet/withdrawals',
        description: 'Lista las solicitudes de retiro creadas por el usuario.',
        auth: 'user'
      }
    ]
  },
  {
    id: 'events',
    title: 'Eventos y negocios (usuario)',
    description: 'Eventos disponibles, vista como organizador, solicitudes de liquidación y notificaciones.',
    icon: HiServer,
    endpoints: [
      {
        method: 'GET',
        path: '/api/user/events',
        description: 'Lista de eventos disponibles para el usuario (solo activos y no finalizados).',
        auth: 'user'
      },
      {
        method: 'GET',
        path: '/api/user/events/organizer/:eventId',
        description: 'Detalle del evento como organizador (saldo del equipo, QR, etc.).',
        auth: 'user'
      },
      {
        method: 'POST',
        path: '/api/user/events/:eventId/businesses/:businessId/settlement',
        description: 'Solicita la liquidación del saldo de un negocio/equipo.',
        auth: 'user',
        params: [
          {
            name: 'notes',
            type: 'string',
            required: false,
            description: 'Notas opcionales para centralizar contexto de la liquidación.'
          }
        ]
      },
      {
        method: 'GET',
        path: '/api/user/events/:eventId/businesses/:businessId/settlement',
        description: 'Consulta el estado de una solicitud de liquidación de negocio/equipo.',
        auth: 'user'
      },
      {
        method: 'GET',
        path: '/api/user/notifications',
        description: 'Listado de notificaciones del usuario (recargas, pagos, recibos, etc.).',
        auth: 'user'
      }
    ]
  }
];

// Secciones para **administración / panel admin**
const adminSections: Section[] = [
  {
    id: 'admin-core',
    title: 'Admin - Usuarios y roles',
    description: 'Gestión de usuarios, roles básicos y permisos de acceso.',
    icon: HiShieldCheck,
    endpoints: [
      {
        method: 'GET',
        path: '/api/admin/users',
        description: 'Listado de usuarios con filtros y paginación (nombre, email, carnet, estado, rol).',
        auth: 'admin'
      },
      {
        method: 'GET',
        path: '/api/admin/users/roles',
        description: 'Listado de roles disponibles para asignar a usuarios (usuario, admin, super_admin).',
        auth: 'admin'
      },
      {
        method: 'GET',
        path: '/api/admin/users/search',
        description: 'Búsqueda rápida de usuarios por nombre, carnet o email (para selects y modales).',
        auth: 'admin',
        params: [
          {
            name: 'query',
            type: 'string',
            required: true,
            description: 'Texto de búsqueda (nombre, carnet o email).'
          },
          {
            name: 'limit',
            type: 'number',
            required: false,
            description: 'Número máximo de resultados (por defecto 10).'
          }
        ]
      },
      {
        method: 'POST',
        path: '/api/admin/users',
        description: 'Crea un nuevo usuario desde el panel de administración.',
        auth: 'admin'
      },
      {
        method: 'PUT',
        path: '/api/admin/users/:id',
        description: 'Actualiza datos de un usuario (nombre, rol, estado, etc.).',
        auth: 'admin'
      },
      {
        method: 'DELETE',
        path: '/api/admin/users/:id',
        description: 'Elimina un usuario (solo super_admin según permisos).',
        auth: 'super_admin'
      }
    ]
  },
  {
    id: 'events-admin',
    title: 'Admin - Eventos y negocios',
    description: 'Gestión completa de eventos, negocios y miembros desde el panel.',
    icon: HiServer,
    endpoints: [
      {
        method: 'GET',
        path: '/api/admin/events',
        description: 'Listado y filtros de eventos para administración.',
        auth: 'admin'
      },
      {
        method: 'GET',
        path: '/api/admin/events/:id/businesses',
        description: 'Obtiene los negocios / equipos de un evento específico.',
        auth: 'admin'
      },
      {
        method: 'GET',
        path: '/api/admin/events/:eventId',
        description: 'Devuelve el detalle completo de un evento (datos generales e imágenes).',
        auth: 'admin'
      },
      {
        method: 'POST',
        path: '/api/admin/events',
        description: 'Crea un nuevo evento (nombre, fechas, ubicación, imágenes).',
        auth: 'admin'
      },
      {
        method: 'PUT',
        path: '/api/admin/events/:eventId',
        description: 'Actualiza un evento existente (incluye manejo de imágenes).',
        auth: 'admin'
      },
      {
        method: 'DELETE',
        path: '/api/admin/events/:eventId',
        description: 'Elimina un evento (solo super_admin).',
        auth: 'super_admin'
      },
      {
        method: 'POST',
        path: '/api/admin/events/:eventId/businesses',
        description: 'Crea un nuevo negocio / equipo dentro de un evento.',
        auth: 'admin'
      },
      {
        method: 'PUT',
        path: '/api/admin/events/:eventId/businesses/:businessId',
        description: 'Actualiza datos de un negocio / equipo en un evento.',
        auth: 'admin'
      },
      {
        method: 'DELETE',
        path: '/api/admin/events/:eventId/businesses/:businessId',
        description: 'Elimina un negocio / equipo (solo super_admin).',
        auth: 'super_admin'
      },
      {
        method: 'POST',
        path: '/api/admin/events/:eventId/businesses/:businessId/members',
        description: 'Agrega un miembro a un negocio / equipo de evento.',
        auth: 'admin'
      },
      {
        method: 'DELETE',
        path: '/api/admin/events/:eventId/businesses/:businessId/members/:memberId',
        description: 'Elimina un miembro de un negocio / equipo de evento.',
        auth: 'admin'
      }
    ]
  },
  {
    id: 'admin-transactions',
    title: 'Admin - Transacciones globales y reportes',
    description: 'Consulta de transacciones globales, auditoría y reportes.',
    icon: HiCode,
    endpoints: [
      {
        method: 'GET',
        path: '/api/admin/transactions',
        description: 'Transacciones globales del sistema con filtros por estado, tipo, dirección y fechas.',
        auth: 'admin'
      },
      {
        method: 'GET',
        path: '/api/admin/audit/logs',
        description: 'Logs de auditoría del sistema (acciones de usuarios y admins).',
        auth: 'super_admin'
      },
      {
        method: 'GET',
        path: '/api/admin/reports',
        description: 'Listado de reportes generados (historial, filtros, columnas).',
        auth: 'admin'
      }
    ]
  },
  {
    id: 'admin-central-wallet',
    title: 'Admin - Wallet central y solicitudes',
    description: 'Estado de la wallet central, configuración y flujo de liquidaciones / retiros.',
    icon: HiLightningBolt,
    endpoints: [
      {
        method: 'GET',
        path: '/api/admin/central-wallet/status',
        description: 'Estado de la wallet central (balance, red, token).',
        auth: 'super_admin'
      },
      {
        method: 'GET',
        path: '/api/admin/central-wallet/activity',
        description: 'Listado de movimientos de la wallet central (entradas/salidas de HC).',
        auth: 'super_admin'
      },
      {
        method: 'GET',
        path: '/api/admin/central-wallet/config',
        description: 'Obtiene la configuración actual de la wallet central (dirección, token, etc.).',
        auth: 'super_admin'
      },
      {
        method: 'PUT',
        path: '/api/admin/central-wallet/config',
        description: 'Actualiza las credenciales/configuración de la wallet central.',
        auth: 'super_admin'
      },
      {
        method: 'GET',
        path: '/api/admin/central-wallet/settlements',
        description: 'Listado de solicitudes de liquidación de negocios/equipos (pendientes, pagadas, rechazadas).',
        auth: 'admin'
      },
      {
        method: 'POST',
        path: '/api/admin/central-wallet/settlements/:settlementId/approve',
        description: 'Aprueba una solicitud de liquidación (marca como pagada y envía recibo).',
        auth: 'super_admin'
      },
      {
        method: 'POST',
        path: '/api/admin/central-wallet/settlements/:settlementId/reject',
        description: 'Rechaza una solicitud de liquidación con notas opcionales.',
        auth: 'super_admin'
      },
      {
        method: 'GET',
        path: '/api/admin/central-wallet/withdrawals',
        description: 'Listado de solicitudes de retiro de usuarios (pendientes, aprobadas, rechazadas).',
        auth: 'admin'
      },
      {
        method: 'POST',
        path: '/api/admin/central-wallet/withdrawals/:withdrawalId/approve',
        description: 'Aprueba una solicitud de retiro de usuario (genera movimiento desde wallet central).',
        auth: 'super_admin'
      },
      {
        method: 'POST',
        path: '/api/admin/central-wallet/withdrawals/:withdrawalId/reject',
        description: 'Rechaza una solicitud de retiro de usuario con notas opcionales.',
        auth: 'super_admin'
      },
      {
        method: 'GET',
        path: '/api/admin/settings/email',
        description: 'Obtiene la configuración actual del proveedor de correo (Resend / Mailtrap).',
        auth: 'super_admin'
      },
      {
        method: 'PUT',
        path: '/api/admin/settings/email',
        description: 'Actualiza la configuración del proveedor de correo usada por el sistema.',
        auth: 'super_admin'
      }
    ]
  }
];

const authLabel: Record<Endpoint['auth'], string> = {
  public: 'Pública',
  user: 'Usuario autenticado',
  admin: 'Admin',
  super_admin: 'Super admin'
};

const methodColors: Record<Endpoint['method'], string> = {
  GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
  POST: 'bg-blue-500/10 text-blue-400 border-blue-500/40',
  PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/40',
  DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/40'
};

export default function ApiDocs() {
  const [activeModule, setActiveModule] = useState<
    'user-auth' | 'user-wallet' | 'user-events' | 'admin-users' | 'admin-events' | 'admin-transactions' | 'admin-central-wallet'
  >('user-auth');

  const selectedUserSection =
    activeModule === 'user-auth'
      ? userSections.find((s) => s.id === 'auth')
      : activeModule === 'user-wallet'
      ? userSections.find((s) => s.id === 'wallet')
      : activeModule === 'user-events'
      ? userSections.find((s) => s.id === 'events')
      : null;

  const selectedAdminSection =
    activeModule === 'admin-users'
      ? adminSections.find((s) => s.id === 'admin-core')
      : activeModule === 'admin-events'
      ? adminSections.find((s) => s.id === 'events-admin')
      : activeModule === 'admin-transactions'
      ? adminSections.find((s) => s.id === 'admin-transactions')
      : activeModule === 'admin-central-wallet'
      ? adminSections.find((s) => s.id === 'admin-central-wallet')
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-red to-primary-red/80 border border-primary-red/40 text-white flex items-center justify-center shadow-lg flex-shrink-0">
            <HiBookOpen className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Documentación de API</h1>
            <p className="text-sm text-gray-400 max-w-2xl">
              Referencia rápida de los endpoints principales utilizados por Mises Wallet. Usa esta página como guía interna para debugging y para entender cómo se comunica el frontend con el backend.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-bg border border-dark-border text-xs text-gray-400">
              <HiLink className="w-4 h-4 text-primary-red" />
              <span>
                Base URL actual:&nbsp;
                <code className="font-mono text-primary-red text-xs">{baseUrl}</code>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal: sidebar de módulos + contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px,minmax(0,1fr)] gap-6 items-start">
        {/* Sidebar de módulos */}
        <aside className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Módulos (Usuarios)</h2>
            <p className="text-xs text-gray-500">Endpoints consumidos por la app de usuario.</p>
          </div>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveModule('user-auth')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                activeModule === 'user-auth'
                  ? 'bg-primary-red/10 border-primary-red/40 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-dark-bg border-transparent hover:border-primary-red/30'
              }`}
            >
              Autenticación
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('user-wallet')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                activeModule === 'user-wallet'
                  ? 'bg-primary-red/10 border-primary-red/40 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-dark-bg border-transparent hover:border-primary-red/30'
              }`}
            >
              Wallet de usuario
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('user-events')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                activeModule === 'user-events'
                  ? 'bg-primary-red/10 border-primary-red/40 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-dark-bg border-transparent hover:border-primary-red/30'
              }`}
            >
              Eventos y notificaciones
            </button>
          </nav>
          <div className="pt-4 border-t border-dark-border">
            <h2 className="text-sm font-semibold text-white mb-1">Módulos (Admin)</h2>
            <p className="text-xs text-gray-500">Endpoints usados por el panel de administración.</p>
          </div>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveModule('admin-users')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                activeModule === 'admin-users'
                  ? 'bg-primary-red/10 border-primary-red/40 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-dark-bg border-transparent hover:border-primary-red/30'
              }`}
            >
              Usuarios y roles
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('admin-events')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                activeModule === 'admin-events'
                  ? 'bg-primary-red/10 border-primary-red/40 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-dark-bg border-transparent hover:border-primary-red/30'
              }`}
            >
              Eventos y negocios
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('admin-transactions')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                activeModule === 'admin-transactions'
                  ? 'bg-primary-red/10 border-primary-red/40 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-dark-bg border-transparent hover:border-primary-red/30'
              }`}
            >
              Transacciones y reportes
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('admin-central-wallet')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                activeModule === 'admin-central-wallet'
                  ? 'bg-primary-red/10 border-primary-red/40 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-dark-bg border-transparent hover:border-primary-red/30'
              }`}
            >
              Wallet central y correo
            </button>
          </nav>
        </aside>

        {/* Contenido derecho */}
        <div className="space-y-10">
      {/* Sección: APIs para usuarios finales */}
      {selectedUserSection && (
      <div className="space-y-4">
        <section
          key={selectedUserSection.id}
          className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center">
              <selectedUserSection.icon className="w-5 h-5 text-primary-red" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{selectedUserSection.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{selectedUserSection.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {selectedUserSection.endpoints.map((ep) => (
                    <div
                      key={`${ep.method}-${ep.path}`}
                      className="border border-dark-border rounded-lg bg-dark-bg/60 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${methodColors[ep.method]}`}
                          >
                            {ep.method}
                          </span>
                          <code className="font-mono text-xs text-primary-red bg-dark-bg px-2 py-1 rounded-md">
                            {ep.path}
                          </code>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          Auth:&nbsp;
                          <span className="text-gray-200">{authLabel[ep.auth]}</span>
                        </span>
                      </div>
                      <div className="px-4 py-3 space-y-3">
                        <p className="text-xs text-gray-300">{ep.description}</p>
                        {ep.rateLimitNote && (
                          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/40 px-2.5 py-1 text-[11px] text-amber-300">
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                            Rate limit: {ep.rateLimitNote}
                          </div>
                        )}
                        {ep.params && ep.params.length > 0 && (
                          <div className="mt-2">
                            <p className="text-[11px] font-semibold text-gray-400 mb-2">
                              Parámetros:
                            </p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-[11px]">
                                <thead>
                                  <tr className="text-gray-400">
                                    <th className="text-left pb-1 pr-3 font-semibold">Nombre</th>
                                    <th className="text-left pb-1 pr-3 font-semibold">Tipo</th>
                                    <th className="text-left pb-1 font-semibold">Descripción</th>
                                  </tr>
                                </thead>
                                <tbody className="align-top">
                                  {ep.params.map((p) => (
                                    <tr key={p.name} className="text-gray-300">
                                      <td className="py-1 pr-3">
                                        <span className="font-mono text-[11px] bg-dark-bg px-2 py-0.5 rounded">
                                          {p.name}
                                        </span>
                                        {p.required ? (
                                          <span className="ml-1 inline-flex px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/40 text-[10px] text-rose-300">
                                            requerido
                                          </span>
                                        ) : (
                                          <span className="ml-1 inline-flex px-1.5 py-0.5 rounded-full bg-gray-500/10 border border-gray-500/40 text-[10px] text-gray-300">
                                            opcional
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-1 pr-3 text-gray-400">{p.type}</td>
                                      <td className="py-1 text-gray-300">{p.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
            ))}
          </div>
        </section>
      </div>
      )}

      {/* Sección: APIs para administración */}
      {selectedAdminSection && (
      <div className="space-y-4">
        <section
          key={selectedAdminSection.id}
          className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center">
              <selectedAdminSection.icon className="w-5 h-5 text-primary-red" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{selectedAdminSection.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{selectedAdminSection.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {selectedAdminSection.endpoints.map((ep) => (
                    <div
                      key={`${ep.method}-${ep.path}`}
                      className="border border-dark-border rounded-lg bg-dark-bg/60 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${methodColors[ep.method]}`}
                          >
                            {ep.method}
                          </span>
                          <code className="font-mono text-xs text-primary-red bg-dark-bg px-2 py-1 rounded-md">
                            {ep.path}
                          </code>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          Auth:&nbsp;
                          <span className="text-gray-200">{authLabel[ep.auth]}</span>
                        </span>
                      </div>
                      <div className="px-4 py-3 space-y-3">
                        <p className="text-xs text-gray-300">{ep.description}</p>
                        {ep.rateLimitNote && (
                          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/40 px-2.5 py-1 text-[11px] text-amber-300">
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                            Rate limit: {ep.rateLimitNote}
                          </div>
                        )}
                        {ep.params && ep.params.length > 0 && (
                          <div className="mt-2">
                            <p className="text-[11px] font-semibold text-gray-400 mb-2">
                              Parámetros:
                            </p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-[11px]">
                                <thead>
                                  <tr className="text-gray-400">
                                    <th className="text-left pb-1 pr-3 font-semibold">Nombre</th>
                                    <th className="text-left pb-1 pr-3 font-semibold">Tipo</th>
                                    <th className="text-left pb-1 font-semibold">Descripción</th>
                                  </tr>
                                </thead>
                                <tbody className="align-top">
                                  {ep.params.map((p) => (
                                    <tr key={p.name} className="text-gray-300">
                                      <td className="py-1 pr-3">
                                        <span className="font-mono text-[11px] bg-dark-bg px-2 py-0.5 rounded">
                                          {p.name}
                                        </span>
                                        {p.required ? (
                                          <span className="ml-1 inline-flex px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/40 text-[10px] text-rose-300">
                                            requerido
                                          </span>
                                        ) : (
                                          <span className="ml-1 inline-flex px-1.5 py-0.5 rounded-full bg-gray-500/10 border border-gray-500/40 text-[10px] text-gray-300">
                                            opcional
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-1 pr-3 text-gray-400">{p.type}</td>
                                      <td className="py-1 text-gray-300">{p.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
            ))}
          </div>
        </section>
      </div>
      )}
        </div>
      </div>
    </div>
  );
}


