import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCalendar,
  HiLocationMarker,
  HiClock,
  HiUsers,
  HiQrcode,
  HiMail,
  HiCheckCircle,
  HiCurrencyDollar,
  HiExclamationCircle,
  HiQuestionMarkCircle,
  HiX,
  HiArrowUp,
  HiArrowDown,
  HiArrowRight
} from 'react-icons/hi';

interface EventSummary {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  time?: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  status: 'Activo' | 'Pendiente';
  avatarColor: string;
}

interface WalletActivity {
  id: number;
  description: string;
  amount: number;
  type: 'entrada' | 'salida';
  date: string;
}

interface EventWallet {
  address: string;
  balance: number;
  currency: string;
  lastUpdated: string;
  activity: WalletActivity[];
}

interface OrganizerEventDetail {
  event: EventSummary;
  teamName: string;
  groupId: string;
  teamMembers: TeamMember[];
  wallet: EventWallet;
  metrics: {
    organizers: number;
    volunteers: number;
    sponsors: number;
  };
}

const organizerEventDetails: Record<number, OrganizerEventDetail> = {
  101: {
    event: {
      id: 101,
      title: 'Evento de Tecnología UFM',
      date: '2024-12-05',
      location: 'Auditorio Principal',
      description:
        'Jornada de innovación donde se presentarán las últimas tendencias en tecnología, emprendimiento y blockchain.',
      time: '10:00 AM - 6:00 PM'
    },
    wallet: {
      address: '0xA94F1C-TEAM-101-UFM',
      balance: 1520.45,
      currency: 'UFM',
      lastUpdated: '2024-11-10T14:30:00',
      activity: [
        {
          id: 1,
          description: 'Aporte patrocinador TechCorp',
          amount: 500,
          type: 'entrada',
          date: '2024-11-09T09:15:00'
        },
        {
          id: 2,
          description: 'Compra de material promocional',
          amount: 120,
          type: 'salida',
          date: '2024-11-07T16:45:00'
        },
        {
          id: 3,
          description: 'Pago coffee break',
          amount: 210,
          type: 'salida',
          date: '2024-11-05T12:10:00'
        }
      ]
    },
    teamMembers: [
      {
        id: 1,
        name: 'Ana López',
        role: 'Coordinadora general',
        email: 'ana.lopez@ufm.edu',
        status: 'Activo',
        avatarColor: 'bg-primary-red'
      },
      {
        id: 2,
        name: 'Carlos Méndez',
        role: 'Producción y logística',
        email: 'carlos.mendez@ufm.edu',
        status: 'Activo',
        avatarColor: 'bg-emerald-500'
      },
      {
        id: 3,
        name: 'Lucía Fernández',
        role: 'Relaciones públicas',
        email: 'lucia.fernandez@ufm.edu',
        status: 'Activo',
        avatarColor: 'bg-blue-500'
      },
      {
        id: 4,
        name: 'Mario González',
        role: 'Diseño y marketing',
        email: 'mario.gonzalez@ufm.edu',
        status: 'Pendiente',
        avatarColor: 'bg-purple-500'
      }
    ],
    teamName: 'Equipo Tecnología UFM',
    groupId: 'TEAM-TECH-101',
    metrics: {
      organizers: 8,
      volunteers: 20,
      sponsors: 4
    }
  },
  102: {
    event: {
      id: 102,
      title: 'Taller de Blockchain',
      date: '2025-01-10',
      location: 'Sala de Conferencias',
      description: 'Sesión práctica para crear smart contracts y explorar casos de uso en la universidad.',
      time: '2:00 PM - 6:00 PM'
    },
    wallet: {
      address: '0x9BC21F-TEAM-102-UFM',
      balance: 860.9,
      currency: 'UFM',
      lastUpdated: '2024-11-08T11:05:00',
      activity: [
        {
          id: 1,
          description: 'Inscripciones tempranas',
          amount: 320,
          type: 'entrada',
          date: '2024-11-06T10:00:00'
        },
        {
          id: 2,
          description: 'Servicio de streaming',
          amount: 150,
          type: 'salida',
          date: '2024-11-04T17:20:00'
        },
        {
          id: 3,
          description: 'Material impreso',
          amount: 75,
          type: 'salida',
          date: '2024-11-03T15:40:00'
        }
      ]
    },
    teamMembers: [
      {
        id: 1,
        name: 'Laura Martínez',
        role: 'Facilitadora principal',
        email: 'laura.martinez@ufm.edu',
        status: 'Activo',
        avatarColor: 'bg-primary-red'
      },
      {
        id: 2,
        name: 'Sergio Díaz',
        role: 'Apoyo técnico',
        email: 'sergio.diaz@ufm.edu',
        status: 'Activo',
        avatarColor: 'bg-indigo-500'
      },
      {
        id: 3,
        name: 'Patricia Castillo',
        role: 'Comunicación y prensa',
        email: 'patricia.castillo@ufm.edu',
        status: 'Activo',
        avatarColor: 'bg-teal-500'
      }
    ],
    teamName: 'Equipo Taller Blockchain',
    groupId: 'TEAM-BLOCK-102',
    metrics: {
      organizers: 5,
      volunteers: 10,
      sponsors: 2
    }
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return `${formatDate(dateString)} · ${date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
};

const formatAmount = (amount: number, currency = 'UFM') => {
  return `${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

export default function EventOrganizer() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [showQrModal, setShowQrModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const detail = useMemo(() => {
    if (!eventId) return undefined;
    const numericId = parseInt(eventId, 10);
    return organizerEventDetails[numericId];
  }, [eventId]);

  if (!detail) {
    return (
      <div className="space-y-8 sm:space-y-10">
        <button
          onClick={() => navigate('/events')}
          className="inline-flex items-center space-x-2 text-sm sm:text-base text-gray-400 hover:text-white transition-colors"
        >
          <HiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Volver a eventos</span>
        </button>
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center space-y-4">
          <HiExclamationCircle className="w-12 h-12 sm:w-16 sm:h-16 text-primary-red mx-auto" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">No encontramos este evento</h2>
          <p className="text-sm sm:text-base text-gray-400">
            Verifica que el enlace sea correcto o regresa a la sección de eventos para seleccionar otro evento.
          </p>
          <button
            onClick={() => navigate('/events')}
            className="px-5 py-3 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg sm:rounded-xl font-semibold transition-colors"
          >
            Ir a eventos
          </button>
        </div>
      </div>
    );
  }

  const { event, wallet, teamMembers, metrics, teamName, groupId } = detail;

  return (
    <div>
      <div className="mt-5 mb-4">
        <button
          onClick={() => navigate('/events')}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors bg-dark-card border border-dark-border px-3 py-2 rounded-lg"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Volver a eventos</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mt-5">
          <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <HiCalendar className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Gestión del evento</h2>
              <p className="text-sm sm:text-base text-gray-400 truncate">Organiza y administra: {event.title}</p>
              <p className="text-xs sm:text-sm text-gray-500 truncate mt-1">
                Equipo: {teamName} · ID: {groupId}
              </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-500 border border-dark-border rounded-full px-3 py-1.5">
            <HiCheckCircle className="w-4 h-4 text-primary-red" />
            <span>Organizador confirmado</span>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
          >
            <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <span className="inline-flex items-center space-x-2 bg-dark-card border border-dark-border px-3 py-2 rounded-lg text-gray-300">
            <HiCalendar className="w-4 h-4 text-primary-red" />
            <span>{formatDate(event.date)}</span>
          </span>
          {event.time && (
            <span className="inline-flex items-center space-x-2 bg-dark-card border border-dark-border px-3 py-2 rounded-lg text-gray-300">
              <HiClock className="w-4 h-4 text-primary-red" />
              <span>{event.time}</span>
            </span>
          )}
          <span className="inline-flex items-center space-x-2 bg-dark-card border border-dark-border px-3 py-2 rounded-lg text-gray-300">
            <HiLocationMarker className="w-4 h-4 text-primary-red" />
            <span>{event.location}</span>
          </span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-primary-red/20 via-primary-red/10 to-primary-red/5 border border-primary-red/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary-red/5"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Wallet del equipo</h2>
                <p className="text-sm text-gray-300 mt-1">Fondos compartidos para gastos operativos del evento.</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Balance disponible</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {formatAmount(wallet.balance, wallet.currency)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-dark-bg/70 border border-dark-border rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
                  <HiCurrencyDollar className="w-4 h-4 text-primary-red" />
                  <span>Identificador del equipo</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base text-white font-semibold">{teamName}</p>
                  <p className="text-xs sm:text-sm text-gray-400">Grupo ID: {groupId}</p>
                  <p className="text-xs text-gray-500">
                    Usa este ID para recibir pagos de comercios o compartirlo con tu equipo.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-primary-red rounded-lg sm:rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                <HiQrcode className="w-5 h-5" />
                <span>Ver QR del grupo</span>
              </button>
              <button
                className="inline-flex items-center space-x-2 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg sm:rounded-xl text-sm text-white hover:bg-dark-bg/80 transition-colors"
              >
                <HiMail className="w-4 h-4" />
                <span>Compartir con el equipo</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-transparent space-y-4 mt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">
              Actividad del equipo
            </h3>
            {wallet.activity.length > 0 && (
              <button
                className="text-xs sm:text-sm text-primary-red hover:text-primary-red/80 transition-colors flex items-center space-x-1"
                type="button"
              >
                <span>Ver todas</span>
                <HiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
          {wallet.activity.length === 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center text-gray-400">
              Sin movimientos recientes
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {wallet.activity.map((movement) => (
                <div
                  key={movement.id}
                  className="bg-dark-card/80 border border-dark-border rounded-2xl p-5 sm:p-6 flex items-center justify-between hover:border-primary-red/30 transition-all"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                        movement.type === 'entrada' ? 'bg-positive/10' : 'bg-primary-red/10'
                      }`}
                    >
                      {movement.type === 'entrada' ? (
                        <HiArrowDown className="w-6 h-6 text-positive" />
                      ) : (
                        <HiArrowUp className="w-6 h-6 text-primary-red" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-white truncate">
                        {movement.description || 'Movimiento'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(movement.date)}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p
                      className={`text-base font-semibold ${
                        movement.type === 'entrada' ? 'text-positive' : 'text-primary-red'
                      }`}
                    >
                      {movement.type === 'entrada' ? '+' : '-'}
                      {movement.amount.toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}{' '}
                      {wallet.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {wallet.activity.length > 0 && (
            <button
              type="button"
              className="w-full border-2 border-primary-red/40 hover:border-primary-red/60 rounded-2xl py-4 text-primary-red font-semibold flex items-center justify-center space-x-2 transition-all"
            >
              <span>Ver todas</span>
              <HiArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      <div className="space-y-4 mt-8">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">
            Miembros del equipo organizador
          </h3>
          <span className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark-card border border-dark-border rounded-full text-xs text-gray-400">
            <HiUsers className="w-4 h-4 text-primary-red" />
            <span>{teamMembers.length} integrantes</span>
          </span>
        </div>
        {teamMembers.length === 0 ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center text-gray-400">
            No hay miembros registrados
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-dark-card/80 border border-dark-border rounded-2xl p-5 sm:p-6 flex items-start space-x-4 hover:border-primary-red/30 transition-all"
              >
                <div
                  className={`${member.avatarColor} w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg`}
                >
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm sm:text-base font-semibold text-white truncate">{member.name}</p>
                    <span
                      className={`text-xs sm:text-sm px-2 py-1 rounded-full ${
                        member.status === 'Activo'
                          ? 'bg-primary-red/10 text-primary-red border border-primary-red/40'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">{member.role}</p>
                  <div className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-300 bg-dark-bg border border-dark-border px-3 py-1.5 rounded-lg">
                    <HiMail className="w-4 h-4 text-primary-red" />
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-4 mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-bold text-white">Opciones</h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-400 max-w-2xl">
            Si necesitas abandonar el equipo organizador, puedes hacerlo aquí. Tu acceso a la wallet y a los recursos
            compartidos se revocará automáticamente.
          </p>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="inline-flex items-center justify-center px-4 sm:px-5 py-3 border border-dark-border text-negative hover:text-negative/80 hover:border-negative/50 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-colors"
          >
            Salir del grupo organizador
          </button>
        </div>
      </div>

      {showQrModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowQrModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Wallet del equipo</h3>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
                <HiQrcode className="w-40 h-40 text-gray-700" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Escanea este código para recibir fondos en la wallet del equipo.</p>
                <p className="text-xs text-gray-500 font-mono break-all">{wallet.address}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {showLeaveModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowLeaveModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-red/10 rounded-lg flex items-center justify-center text-primary-red">
                  <HiExclamationCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">¿Seguro que quieres salir?</h3>
                  <p className="text-sm text-gray-400">
                    Perderás acceso a la wallet del equipo y ya no recibirás actualizaciones del evento.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg sm:rounded-xl text-sm text-white hover:bg-dark-bg/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 bg-primary-red text-white rounded-lg sm:rounded-xl text-sm font-semibold hover:bg-primary-red/90 transition-colors"
                >
                  Confirmar salida
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showHelp && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowHelp(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Ayuda</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all"
                >
                  <HiX className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="space-y-3 text-sm sm:text-base text-gray-300">
                <p>Consulta esta vista para ver la información clave de tu equipo organizador.</p>
                <p>Revisa el balance compartido, los integrantes del equipo y el QR de la wallet del evento.</p>
                <p>Si ya no quieres ser parte del equipo, usa la opción "Salir del grupo organizador".</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


