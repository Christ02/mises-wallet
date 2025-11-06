import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { 
  HiUsers, 
  HiRefresh, 
  HiCalendar, 
  HiCurrencyDollar,
  HiSearch,
  HiPlus,
  HiPencil,
  HiTrash,
  HiEye,
  HiEyeOff
} from 'react-icons/hi';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface Event {
  id: number;
  name: string;
  date: string;
  status: 'Publicado' | 'Borrador' | 'Finalizado';
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<Event[]>([
    { id: 1, name: 'Semana de la Libertad', date: '22 Oct, 2024', status: 'Publicado' },
    { id: 2, name: 'Foro Económico Anual', date: '15 Nov, 2024', status: 'Borrador' },
    { id: 3, name: 'Hackathon Emprendimiento', date: '05 Dic, 2024', status: 'Publicado' },
  ]);

  const stats: StatCard[] = [
    {
      title: 'Usuarios Registrados',
      value: '1,234',
      icon: HiUsers,
      color: 'text-accent-blue'
    },
    {
      title: 'Total de Transacciones',
      value: '5,678',
      icon: HiRefresh,
      color: 'text-accent-yellow'
    },
    {
      title: 'Eventos Activos',
      value: '12',
      icon: HiCalendar,
      color: 'text-positive'
    },
    {
      title: 'Ingresos Generados',
      value: 'Q 15,420.00',
      icon: HiCurrencyDollar,
      color: 'text-primary-red'
    }
  ];

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
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
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Inicio</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-dark-card rounded-xl border border-dark-border p-6 hover:border-primary-red/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-2">{stat.title}</h3>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Events Management - Full Width */}
          <div>
            <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-dark-border">
                <h2 className="text-xl font-bold text-white mb-4">Gestión de Eventos</h2>
                
                {/* Search and Create */}
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
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all whitespace-nowrap">
                    <HiPlus className="w-5 h-5" />
                    Crear Evento
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-bg/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Nombre del Evento
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {filteredEvents.map((event) => (
                      <tr
                        key={event.id}
                        className="hover:bg-dark-bg/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-white font-medium">{event.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-400">{event.date}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-gray-400 hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all">
                              <HiPencil className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-negative hover:bg-negative/10 rounded-lg transition-all">
                              <HiTrash className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-positive hover:bg-positive/10 rounded-lg transition-all">
                              {event.status === 'Publicado' ? (
                                <HiEye className="w-5 h-5" />
                              ) : (
                                <HiEyeOff className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

