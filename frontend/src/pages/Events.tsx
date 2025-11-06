import { useState } from 'react';
import { HiCalendar, HiArrowRight, HiLocationMarker, HiClock } from 'react-icons/hi';
import Layout from '../components/layout/Layout';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
}

const events: Event[] = [
  {
    id: 1,
    title: 'Conferencia Blockchain 2024',
    date: '2024-11-15',
    location: 'Auditorio UFM',
    description: 'Conferencia sobre tecnología blockchain y su aplicación en el mundo financiero.'
  },
  {
    id: 2,
    title: 'Feria de Innovación',
    date: '2024-12-02',
    location: 'Campus UFM',
    description: 'Feria donde se presentan los proyectos más innovadores de estudiantes y profesores.'
  },
  {
    id: 3,
    title: 'Hackathon UFM',
    date: '2024-12-10',
    location: 'Centro de Innovación',
    description: 'Competencia de desarrollo donde equipos crean soluciones tecnológicas innovadoras.'
  },
  {
    id: 4,
    title: 'Workshop de Criptomonedas',
    date: '2024-12-20',
    location: 'Aula Magna',
    description: 'Taller práctico sobre el uso y seguridad de criptomonedas.'
  }
];

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Eventos</h1>
          <p className="text-sm sm:text-base text-gray-400">Próximos eventos y actividades</p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-primary-red/30 transition-colors cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="h-32 sm:h-40 bg-gradient-to-br from-primary-red/20 to-primary-red/5 flex items-center justify-center">
                <div className="w-20 h-20 border-2 border-dashed border-primary-red/50 rounded-lg flex items-center justify-center">
                  <HiCalendar className="w-10 h-10 text-primary-red/70" />
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                  {event.title}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <HiCalendar className="w-4 h-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <HiLocationMarker className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <button className="mt-4 flex items-center space-x-2 text-primary-red hover:text-primary-red/80 transition-colors text-sm font-medium">
                  <span>Ver detalles</span>
                  <HiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-dark-card border border-dark-border rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <div className="h-40 bg-gradient-to-br from-primary-red/20 to-primary-red/5 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-20 h-20 border-2 border-dashed border-primary-red/50 rounded-lg flex items-center justify-center">
                    <HiCalendar className="w-10 h-10 text-primary-red/70" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-4">{selectedEvent.title}</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <HiCalendar className="w-5 h-5" />
                    <span>{formatDate(selectedEvent.date)}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <HiLocationMarker className="w-5 h-5" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <HiClock className="w-5 h-5" />
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white mb-2">Descripción</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white hover:bg-dark-bg/80 transition-colors"
                >
                  Cerrar
                </button>
                <button className="flex-1 px-4 py-2 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg transition-colors">
                  Inscribirse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

