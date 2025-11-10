import { useEffect, useMemo, useState } from 'react';
import {
  HiAnnotation,
  HiChevronDown,
  HiClipboardList,
  HiFilter,
  HiSearch
} from 'react-icons/hi';
import { fetchAuditLogs, AuditLog } from '../services/auditLogs';

const formatDateTime = (value: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export default function AuditLogs() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('Todos');
  const [entityFilter, setEntityFilter] = useState<string>('Todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [showFilters, setShowFilters] = useState(false);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchAuditLogs({
          search: debouncedSearch || undefined,
          action: actionFilter !== 'Todos' ? actionFilter : undefined,
          entity: entityFilter !== 'Todos' ? entityFilter : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          page,
          limit: pageSize,
          offset: (page - 1) * pageSize
        });
        setLogs(response.data);
        setTotal(response.total);
      } catch (err: any) {
        if (controller.signal.aborted) return;
        console.error('Error fetching audit logs', err);
        setError(err.response?.data?.error || 'No se pudieron cargar los logs de auditoría');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    loadLogs();
    return () => controller.abort();
  }, [debouncedSearch, actionFilter, entityFilter, dateFrom, dateTo, page, pageSize]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const uniqueActions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.action) set.add(log.action);
    });
    return Array.from(set);
  }, [logs]);

  const uniqueEntities = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.entity) set.add(log.entity);
    });
    return Array.from(set);
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-red to-primary-red/70 border border-primary-red/40 text-white flex items-center justify-center shadow-lg">
            <HiClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Logs de auditoría</h1>
            <p className="text-sm text-gray-400">
              Revisa las acciones administradas realizadas dentro del sistema.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por descripción, acción o entidad..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-bg/80 transition-all self-start md:self-auto"
          >
            <HiFilter className="w-5 h-5" />
            <span>Filtrar</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 border-t border-dark-border pt-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-gray-500">Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all appearance-none [color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-gray-500">Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all appearance-none [color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-gray-500">Acción</label>
              <div className="relative">
                <select
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full appearance-none px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all cursor-pointer"
                >
                  <option value="Todos">Todas</option>
                  {uniqueActions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
                <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-gray-500">Entidad</label>
              <div className="relative">
                <select
                  value={entityFilter}
                  onChange={(e) => {
                    setEntityFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full appearance-none px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all cursor-pointer"
                >
                  <option value="Todos">Todas</option>
                  {uniqueEntities.map((entity) => (
                    <option key={entity} value={entity}>
                      {entity}
                    </option>
                  ))}
                </select>
                <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex flex-col items-center gap-3 text-gray-400">
            <span className="h-8 w-8 border-2 border-primary-red border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Cargando logs...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-negative text-sm">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center space-y-3 text-gray-400">
            <p className="text-lg font-semibold text-white">Sin registros</p>
            <p className="text-sm">Todavía no hay operaciones registradas en la auditoría.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-bg/60">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Entidad
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Descripción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-dark-bg/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 text-sm text-white font-semibold">
                          <HiAnnotation className="w-4 h-4 text-primary-red" />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {log.user ? (
                          <div className="space-y-1">
                            <p className="text-sm text-white font-semibold">
                              {log.user.nombres} {log.user.apellidos}
                            </p>
                            <p className="text-xs text-gray-400">{log.user.carnet}</p>
                            <p className="text-xs text-gray-500">{log.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-300">Sistema</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{log.entity ?? '—'}</div>
                        {log.entity_id && (
                          <div className="text-xs text-gray-500 font-mono">{log.entity_id}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{log.description ?? '—'}</p>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="mt-2 bg-dark-bg/70 border border-dark-border rounded-lg px-3 py-2 text-xs text-gray-400">
                            {Object.entries(log.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between gap-4">
                                <span className="text-gray-500">{key}</span>
                                <span className="font-mono text-gray-300 truncate max-w-[220px]" title={String(value)}>
                                  {String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {(log.ip_address || log.user_agent) && (
                          <div className="mt-2 text-xs text-gray-500 space-y-1">
                            {log.ip_address && <div>IP: {log.ip_address}</div>}
                            {log.user_agent && <div className="line-clamp-2">UA: {log.user_agent}</div>}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-dark-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-sm text-gray-400">
                Mostrando {logs.length} de {total} registros
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm bg-dark-bg border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-bg/80 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-400">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm bg-dark-bg border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-bg/80 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

