import { useEffect, useMemo, useState } from 'react';
import {
  HiChevronDown,
  HiClipboardCheck,
  HiDownload,
  HiOutlineDocumentText,
  HiRefresh,
  HiTemplate,
  HiTrash
} from 'react-icons/hi';
import api from '../../../services/api';
import { fetchTransactions } from '../services/transactions';
import { fetchEvents, fetchBusinesses } from '../services/events';
import ConfirmModal from '../components/ui/ConfirmModal';

type EntityOption = {
  value: string;
  label: string;
  description: string;
};

const ENTITY_OPTIONS: EntityOption[] = [
  { value: 'users', label: 'Usuarios', description: 'Información de usuarios registrados y sus roles.' },
  { value: 'transactions', label: 'Transacciones', description: 'Movimientos globales en blockchain.' },
  { value: 'events', label: 'Eventos', description: 'Eventos organizados y métricas de asistencia.' },
  { value: 'businesses', label: 'Negocios de eventos', description: 'Cuentas y miembros de comercios en eventos.' }
];

const USER_COLUMNS = [
  { value: 'nombres', label: 'Nombres' },
  { value: 'apellidos', label: 'Apellidos' },
  { value: 'email', label: 'Correo' },
  { value: 'carnet', label: 'Carnet' },
  { value: 'role', label: 'Rol' },
  { value: 'status', label: 'Estado' },
  { value: 'created_at', label: 'Fecha de registro' }
];

const TRANSACTION_COLUMNS = [
  { value: 'id', label: 'ID' },
  { value: 'hash', label: 'Hash' },
  { value: 'user', label: 'Usuario' },
  { value: 'amount', label: 'Monto' },
  { value: 'currency', label: 'Moneda' },
  { value: 'status', label: 'Estado' },
  { value: 'direction', label: 'Dirección' },
  { value: 'created_at', label: 'Fecha' }
];

const EVENT_COLUMNS = [
  { value: 'id', label: 'ID' },
  { value: 'name', label: 'Nombre' },
  { value: 'date', label: 'Fecha' },
  { value: 'location', label: 'Ubicación' },
  { value: 'organizers', label: 'Organizadores' },
  { value: 'status', label: 'Estado' }
];

const BUSINESS_COLUMNS = [
  { value: 'id', label: 'ID' },
  { value: 'name', label: 'Nombre del negocio' },
  { value: 'event', label: 'Evento' },
  { value: 'lead', label: 'Responsable' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'members', label: 'Miembros' }
];

const getColumnsForEntity = (entity: string) => {
  switch (entity) {
    case 'users':
      return USER_COLUMNS;
    case 'transactions':
      return TRANSACTION_COLUMNS;
    case 'events':
      return EVENT_COLUMNS;
    case 'businesses':
      return BUSINESS_COLUMNS;
    default:
      return [];
  }
};

