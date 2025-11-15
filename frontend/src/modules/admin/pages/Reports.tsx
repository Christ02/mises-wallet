import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HiChevronDown,
  HiClipboardCheck,
  HiClipboardList,
  HiDownload,
  HiMail,
  HiOutlineDocumentText,
  HiRefresh,
  HiTemplate
} from 'react-icons/hi';

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
    }[]
  >([]);

  const availableColumns = useMemo(() => getColumnsForEntity(selectedEntity.value), [selectedEntity]);

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

  const handleGenerateReport = () => {
    setGenerateLoading(true);
    setTimeout(() => {
      const newReport = {
        id: Date.now(),
        name: `Reporte ${selectedEntity.label} - ${new Date().toLocaleDateString()}`,
        entity: selectedEntity.label,
        created_at: new Date().toISOString(),
        columns: selectedColumns,
        filters: Object.entries(includeFilters)
          .filter(([, enabled]) => enabled)
          .map(([key]) => key)
      };
      setRecentReports((prev) => [newReport, ...prev].slice(0, 6));
      setGenerateLoading(false);
    }, 1200);
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentReports.map((report) => (
              <div key={report.id} className="bg-dark-bg border border-dark-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{report.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(report.created_at).toLocaleDateString('es-GT', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>Entidad:</span>
                    <span className="text-gray-300 font-medium">{report.entity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Columnas:</span>
                    <span className="text-gray-300 font-medium">{report.columns.length}</span>
                  </div>
                  {report.filters.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span>Filtros:</span>
                      <span className="text-gray-300 font-medium">{report.filters.length}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-dark-border">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-red/10 text-primary-red border border-primary-red/20 rounded-lg hover:bg-primary-red/20 transition text-xs flex-1">
                    <HiDownload className="w-3.5 h-3.5" />
                    Descargar
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-bg border border-dark-border rounded-lg hover:bg-dark-bg/80 transition text-xs text-gray-300 flex-1">
                    <HiMail className="w-3.5 h-3.5" />
                    Enviar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

