import { useState } from 'react';
import { 
  HiSearch,
  HiPlus,
  HiPencil,
  HiTrash,
  HiEye,
  HiEyeOff,
  HiX,
  HiCalendar,
  HiClock,
  HiArrowLeft,
  HiShoppingBag,
  HiUsers,
  HiUserAdd
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
  negocios?: Business[];
}

interface Business {
  id: number;
  nombre: string;
  descripcion: string;
  responsable: string;
  usuarios: BusinessUser[];
  ventasTotales: string;
}

interface BusinessUser {
  id: number;
  nombre: string;
  email: string;
  rol: 'Cajero' | 'Vendedor' | 'Gerente';
}

interface AvailableUser {
  id: number;
  nombre: string;
  email: string;
}

export default function EventManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateBusinessModal, setShowCreateBusinessModal] = useState(false);
  const [showAssignUsersModal, setShowAssignUsersModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [viewMode, setViewMode] = useState<'events' | 'businesses'>('events');
  
  const [events, setEvents] = useState<Event[]>([
    { 
      id: 1, 
      nombre: 'Semana de la Libertad', 
      fecha: '22 Oct, 2024',
      horaInicio: '08:00',
      horaFin: '18:00',
      ubicacion: 'Campus Central',
      estado: 'Publicado',
      participantes: 245,
      negocios: [
        {
          id: 1,
          nombre: 'Cafetería Central',
          descripcion: 'Venta de café y snacks',
          responsable: 'María González',
          ventasTotales: 'Q 1,250.00',
          usuarios: [
            { id: 1, nombre: 'María González', email: 'maria.g@ufm.edu', rol: 'Gerente' },
            { id: 2, nombre: 'Carlos López', email: 'carlos.l@ufm.edu', rol: 'Cajero' },
          ]
        },
        {
          id: 2,
          nombre: 'Stand de Merchandising',
          descripcion: 'Venta de productos oficiales UFM',
          responsable: 'Juan Pérez',
          ventasTotales: 'Q 850.00',
          usuarios: [
            { id: 3, nombre: 'Juan Pérez', email: 'juan.p@ufm.edu', rol: 'Gerente' },
          ]
        }
      ]
    },
    { 
      id: 2, 
      nombre: 'Foro Económico Anual', 
      fecha: '15 Nov, 2024',
      horaInicio: '09:00',
      horaFin: '17:00',
      ubicacion: 'Auditorio Principal',
      estado: 'Borrador',
      participantes: 0,
      negocios: []
    },
    { 
      id: 3, 
      nombre: 'Hackathon Emprendimiento', 
      fecha: '05 Dic, 2024',
      horaInicio: '10:00',
      horaFin: '20:00',
      ubicacion: 'Laboratorio Innovación',
      estado: 'Publicado',
      participantes: 89,
      negocios: []
    },
  ]);

  const availableUsers: AvailableUser[] = [
    { id: 4, nombre: 'Ana Martínez', email: 'ana.m@ufm.edu' },
    { id: 5, nombre: 'Luis García', email: 'luis.g@ufm.edu' },
    { id: 6, nombre: 'Patricia Ruiz', email: 'patricia.r@ufm.edu' },
  ];

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

  const handleViewBusinesses = (event: Event) => {
    setSelectedEvent(event);
    setViewMode('businesses');
  };

  const handleBackToEvents = () => {
    setViewMode('events');
    setSelectedEvent(null);
  };

  const handleAssignUsers = (business: Business) => {
    setSelectedBusiness(business);
    setShowAssignUsersModal(true);
  };

  return (
    <div className="space-y-6">
        {viewMode === 'events' ? (
          <>
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
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Negocios:</span>
                      <span className="text-white font-medium">{event.negocios?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-dark-border">
                    <button
                      onClick={() => handleViewBusinesses(event)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-white bg-primary-red hover:bg-primary-red/90 rounded-lg transition-all"
                    >
                      <HiShoppingBag className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver Negocios</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all">
                      <HiPencil className="w-4 h-4" />
                      <span className="text-sm font-medium">Editar</span>
                    </button>
                    <button className="px-3 py-2 text-gray-400 hover:text-negative hover:bg-negative/10 rounded-lg transition-all">
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Businesses View */}
            <div className="mb-8">
              <button
                onClick={handleBackToEvents}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
              >
                <HiArrowLeft className="w-5 h-5" />
                <span>Volver a eventos</span>
              </button>
              <h1 className="text-3xl font-bold text-white mb-2">
                Negocios - {selectedEvent?.nombre}
              </h1>
              <p className="text-gray-400">Gestiona los negocios y vendedores de este evento</p>
            </div>

            {/* Create Business Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateBusinessModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all"
              >
                <HiPlus className="w-5 h-5" />
                Crear Negocio
              </button>
            </div>

            {/* Businesses Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedEvent?.negocios?.map((business) => (
                <div
                  key={business.id}
                  className="bg-dark-card rounded-xl border border-dark-border p-6 hover:border-primary-red/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{business.nombre}</h3>
                      <p className="text-sm text-gray-400 mb-3">{business.descripcion}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Responsable:</span>
                        <span className="text-sm text-white font-medium">{business.responsable}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 block mb-1">Ventas Totales</span>
                      <span className="text-lg font-bold text-positive">{business.ventasTotales}</span>
                    </div>
                  </div>

                  {/* Usuarios asignados */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-400">Usuarios Asignados ({business.usuarios.length})</span>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {business.usuarios.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 bg-dark-bg rounded-lg"
                        >
                          <div>
                            <p className="text-sm text-white font-medium">{user.nombre}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-accent-blue/10 text-accent-blue border border-accent-blue/20 rounded">
                            {user.rol}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-dark-border">
                    <button
                      onClick={() => handleAssignUsers(business)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-white bg-accent-blue hover:bg-accent-blue/90 rounded-lg transition-all"
                    >
                      <HiUserAdd className="w-4 h-4" />
                      <span className="text-sm font-medium">Asignar Usuarios</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-primary-red hover:bg-primary-red/10 rounded-lg transition-all">
                      <HiPencil className="w-4 h-4" />
                      <span className="text-sm font-medium">Editar</span>
                    </button>
                    <button className="px-3 py-2 text-gray-400 hover:text-negative hover:bg-negative/10 rounded-lg transition-all">
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {(!selectedEvent?.negocios || selectedEvent.negocios.length === 0) && (
                <div className="col-span-full text-center py-12 bg-dark-card rounded-xl border border-dark-border">
                  <HiShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay negocios creados</h3>
                  <p className="text-gray-500 mb-6">Crea el primer negocio para este evento</p>
                  <button
                    onClick={() => setShowCreateBusinessModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all"
                  >
                    <HiPlus className="w-5 h-5" />
                    Crear Negocio
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-2xl border border-dark-border w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-border sticky top-0 bg-dark-card z-10">
              <h2 className="text-xl font-bold text-white">Crear Nuevo Evento</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

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

      {/* Create Business Modal */}
      {showCreateBusinessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-2xl border border-dark-border w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h2 className="text-xl font-bold text-white">Crear Nuevo Negocio</h2>
              <button
                onClick={() => setShowCreateBusinessModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del Negocio *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cafetería Central"
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe el negocio..."
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Carnet del Responsable Principal *
                </label>
                <input
                  type="text"
                  placeholder="Ej: 20210619"
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Ingresa el carnet universitario del usuario que será responsable de este negocio
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-dark-border">
              <button
                onClick={() => setShowCreateBusinessModal(false)}
                className="px-6 py-2.5 bg-dark-bg hover:bg-dark-border text-gray-300 hover:text-white font-medium rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowCreateBusinessModal(false)}
                className="px-6 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all"
              >
                Crear Negocio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Users Modal */}
      {showAssignUsersModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-2xl border border-dark-border w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-border sticky top-0 bg-dark-card z-10">
              <div>
                <h2 className="text-xl font-bold text-white">Asignar Usuarios</h2>
                <p className="text-sm text-gray-400 mt-1">{selectedBusiness.nombre}</p>
              </div>
              <button
                onClick={() => setShowAssignUsersModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Current Users */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Usuarios Actuales ({selectedBusiness.usuarios.length})</h3>
                <div className="space-y-2">
                  {selectedBusiness.usuarios.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-dark-bg rounded-lg border border-dark-border"
                    >
                      <div>
                        <p className="text-sm text-white font-medium">{user.nombre}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue={user.rol}
                          className="px-3 py-1.5 text-xs bg-dark-card border border-dark-border rounded text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                        >
                          <option value="Cajero">Cajero</option>
                          <option value="Vendedor">Vendedor</option>
                          <option value="Gerente">Gerente</option>
                        </select>
                        <button className="p-2 text-gray-400 hover:text-negative hover:bg-negative/10 rounded-lg transition-all">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Users */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Agregar Nuevo Usuario</h3>
                <div className="space-y-3">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-dark-bg rounded-lg border border-dark-border hover:border-primary-red/30 transition-all"
                    >
                      <div>
                        <p className="text-sm text-white font-medium">{user.nombre}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="px-3 py-1.5 text-xs bg-dark-card border border-dark-border rounded text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                        >
                          <option value="Cajero">Cajero</option>
                          <option value="Vendedor">Vendedor</option>
                          <option value="Gerente">Gerente</option>
                        </select>
                        <button className="p-2 text-positive hover:text-white hover:bg-positive/20 rounded-lg transition-all">
                          <HiPlus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-dark-border">
              <button
                onClick={() => setShowAssignUsersModal(false)}
                className="px-6 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
