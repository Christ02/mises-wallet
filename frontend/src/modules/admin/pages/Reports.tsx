import { useMemo, useState } from 'react';
import {
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
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-red to-primary-red/70 border border-primary-red/40 text-white flex items-center justify-center shadow-lg">
            <HiTemplate className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Generador de reportes</h1>
            <p className="text-sm text-gray-400">
              Selecciona la información que necesitas y crea reportes en formato CSV.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <aside className="lg:col-span-2 space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Tipo de reporte</h2>
            <div className="space-y-3">
              {ENTITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedEntity(option);
                    setSelectedColumns(getColumnsForEntity(option.value).slice(0, 3).map((c) => c.value));
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    selectedEntity.value === option.value
                      ? 'border-primary-red text-white bg-primary-red/10'
                      : 'border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg'
                  }`}
                >
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Historial reciente</h2>
              <button
                onClick={() => {
                  setRecentReports([]);
                }}
                className="text-xs text-gray-500 hover:text-white transition"
              >
                Limpiar
              </button>
            </div>
            {recentReports.length === 0 ? (
              <p className="text-xs text-gray-500">
                Aún no has generado reportes. Selecciona la información y usa el botón “Generar CSV”.
              </p>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report.id} className="bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-gray-400 space-y-2">
                    <div className="flex items-center justify-between text-sm text-white">
                      <span className="font-semibold">{report.name}</span>
                      <span>{new Date(report.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p>Entidad: <span className="text-gray-300">{report.entity}</span></p>
                    <p>
                      Columnas:{' '}
                      <span className="text-gray-300">
                        {report.columns.length > 0 ? report.columns.join(', ') : '—'}
                      </span>
                    </p>
                    <p>
                      Filtros:{' '}
                      <span className="text-gray-300">
                        {report.filters.length > 0 ? report.filters.join(', ') : 'Ninguno'}
                      </span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-red/10 text-primary-red border border-primary-red/20 rounded-lg hover:bg-primary-red/20 transition text-xs">
                        <HiDownload className="w-4 h-4" />
                        CSV
                      </button>
                      <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-dark-bg border border-dark-border rounded-lg hover:bg-dark-bg/80 transition text-xs text-gray-300">
                        <HiMail className="w-4 h-4" />
                        Enviar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Selecciona columnas</h2>
              <p className="text-xs text-gray-500">
                Elige qué campos quieres incluir en el archivo CSV.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableColumns.map((column) => {
                const selected = selectedColumns.includes(column.value);
                return (
                  <button
                    key={column.value}
                    onClick={() => handleToggleColumn(column.value)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      selected
                        ? 'border-primary-red bg-primary-red/10 text-white'
                        : 'border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg'
                    }`}
                  >
                    <span className="text-sm font-medium">{column.label}</span>
                    {selected && <HiClipboardCheck className="w-5 h-5 text-primary-red" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Filtros opcionales</h2>
              <p className="text-xs text-gray-500">
                Activa los filtros que quieras aplicar antes de generar el reporte.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleToggleFilter('dateRange')}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  includeFilters.dateRange
                    ? 'border-primary-red bg-primary-red/10 text-white'
                    : 'border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg'
                }`}
              >
                Rango de fechas
              </button>
              <button
                onClick={() => handleToggleFilter('status')}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  includeFilters.status
                    ? 'border-primary-red bg-primary-red/10 text-white'
                    : 'border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg'
                }`}
              >
                Estado
              </button>
              <button
                onClick={() => handleToggleFilter('role')}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  includeFilters.role
                    ? 'border-primary-red bg-primary-red/10 text-white'
                    : 'border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg'
                }`}
              >
                Rol / Perfil
              </button>
              <button
                onClick={() => handleToggleFilter('direction')}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  includeFilters.direction
                    ? 'border-primary-red bg-primary-red/10 text-white'
                    : 'border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg'
                }`}
              >
                Dirección (Entrante/Saliente)
              </button>
            </div>

            <div className="rounded-xl border border-dashed border-dark-border bg-dark-bg/60 p-4 text-xs text-gray-500">
              <p className="text-gray-400 font-semibold mb-2">Nota:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Todos los reportes se generan en formato CSV codificado en UTF-8.</li>
                <li>Los filtros aplicados dependen del tipo de entidad seleccionada.</li>
                <li>Puedes reenviar un reporte previamente generado desde el historial usando el botón “Enviar”.</li>
              </ul>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">Reportes generados se guardan durante 7 días para descarga directa.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark-bg border border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg/80 rounded-lg transition-all text-sm"
              >
                <HiRefresh className="w-5 h-5" />
                <span>Restablecer</span>
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={generateLoading || selectedColumns.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg font-semibold transition-all disabled:opacity-60"
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
        </main>
      </div>
    </div>
  );
}

