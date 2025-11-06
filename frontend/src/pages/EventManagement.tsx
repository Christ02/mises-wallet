import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { 
  HiSearch,
  HiPlus,
  HiPencil,
  HiTrash,
  HiEye,
  HiEyeOff,
  HiX,
  HiCalendar,
  HiClock
} from 'react-icons/hi';

interface Event {
  id: number;
  nombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  ubicacion: string;
  estado: 'Publicado' | 'Borrador' | 'Finalizado';
  participantes: number;
}

export default function EventManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([
    { 
      id: 1, 
      nombre: 'Semana de la Libertad', 
      fecha: '22 Oct, 2024',
      horaInicio: '08:00',
      horaFin: '18:00',
      ubicacion: 'Campus Central',
      estado: 'Publicado',
      participantes: 245
    },
    { 
      id: 2, 
      nombre: 'Foro Económico Anual', 
      fecha: '15 Nov, 2024',
      horaInicio: '09:00',
      horaFin: '17:00',
      ubicacion: 'Auditorio Principal',
      estado: 'Borrador',
      participantes: 0
    },
    { 
      id: 3, 
      nombre: 'Hackathon Emprendimiento', 
      fecha: '05 Dic, 2024',
      horaInicio: '10:00',
      horaFin: '20:00',
      ubicacion: 'Laboratorio Innovación',
      estado: 'Publicado',
      participantes: 89
    },
  ]);

  const filteredEvents = events.filter(event =>
    event.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (estado: Event['estado']) => {
    switch (estado) {
      case 'Publicado':
        return 'bg-positive/10 text-positive border border-positive/20';
      case 'Borrador':
        return 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20';
      case 'Finalizado':
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Eventos</h1>
          <p className="text-gray-400">Administra todos los eventos de la plataforma</p>
        </div>

        {/* Search and Create */}
        <div className="bg-dark-card rounded-xl border border-dark-border p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
              />
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all whitespace-nowrap"
            >
              <HiPlus className="w-5 h-5" />
              Crear Evento
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-dark-card rounded-xl border border-dark-border p-6 hover:border-primary-red/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{event.nombre}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <HiCalendar className="w-4 h-4" />
                    <span>{event.fecha}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <HiClock className="w-4 h-4" />
                    <span>{event.horaInicio} - {event.horaFin}</span>
                  </div>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(event.estado)}`}>
                  {event.estado}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Ubicación:</span>
                  <span className="text-white font-medium">{event.ubicacion}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Participantes:</span>
                  <span className="text-white font-medium">{event.participantes}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-dark-border">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all">
                  <HiPencil className="w-4 h-4" />
                  <span className="text-sm font-medium">Editar</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-positive hover:bg-positive/10 rounded-lg transition-all">
                  {event.estado === 'Publicado' ? (
                    <>
                      <HiEye className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver</span>
                    </>
                  ) : (
                    <>
                      <HiEyeOff className="w-4 h-4" />
                      <span className="text-sm font-medium">Oculto</span>
                    </>
                  )}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-negative hover:bg-negative/10 rounded-lg transition-all">
                  <HiTrash className="w-4 h-4" />
                  <span className="text-sm font-medium">Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-2xl border border-dark-border w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-border sticky top-0 bg-dark-card z-10">
              <h2 className="text-xl font-bold text-white">Crear Nuevo Evento</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del Evento *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Semana de la Libertad"
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    placeholder="Campus Central"
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hora de Inicio *
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hora de Fin *
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe el evento..."
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado *
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                >
                  <option value="Borrador">Borrador</option>
                  <option value="Publicado">Publicado</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-dark-border">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2.5 bg-dark-bg hover:bg-dark-border text-gray-300 hover:text-white font-medium rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all"
              >
                Crear Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

