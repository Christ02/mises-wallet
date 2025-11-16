import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiCalendar,
  HiLocationMarker,
  HiClock,
  HiUsers,
  HiCog,
  HiQuestionMarkCircle,
  HiX,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi';
import { fetchUserEvents, UserEvent } from '../services/events';
import { API_BASE_URL } from '../../../services/api';

export default function Events() {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<UserEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<UserEvent[]>([]);
  const [organizerEvents, setOrganizerEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentModalImageIndex, setCurrentModalImageIndex] = useState(0);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await fetchUserEvents();
        setUpcomingEvents(response.upcoming || []);
        setOrganizerEvents(response.organizer || []);
      } catch (err: any) {
        console.error('Error loading events:', err);
        setError(err.response?.data?.error || 'No se pudieron cargar los eventos');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) {
      return 'Fecha por definir';
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'Fecha por definir';
    }
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  const visibleUpcomingEvents = useMemo(
    () =>
      upcomingEvents.filter(
        (event) => (event.status || '').toLowerCase() !== 'borrador'
      ),
    [upcomingEvents]
  );

  const featuredEvent = useMemo(() => {
    if (visibleUpcomingEvents.length === 0) return null;
    const now = new Date();
    const upcoming = visibleUpcomingEvents
      .filter((event) => new Date(event.event_date) >= now)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    return upcoming[0] || visibleUpcomingEvents[0];
  }, [visibleUpcomingEvents]);

  const buildCoverImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  const modalImages = useMemo(() => {
    if (!selectedEvent) return [];
    const photos = (selectedEvent as any).photos as string[] | undefined;
    const urls: string[] = [];
    if (photos && photos.length) {
      urls.push(...photos);
    }
    if (selectedEvent.cover_image_url && !urls.includes(selectedEvent.cover_image_url)) {
      urls.unshift(selectedEvent.cover_image_url);
    }
    return urls;
  }, [selectedEvent]);

  useEffect(() => {
    setCurrentModalImageIndex(0);
  }, [selectedEvent]);

  return (
    <div>
        {/* Header Section */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <HiCalendar className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Eventos</h2>
              <p className="text-sm sm:text-base text-gray-400">Próximos eventos y actividades</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
          >
            <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Featured Event Card */}
        {featuredEvent && (
          <div className="bg-gradient-to-br from-primary-red/20 via-primary-red/10 to-primary-red/5 border border-primary-red/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 relative overflow-hidden mt-8 sm:mt-10 lg:mt-12">
            <div className="absolute inset-0 bg-primary-red/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">{featuredEvent.name}</h3>
                  <p className="text-sm sm:text-base text-gray-300 line-clamp-2">{featuredEvent.description}</p>
                </div>
                <HiCalendar className="w-12 h-12 sm:w-16 sm:h-16 text-primary-red/80 flex-shrink-0 ml-4" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <HiClock className="w-4 h-4 text-primary-red" />
                  <span>
                    {formatDate(featuredEvent.event_date)}
                    {featuredEvent.start_time && ` • ${featuredEvent.start_time}`}
                    {featuredEvent.end_time && ` - ${featuredEvent.end_time}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <HiLocationMarker className="w-4 h-4 text-primary-red" />
                  <span>{featuredEvent.location || 'Por confirmar'}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(featuredEvent)}
                className="mt-4 sm:mt-5 px-4 sm:px-6 py-2 sm:py-3 bg-white text-primary-red rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-100 transition-all"
              >
                Ver detalles
              </button>
            </div>
          </div>
        )}

        {/* EVENTOS DISPONIBLES Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 font-semibold">EVENTOS DISPONIBLES</h3>

          {loading ? (
            <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-8 sm:p-10 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-gray-400">Cargando eventos...</p>
            </div>
          ) : error ? (
            <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-8 sm:p-10 text-center text-sm sm:text-base text-negative">
              {error}
            </div>
          ) : visibleUpcomingEvents.length === 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
              <HiCalendar className="w-14 h-14 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-base sm:text-lg text-gray-400 mb-2">No hay eventos disponibles por ahora</p>
              <p className="text-sm sm:text-base text-gray-500">Vuelve más tarde para descubrir nuevos eventos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden pb-6 sm:pb-8 lg:pb-10 scrollbar-hide">
              <div className="flex space-x-4 sm:space-x-5 lg:space-x-6" style={{ width: 'max-content' }}>
                {visibleUpcomingEvents.map((event) => {
                  const coverImage = buildCoverImageUrl(event.cover_image_url);
                  return (
                    <div
                      key={event.id}
                      className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 shadow-lg hover:border-primary-red/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col w-[calc((100vw-4rem-1rem)/2)] sm:w-72 lg:w-80"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="h-32 sm:h-40 lg:h-48 flex-shrink-0 relative overflow-hidden bg-gradient-to-b from-red-900/80 via-red-700/60 to-red-900/80">
                        {coverImage && (
                          <img
                            src={coverImage}
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <HiCalendar className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-primary-red relative z-10 mx-4 my-3" />
                      </div>
                      <div className="p-5 sm:p-6 lg:p-8 flex-1 flex flex-col justify-between bg-dark-card">
                        <div>
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                            {event.name}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-400 font-medium">
                            {formatDate(event.event_date)}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{event.location}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* MIS EVENTOS Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <h3 className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 font-semibold">
            MIS EVENTOS COMO ORGANIZADOR
          </h3>

          {loading ? (
            <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-gray-400">Cargando tus eventos...</p>
            </div>
          ) : organizerEvents.length === 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-8 sm:p-12 lg:p-16 xl:p-20 text-center">
              <HiUsers className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
              <p className="text-base sm:text-lg text-gray-400 mb-2">No tienes eventos como organizador</p>
              <p className="text-sm sm:text-base text-gray-500">Los eventos que organices aparecerán aquí</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden pb-6 sm:pb-8 lg:pb-10 scrollbar-hide">
              <div className="flex space-x-4 sm:space-x-5 lg:space-x-6" style={{ width: 'max-content' }}>
                {organizerEvents.map((event) => {
                  const coverImage = buildCoverImageUrl(event.cover_image_url);
                  return (
                    <div
                      key={event.id}
                      className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 shadow-lg hover:border-primary-red/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col w-[calc((100vw-4rem-1rem)/2)] sm:w-72 lg:w-80"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="h-32 sm:h-40 lg:h-48 flex-shrink-0 relative overflow-hidden bg-gradient-to-b from-red-900/80 via-red-700/60 to-red-900/80">
                        {coverImage && (
                          <img
                            src={coverImage}
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <HiCalendar className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-primary-red relative z-10 mx-4 my-3" />
                      </div>
                      <div className="p-5 sm:p-6 lg:p-8 flex-1 flex flex-col justify-between bg-dark-card">
                        <div>
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                            {event.name}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-400 font-medium mb-2">
                            {formatDate((event as any).date || event.event_date)}
                          </p>
                          <div className="inline-flex items-center space-x-1 bg-transparent border border-primary-red/50 text-primary-red px-2 py-1 rounded-lg text-xs font-semibold mt-2">
                            <HiCog className="w-3 h-3" />
                            <span>Organizador</span>
                          </div>
                          {event.groupId && (
                            <p className="text-xs text-gray-500 mt-2">Group ID: {event.groupId}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setSelectedEvent(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl max-w-md w-full p-6 sm:p-8 lg:p-10 xl:p-12 shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6">
                  <div className="h-48 sm:h-56 bg-gradient-to-br from-primary-red/30 via-primary-red/20 to-primary-red/10 rounded-lg sm:rounded-xl mb-4 sm:mb-6 relative overflow-hidden">
                    {modalImages.length > 0 && buildCoverImageUrl(modalImages[currentModalImageIndex]) ? (
                      <>
                        <img
                          src={buildCoverImageUrl(modalImages[currentModalImageIndex])!}
                          alt={selectedEvent.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                        {modalImages.length > 1 && (
                          <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-3">
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentModalImageIndex((prev) =>
                                  prev === 0 ? modalImages.length - 1 : prev - 1
                                )
                              }
                              className="p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors"
                            >
                              <HiChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentModalImageIndex((prev) =>
                                  prev === modalImages.length - 1 ? 0 : prev + 1
                                )
                              }
                              className="p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors"
                            >
                              <HiChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                        {modalImages.length > 1 && (
                          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
                            {modalImages.map((_, index) => (
                              <button
                                key={`${selectedEvent.id}-dot-${index}`}
                                type="button"
                                onClick={() => setCurrentModalImageIndex(index)}
                                className={`h-1.5 rounded-full transition-all ${
                                  index === currentModalImageIndex ? 'w-4 bg-white' : 'w-2 bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <HiCalendar className="w-16 h-16 sm:w-20 sm:h-20 text-primary-red/90" />
                      </div>
                    )}
                    {organizerEvents.some(e => e.id === selectedEvent.id) && (
                      <div className="absolute top-3 right-3 bg-primary-red text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 z-10">
                        <HiCog className="w-3 h-3" />
                        <span>Organizador</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">{selectedEvent.name}</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-3 text-sm sm:text-base text-gray-400">
                      <HiCalendar className="w-5 h-5 text-primary-red" />
                      <span>{formatDate(selectedEvent.event_date)}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm sm:text-base text-gray-400">
                      <HiLocationMarker className="w-5 h-5 text-primary-red" />
                      <span>{selectedEvent.location || 'Por confirmar'}</span>
                    </div>
                    {(selectedEvent.start_time || selectedEvent.end_time) && (
                      <div className="flex items-center space-x-3 text-sm sm:text-base text-gray-400">
                        <HiClock className="w-5 h-5 text-primary-red" />
                        <span>
                          {selectedEvent.start_time}
                          {selectedEvent.end_time && ` - ${selectedEvent.end_time}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-sm sm:text-base font-semibold text-white mb-2 sm:mb-3">Descripción</h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                    {selectedEvent.description || 'Aún no hay una descripción para este evento.'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 px-4 sm:px-6 py-3 bg-dark-bg border border-dark-border rounded-lg sm:rounded-xl text-white hover:bg-dark-bg/80 transition-colors text-sm sm:text-base font-medium"
                  >
                    Cerrar
                  </button>
                  {organizerEvents.some(e => e.id === selectedEvent.id) && (
                    <button
                      onClick={() => {
                        setSelectedEvent(null);
                        navigate(`/events/organizer/${selectedEvent.id}`);
                      }}
                      className="flex-1 px-4 sm:px-6 py-3 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base font-medium flex items-center justify-center space-x-2"
                    >
                      <HiCog className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Gestionar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

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
                    En esta sección puedes explorar todos los eventos disponibles en la universidad e inscribirte a los que te interesen.
                  </p>
                  <p>
                    Si eres organizador de eventos, podrás gestionar tus eventos desde la sección "Mis Eventos como Organizador".
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