export default function Reports() {
  const [selectedEntity, setSelectedEntity] = useState<EntityOption>(ENTITY_OPTIONS[0]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['nombres', 'apellidos', 'email']);
  const [includeFilters, setIncludeFilters] = useState({
    dateRange: false,
    status: false,
    role: false,
    direction: false
  });
  const [filterValues, setFilterValues] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    role: '',
    direction: ''
  });
  const [generateLoading, setGenerateLoading] = useState(false);
  const [recentReports, setRecentReports] = useState<
    {
      id: number;
      name: string;
      entity: string;
      created_at: string;
      columns: string[];
      filters: string[];
      csvContent?: string;
      filename?: string;
    }[]
  >([]);

  const availableColumns = useMemo(() => getColumnsForEntity(selectedEntity.value), [selectedEntity]);

  // Estado para modal de confirmación (eliminar reporte)
  const [reportToDelete, setReportToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDeleteReport = async () => {
    if (!reportToDelete) return;
    setDeleting(true);
    try {
      const updatedReports = recentReports.filter(r => r.id !== reportToDelete.id);
      setRecentReports(updatedReports);
      localStorage.setItem('recentReports', JSON.stringify(updatedReports));
      setReportToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleColumn = (value: string) => {
    setSelectedColumns((prev) =>
      prev.includes(value) ? prev.filter((col) => col !== value) : [...prev, value]
    );
  };

  const handleToggleFilter = (key: keyof typeof includeFilters) => {
    setIncludeFilters((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Función para escapar valores CSV
  const escapeCSVValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // Si contiene comas, comillas o saltos de línea, envolver en comillas y escapar comillas
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Función para generar CSV
  const generateCSV = (data: any[], columns: string[]): string => {
    if (!data || data.length === 0) {
      return '';
    }

    // Obtener los headers basados en las columnas seleccionadas
    const headers = columns.map(col => {
      const columnDef = availableColumns.find(c => c.value === col);
      return columnDef ? columnDef.label : col;
    });

    // Generar las filas
    const rows = data.map(row => {
      return columns.map(col => {
        let value = '';
        
        // Manejar diferentes estructuras de datos según la entidad
        if (selectedEntity.value === 'users') {
          switch (col) {
            case 'nombres':
              value = row.nombres || '';
              break;
            case 'apellidos':
              value = row.apellidos || '';
              break;
            case 'email':
              value = row.email || '';
              break;
            case 'carnet':
              value = row.carnet_universitario || '';
              break;
            case 'role':
              value = row.role || '';
              break;
            case 'status':
              value = row.status || 'activo';
              break;
            case 'created_at':
              value = row.created_at ? new Date(row.created_at).toLocaleDateString('es-GT') : '';
              break;
            default:
              value = row[col] || '';
          }
        } else if (selectedEntity.value === 'transactions') {
          switch (col) {
            case 'id':
              value = row.id || '';
              break;
            case 'hash':
              value = row.reference || '';
              break;
            case 'user':
              value = row.user ? `${row.user.nombres} ${row.user.apellidos} (${row.user.email})` : '';
              break;
            case 'amount':
              value = row.amount || '';
              break;
            case 'currency':
              value = row.currency || '';
              break;
            case 'status':
              value = row.status || '';
              break;
            case 'direction':
              value = row.direction || '';
              break;
            case 'created_at':
              value = row.created_at ? new Date(row.created_at).toLocaleDateString('es-GT') : '';
              break;
            default:
              value = row[col] || '';
          }
        } else if (selectedEntity.value === 'events') {
          switch (col) {
            case 'id':
              value = row.id || '';
              break;
            case 'name':
              value = row.name || '';
              break;
            case 'date':
              value = row.event_date ? new Date(row.event_date).toLocaleDateString('es-GT') : '';
              break;
            case 'location':
              value = row.location || '';
              break;
            case 'organizers':
              value = row.business_count ? `${row.business_count} negocios` : '0 negocios';
              break;
            case 'status':
              value = row.status || '';
              break;
            default:
              value = row[col] || '';
          }
        } else if (selectedEntity.value === 'businesses') {
          switch (col) {
            case 'id':
              value = row.id || '';
              break;
            case 'name':
              value = row.name || '';
              break;
            case 'event':
              value = row.event_name || '';
              break;
            case 'lead':
              value = row.lead_user ? `${row.lead_user.nombres} ${row.lead_user.apellidos} (${row.lead_carnet})` : row.lead_carnet || '';
              break;
            case 'wallet':
              value = row.wallet_address || '';
              break;
            case 'members':
              value = row.members ? row.members.length.toString() : '0';
              break;
            default:
              value = row[col] || '';
          }
        } else {
          value = row[col] || '';
        }
        
        return escapeCSVValue(value);
      });
    });

    // Combinar headers y filas
    const csvContent = [
      headers.map(escapeCSVValue).join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Agregar BOM para UTF-8 (ayuda con Excel)
    return '\uFEFF' + csvContent;
  };

  // Función para descargar CSV
  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Función para obtener datos según la entidad
  const fetchDataForEntity = async () => {
    const filters: any = {};

    // Aplicar filtros según los que estén activos
    if (includeFilters.dateRange && filterValues.dateFrom) {
      filters.dateFrom = filterValues.dateFrom;
    }
    if (includeFilters.dateRange && filterValues.dateTo) {
      filters.dateTo = filterValues.dateTo;
    }
    if (includeFilters.status && filterValues.status) {
      filters.status = filterValues.status;
    }
    if (includeFilters.role && filterValues.role) {
      filters.role = filterValues.role;
    }
    if (includeFilters.direction && filterValues.direction) {
      filters.direction = filterValues.direction;
    }

    try {
      switch (selectedEntity.value) {
        case 'users':
          const usersResponse = await api.get('/api/admin/users', { params: filters });
          return usersResponse.data.data || [];
        
        case 'transactions':
          filters.limit = 10000; // Obtener todas las transacciones
          const transactionsResponse = await fetchTransactions(filters);
          return transactionsResponse.data || [];
        
        case 'events':
          const eventsResponse = await fetchEvents();
          // Aplicar filtros manualmente para eventos
          let filteredEvents = eventsResponse;
          if (includeFilters.status && filterValues.status) {
            filteredEvents = filteredEvents.filter((e: any) => e.status === filterValues.status);
          }
          if (includeFilters.dateRange && filterValues.dateFrom) {
            filteredEvents = filteredEvents.filter((e: any) => 
              new Date(e.event_date) >= new Date(filterValues.dateFrom)
            );
          }
          if (includeFilters.dateRange && filterValues.dateTo) {
            filteredEvents = filteredEvents.filter((e: any) => 
              new Date(e.event_date) <= new Date(filterValues.dateTo)
            );
          }
          return filteredEvents;
        
        case 'businesses':
          // Para negocios, necesitamos obtener todos los eventos primero
          const allEvents = await fetchEvents();
          const allBusinesses: any[] = [];
          
          for (const event of allEvents) {
            try {
              const businesses = await fetchBusinesses(event.id);
              const businessesWithEvent = businesses.map((b: any) => ({
                ...b,
                event_name: event.name,
                event_id: event.id
              }));
              allBusinesses.push(...businessesWithEvent);
            } catch (err) {
              console.error(`Error fetching businesses for event ${event.id}:`, err);
            }
          }
          
          // Aplicar filtros manualmente
          let filteredBusinesses = allBusinesses;
          if (includeFilters.dateRange && filterValues.dateFrom) {
            filteredBusinesses = filteredBusinesses.filter((b: any) => 
              new Date(b.created_at) >= new Date(filterValues.dateFrom)
            );
          }
          if (includeFilters.dateRange && filterValues.dateTo) {
            filteredBusinesses = filteredBusinesses.filter((b: any) => 
              new Date(b.created_at) <= new Date(filterValues.dateTo)
            );
          }
          
          return filteredBusinesses;
        
        default:
          return [];
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener los datos');
    }
  };

  const handleGenerateReport = async () => {
    if (selectedColumns.length === 0) {
      alert('Por favor selecciona al menos una columna para generar el reporte.');
      return;
    }

    setGenerateLoading(true);
    try {
      // Obtener los datos
      const data = await fetchDataForEntity();
      
      if (data.length === 0) {
        alert('No se encontraron datos con los filtros seleccionados.');
        setGenerateLoading(false);
        return;
      }

      // Generar CSV
      const csvContent = generateCSV(data, selectedColumns);
      
      // Crear nombre de archivo
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `reporte_${selectedEntity.value}_${timestamp}.csv`;
      
      // Descargar CSV
      downloadCSV(csvContent, filename);
      
      // Guardar en historial
      const newReport = {
        id: Date.now(),
        name: `Reporte ${selectedEntity.label} - ${new Date().toLocaleDateString()}`,
        entity: selectedEntity.label,
        created_at: new Date().toISOString(),
        columns: selectedColumns,
        filters: Object.entries(includeFilters)
          .filter(([, enabled]) => enabled)
          .map(([key]) => key),
        csvContent, // Guardar el contenido para re-descargar
        filename
      };
      setRecentReports((prev) => [newReport, ...prev].slice(0, 6));
      
      // Guardar en localStorage para persistencia
      const savedReports = JSON.parse(localStorage.getItem('recentReports') || '[]');
      savedReports.unshift(newReport);
      localStorage.setItem('recentReports', JSON.stringify(savedReports.slice(0, 6)));
      
    } catch (error: any) {
      console.error('Error generating report:', error);
      alert(error.message || 'Error al generar el reporte. Por favor intenta de nuevo.');
    } finally {
      setGenerateLoading(false);
    }
  };

  // Cargar historial desde localStorage al montar
  useEffect(() => {
    const savedReports = localStorage.getItem('recentReports');
    if (savedReports) {
      try {
        const parsed = JSON.parse(savedReports);
        setRecentReports(parsed);
      } catch (err) {
        console.error('Error loading saved reports:', err);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-red to-primary-red/80 border border-primary-red/40 text-white flex items-center justify-center shadow-lg flex-shrink-0">
            <HiTemplate className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Generador de reportes</h1>
            <p className="text-sm text-gray-400">
              Selecciona la información que necesitas y crea reportes en formato CSV.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        {/* Sidebar izquierdo - Tipo de reporte */}
        <aside className="xl:col-span-1 flex">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full flex flex-col">
            <div className="mb-6 flex-shrink-0">
              <h2 className="text-lg font-semibold text-white mb-1">Tipo de reporte</h2>
              <p className="text-xs text-gray-500">Selecciona el tipo de datos a exportar</p>
            </div>
            <div className="space-y-2.5 flex-1">
              {ENTITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedEntity(option);
                    setSelectedColumns(getColumnsForEntity(option.value).slice(0, 3).map((c) => c.value));
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedEntity.value === option.value
                      ? 'border-primary-red text-white bg-primary-red/10 shadow-lg shadow-primary-red/10'
                      : 'border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg hover:border-primary-red/30'
                  }`}
                >
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="xl:col-span-2 space-y-6">
          {/* Selección de columnas */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-1">Selecciona columnas</h2>
              <p className="text-xs text-gray-500">
                Elige qué campos quieres incluir en el archivo CSV.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableColumns.map((column) => {
                const selected = selectedColumns.includes(column.value);
                return (
                  <button
                    key={column.value}
                    onClick={() => handleToggleColumn(column.value)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-sm ${
                      selected
                        ? 'border-primary-red bg-primary-red/10 text-white'
                        : 'border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg'
                    }`}
                  >
                    <span className="font-medium text-xs sm:text-sm">{column.label}</span>
                    {selected && <HiClipboardCheck className="w-4 h-4 text-primary-red flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtros opcionales */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-1">Filtros opcionales</h2>
              <p className="text-xs text-gray-500">
                Activa los filtros que quieras aplicar antes de generar el reporte.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <button
                onClick={() => handleToggleFilter('dateRange')}
                className={`px-3 py-2.5 rounded-lg border transition-all text-sm ${
                  includeFilters.dateRange
                    ? 'border-primary-red bg-primary-red/10 text-white'
                    : 'border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg'
                }`}
              >
                Rango de fechas
              </button>
              <button
                onClick={() => handleToggleFilter('status')}
                className={`px-3 py-2.5 rounded-lg border transition-all text-sm ${
                  includeFilters.status
                    ? 'border-primary-red bg-primary-red/10 text-white'
                    : 'border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg'
                }`}
              >
                Estado
              </button>
              <button
                onClick={() => handleToggleFilter('role')}
                className={`px-3 py-2.5 rounded-lg border transition-all text-sm ${
                  includeFilters.role
                    ? 'border-primary-red bg-primary-red/10 text-white'
                    : 'border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg'
                }`}
              >
                Rol / Perfil
              </button>
              <button
                onClick={() => handleToggleFilter('direction')}
                className={`px-3 py-2.5 rounded-lg border transition-all text-sm ${
                  includeFilters.direction
                    ? 'border-primary-red bg-primary-red/10 text-white'
                    : 'border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg'
                }`}
              >
                Dirección
              </button>
            </div>

            {/* Inputs condicionales para filtros */}
            {(includeFilters.dateRange || includeFilters.status || includeFilters.role || includeFilters.direction) && (
              <div className="bg-dark-bg/50 border border-dark-border rounded-lg p-4 space-y-4 mb-6">
                {includeFilters.dateRange && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Desde</label>
                      <input
                        type="date"
                        value={filterValues.dateFrom}
                        onChange={(e) => setFilterValues(prev => ({ ...prev, dateFrom: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all appearance-none [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Hasta</label>
                      <input
                        type="date"
                        value={filterValues.dateTo}
                        onChange={(e) => setFilterValues(prev => ({ ...prev, dateTo: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all appearance-none [color-scheme:dark]"
                      />
                    </div>
                  </div>
                )}

                {includeFilters.status && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Estado</label>
                    <div className="relative">
                      <select
                        value={filterValues.status}
                        onChange={(e) => setFilterValues(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all appearance-none cursor-pointer pr-10"
                      >
                        <option value="">Todos los estados</option>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="completada">Completada</option>
                        <option value="fallida">Fallida</option>
                        <option value="en_proceso">En proceso</option>
                      </select>
                      <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                )}

                {includeFilters.role && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Rol / Perfil</label>
                    <div className="relative">
                      <select
                        value={filterValues.role}
                        onChange={(e) => setFilterValues(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all appearance-none cursor-pointer pr-10"
                      >
                        <option value="">Todos los roles</option>
                        <option value="usuario">Usuario</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                      <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                )}

                {includeFilters.direction && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Dirección</label>
                    <div className="relative">
                      <select
                        value={filterValues.direction}
                        onChange={(e) => setFilterValues(prev => ({ ...prev, direction: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all appearance-none cursor-pointer pr-10"
                      >
                        <option value="">Todas las direcciones</option>
                        <option value="entrante">Entrante</option>
                        <option value="saliente">Saliente</option>
                      </select>
                      <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg border border-dashed border-dark-border bg-dark-bg/50 p-4 text-xs text-gray-500">
              <p className="text-gray-400 font-semibold mb-2">Nota:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Todos los reportes se generan en formato CSV codificado en UTF-8.</li>
                <li>Los filtros aplicados dependen del tipo de entidad seleccionada.</li>
                <li>Puedes reenviar un reporte previamente generado desde el historial usando el botón "Enviar".</li>
              </ul>
            </div>
          </div>

          {/* Botón de generar */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">
                  {selectedColumns.length > 0 
                    ? `${selectedColumns.length} columna${selectedColumns.length > 1 ? 's' : ''} seleccionada${selectedColumns.length > 1 ? 's' : ''}`
                    : 'Selecciona al menos una columna para generar el reporte'}
                </p>
                <p className="text-xs text-gray-500">
                  Reportes generados se guardan durante 7 días para descarga directa.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSelectedColumns([]);
                    setIncludeFilters({
                      dateRange: false,
                      status: false,
                      role: false,
                      direction: false
                    });
                    setFilterValues({
                      dateFrom: '',
                      dateTo: '',
                      status: '',
                      role: '',
                      direction: ''
                    });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-dark-bg border border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg/80 rounded-lg transition-all text-sm flex-1 sm:flex-initial"
                >
                  <HiRefresh className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={generateLoading || selectedColumns.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex-1 sm:flex-initial"
                >
                  {generateLoading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <HiDownload className="w-5 h-5" />
                      Generar CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Historial reciente - Completamente abajo */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Historial reciente</h2>
            <p className="text-xs text-gray-500">
              Reportes generados anteriormente. Puedes descargarlos o reenviarlos.
            </p>
          </div>
          {recentReports.length > 0 && (
            <button
              onClick={() => {
                setRecentReports([]);
                localStorage.removeItem('recentReports');
              }}
              className="text-xs text-gray-500 hover:text-white transition px-3 py-1.5 bg-dark-bg border border-dark-border rounded-lg hover:bg-dark-bg/80"
            >
              Limpiar historial
            </button>
          )}
        </div>
        {recentReports.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center">
              <HiOutlineDocumentText className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-sm font-semibold text-gray-300 mb-1">Aún no has generado reportes</p>
            <p className="text-xs text-gray-500">
              Selecciona la información y usa el botón "Generar CSV" para crear tu primer reporte.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Nombre del reporte
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Entidad
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Columnas
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Filtros
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Fecha de creación
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {recentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-dark-bg/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{report.name}</span>
                        {report.filename && (
                          <span className="text-xs text-gray-500 mt-0.5">{report.filename}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">{report.entity}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">{report.columns.length}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">
                        {report.filters.length > 0 ? report.filters.length : 'Ninguno'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">
                        {new Date(report.created_at).toLocaleDateString('es-GT', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            if (report.csvContent && report.filename) {
                              downloadCSV(report.csvContent, report.filename);
                            } else {
                              alert('No se puede descargar este reporte. Por favor genera uno nuevo.');
                            }
                          }}
                          className="p-2 text-primary-red hover:bg-primary-red/10 rounded-lg transition-colors"
                          title="Descargar reporte"
                        >
                          <HiDownload className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setReportToDelete({ id: report.id, name: report.name })}
                          className="p-2 text-negative hover:bg-negative/10 rounded-lg transition-colors"
                          title="Eliminar reporte"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar reporte */}
      <ConfirmModal
        open={!!reportToDelete}
        title="Eliminar reporte"
        description={
          reportToDelete
            ? `¿Seguro que deseas eliminar el reporte "${reportToDelete.name}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteReport}
        onClose={() => !deleting && setReportToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}

