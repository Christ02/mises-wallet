import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCalendar,
  HiLocationMarker,
  HiUsers,
  HiQrcode,
  HiMail,
  HiCheckCircle,
  HiExclamationCircle,
  HiQuestionMarkCircle,
  HiX
} from 'react-icons/hi';
import {
  fetchOrganizerEventDetail,
  OrganizerEventDetail,
  requestSettlement
} from '../services/events';

const formatDate = (dateString: string) => {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export default function EventOrganizer() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<OrganizerEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const businessId = detail?.business.id;

  const loadDetail = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetchOrganizerEventDetail(Number(eventId));
      setDetail(response);
    } catch (err: any) {
      console.error('Error loading organizer detail', err);
      setError(err.response?.data?.error || 'No se pudo cargar la información del evento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const canRequestSettlement = useMemo(() => {
    if (!detail) return false;
    const isFinalized = detail.event.status === 'finalizado';
    const hasBalance = detail.wallet.balance > 0;
    const settlement = detail.settlement;
    const alreadyRequested =
      settlement && ['pendiente', 'pagado'].includes(settlement.status);
    return isFinalized && hasBalance && !alreadyRequested;
  }, [detail]);

  const handleRequestSettlement = async () => {
    if (!eventId || !businessId) return;
    try {
      setRequesting(true);
      setFeedback(null);
      await requestSettlement(Number(eventId), businessId, { method: 'efectivo' });
      setFeedback('Solicitud de liquidación enviada. El banco central te avisará cuando puedas recoger el efectivo.');
      await loadDetail();
    } catch (err: any) {
      console.error('Error requesting settlement', err);
      setFeedback(err.response?.data?.error || 'No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      setRequesting(false);
    }
  };

  const settlementStatus = detail?.settlement?.status ?? 'sin-solicitud';

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-4 w-40 bg-dark-border/60 animate-pulse rounded" />
        <div className="h-32 bg-dark-border/40 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (error || !detail) {
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
          <h2 className="text-xl sm:text-2xl font-bold text-white">No encontramos información para este evento</h2>
          <p className="text-sm sm:text-base text-gray-400">
            {error || 'Verifica que el enlace sea correcto o regresa a la sección de eventos.'}
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

      <div className="flex items-center justify-between mt-5">
        <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <HiCalendar className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Gestión del evento</h2>
            <p className="text-sm sm:text-base text-gray-400 truncate">Organiza y administra: {detail.event.name}</p>
            <p className="text-xs sm:text-sm text-gray-500 truncate mt-1">
              Equipo: {detail.business.name} · ID: {detail.business.groupId || '—'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
        >
          <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="mt-6 sm:mt-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <span className="inline-flex items-center space-x-2 bg-dark-card border border-dark-border px-3 py-2 rounded-lg text-gray-300">
            <HiCalendar className="w-4 h-4 text-primary-red" />
            <span>{formatDate(detail.event.date)}</span>
          </span>
          <span className="inline-flex items-center space-x-2 bg-dark-card border border-dark-border px-3 py-2 rounded-lg text-gray-300 capitalize">
            <HiCheckCircle className="w-4 h-4 text-primary-red" />
            <span>{detail.event.status}</span>
          </span>
          {detail.event.location && (
            <span className="inline-flex items-center space-x-2 bg-dark-card border border-dark-border px-3 py-2 rounded-lg text-gray-300">
              <HiLocationMarker className="w-4 h-4 text-primary-red" />
              <span>{detail.event.location}</span>
            </span>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary-red/20 via-primary-red/10 to-primary-red/5 border border-primary-red/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden mt-6 sm:mt-8">
        <div className="absolute inset-0 bg-primary-red/5" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Wallet del equipo</h2>
              <p className="text-sm text-gray-300 mt-1">
                Fondos actuales en HayekCoin. Este monto debe liquidarse al 100% con el banco central.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Balance disponible</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {detail.wallet.balance.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}{' '}
                {detail.wallet.tokenSymbol}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-dark-bg/70 border border-dark-border rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
                <HiUsers className="w-4 h-4 text-primary-red" />
                <span>Identificador del equipo</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm sm:text-base text-white font-semibold">{detail.business.name}</p>
                <p className="text-xs sm:text-sm text-gray-400">Grupo ID: {detail.business.groupId || '—'}</p>
                <p className="text-xs text-gray-500">
                  Usa este ID para recibir pagos de comercios o compartirlo con tu equipo.
                </p>
              </div>
            </div>
            <div className="bg-dark-bg/70 border border-dark-border rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
                <HiMail className="w-4 h-4 text-primary-red" />
                <span>Dirección de la wallet</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-mono break-words">
                {detail.wallet.address || 'Sin asignar'}
              </p>
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
            {canRequestSettlement && (
              <button
                onClick={handleRequestSettlement}
                disabled={requesting}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg sm:rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {requesting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Solicitando...</span>
                  </>
                ) : (
                  <>
                    <HiCheckCircle className="w-4 h-4" />
                    <span>Solicitar liquidación total</span>
                  </>
                )}
              </button>
            )}
          </div>
          {feedback && (
            <div className="bg-dark-bg/70 border border-dark-border rounded-xl p-4 text-xs sm:text-sm text-gray-300">
              {feedback}
            </div>
          )}
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6 mt-6 space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Estado de liquidación</h3>
        {detail.settlement ? (
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  settlementStatus === 'pendiente'
                    ? 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/30'
                    : settlementStatus === 'pagado'
                    ? 'bg-positive/10 text-positive border border-positive/30'
                    : 'bg-negative/10 text-negative border border-negative/30'
                }`}
              >
                {settlementStatus.toUpperCase()}
              </span>
              <span className="text-gray-400">
                {detail.settlement.amount.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}{' '}
                {detail.settlement.tokenSymbol}
              </span>
            </div>
            {detail.settlement.hash && (
              <div className="text-xs text-gray-500">
                Hash de transferencia: <span className="font-mono break-all">{detail.settlement.hash}</span>
              </div>
            )}
            {detail.settlement.notes && (
              <p className="text-xs text-gray-400">Notas: {detail.settlement.notes}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            Una vez finalizado el evento podrás liquidar el 100% del saldo solicitando que el banco central reciba tus
            HayekCoin y te entregue efectivo en la caja de la U.
          </p>
        )}
      </div>

      <div className="space-y-4 mt-8">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">
            Miembros del equipo organizador
          </h3>
          <span className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark-card border border-dark-border rounded-full text-xs text-gray-400">
            <HiUsers className="w-4 h-4 text-primary-red" />
            <span>{detail.members.length} integrantes</span>
          </span>
        </div>
        {detail.members.length === 0 ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center text-gray-400">
            No hay miembros registrados
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {detail.members.map((member) => (
              <div
                key={member.id}
                className="bg-dark-card/80 border border-dark-border rounded-2xl p-5 sm:p-6 flex items-start space-x-4 hover:border-primary-red/30 transition-all"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg bg-primary-red/40 border border-primary-red/30">
                  {(member.nombres || '')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || member.carnet.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm sm:text-base font-semibold text-white truncate">
                      {`${member.nombres || ''} ${member.apellidos || ''}`.trim() || member.carnet}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">{member.role || 'Miembro'}</p>
                  {member.email && (
                    <div className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-300 bg-dark-bg border border-dark-border px-3 py-1.5 rounded-lg">
                      <HiMail className="w-4 h-4 text-primary-red" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
                <p className="text-xs text-gray-500 font-mono break-all">{detail.wallet.address}</p>
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
                <p>Revisa el balance en HayekCoin, el estado de liquidación y los integrantes del equipo.</p>
                <p>Cuando el evento haya finalizado podrás solicitar que el banco central liquide tu saldo en efectivo.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


