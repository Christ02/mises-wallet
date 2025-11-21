import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  HiCalendar,
  HiClock,
  HiLocationMarker,
  HiPlus,
  HiPencil,
  HiTrash,
  HiShoppingBag,
  HiX,
  HiPhotograph,
  HiSearch,
  HiFilter,
  HiChevronDown
} from 'react-icons/hi';
import {
  AdminEvent,
  CreateEventPayload,
  UpdateEventPayload,
  createEvent,
  deleteEvent,
  fetchEvents,
  updateEvent
} from '../services/events';
import { API_BASE_URL } from '../../../services/api';
import Pagination from '../components/Pagination';
import { useModal } from '../../../hooks/useModal';
import { usePermissions } from '../../../hooks/usePermissions';
import ConfirmModal from '../components/ui/ConfirmModal';

const STATUS_LABELS: Record<AdminEvent['status'], string> = {
  borrador: 'Borrador',
  publicado: 'Publicado',
  finalizado: 'Finalizado'
};

const STATUS_STYLES: Record<AdminEvent['status'], string> = {
  borrador: 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20',
  publicado: 'bg-positive/10 text-positive border border-positive/20',
  finalizado: 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
};

interface EventFormState {
  name: string;
  event_date: string;
  location: string;
  start_time: string;
  end_time: string;
  description: string;
  status: 'borrador' | 'publicado';
}

const initialForm: EventFormState = {
  name: '',
  event_date: '',
  location: '',
  start_time: '',
  end_time: '',
  description: '',
  status: 'borrador'
};

export default function EventManagement() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<EventFormState>(initialForm);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Array<{ url: string; isExisting: boolean; originalPath?: string }>>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [_existingImagePaths, setExistingImagePaths] = useState<string[]>([]); // setExistingImagePaths se usa en líneas 116, 162, 278
  const [removeExistingCover, setRemoveExistingCover] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [eventToDelete, setEventToDelete] = useState<AdminEvent | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Prevenir scroll del body cuando hay modales abiertos
  useModal(isCreateOpen || !!eventToDelete);

  // Permisos
  const { hasPermission } = usePermissions();
  const canDeleteEvent = hasPermission('events.delete');

  const buildCoverImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  const revokePreview = (url: string) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const resetImageState = () => {
    imagePreviews.forEach((preview) => {
      if (!preview.isExisting) {
        revokePreview(preview.url);
      }
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setExistingImagePaths([]);
    setRemoveExistingCover(false);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    const newFiles: File[] = [];
    const newPreviews: Array<{ url: string; isExisting: boolean }> = [];

    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`El archivo "${file.name}" no es una imagen válida.`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`La imagen "${file.name}" supera el tamaño máximo permitido de 5MB.`);
        return;
      }

      newFiles.push(file);
      newPreviews.push({ url: URL.createObjectURL(file), isExisting: false });
    });

    if (newFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...newFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      // Si se agregan nuevas imágenes, no eliminamos la existente (se reemplazará con la primera nueva)
      if (existingImages.length > 0) {
        setRemoveExistingCover(false);
      }
    }

    event.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const preview = imagePreviews[index];
    
    if (preview.isExisting) {
      // Es una imagen existente, removemos de todos los arrays usando originalPath
      if (preview.originalPath) {
        setExistingImagePaths((prev) => prev.filter((path) => path !== preview.originalPath));
      }
      // También remover de existingImages usando la URL
      setExistingImages((prev) => prev.filter((url) => url !== preview.url));
      
      // Si solo queda una imagen existente y se elimina, marcar para remover
      if (imagePreviews.filter(p => p.isExisting).length === 1) {
        setRemoveExistingCover(true);
      }
    } else {
      // Es una imagen nueva, revocamos el blob URL y la removemos de files
      revokePreview(preview.url);
      // Encontramos el índice en imageFiles contando solo las nuevas imágenes
      const newImageIndex = imagePreviews.slice(0, index).filter((p) => !p.isExisting).length;
      setImageFiles((prev) => prev.filter((_, i) => i !== newImageIndex));
    }

    // Removemos de previews
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Búsqueda por texto
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(search) ||
          event.location.toLowerCase().includes(search) ||
          (event.description && event.description.toLowerCase().includes(search))
      );
    }

    // Filtro por estado
    if (filterStatus) {
      filtered = filtered.filter((event) => event.status === filterStatus);
    }

    // Filtro por rango de fechas
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      filtered = filtered.filter((event) => new Date(event.event_date) >= fromDate);
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999); // Incluir todo el día
      filtered = filtered.filter((event) => new Date(event.event_date) <= toDate);
    }

    return filtered.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }, [events, searchTerm, filterStatus, filterDateFrom, filterDateTo]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterDateFrom, filterDateTo]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (err: any) {
        console.error('Error fetching events', err);
        setError(err.response?.data?.error || 'No se pudieron cargar los eventos');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const openCreateModal = () => {
    setFormState(initialForm);
    setEditingEvent(null);
    resetImageState();
    setIsCreateOpen(true);
  };

  const openEditModal = (event: AdminEvent) => {
    // Normalizar fecha al formato YYYY-MM-DD para que el input type="date" la muestre correctamente
    const isoDate = event.event_date ? new Date(event.event_date).toISOString().slice(0, 10) : '';

    setFormState({
      name: event.name,
      event_date: isoDate,
      location: event.location,
      start_time: event.start_time,
      end_time: event.end_time,
      description: event.description || '',
      status: event.status === 'publicado' ? 'publicado' : 'borrador'
    });
    setEditingEvent(event);
    resetImageState();
    setRemoveExistingCover(false);
    
    // Cargar imágenes existentes del evento
    // Primero intentar usar el campo images (array), si no existe usar cover_image_url
    const eventImages = (event as any).images || [];
    const existingImagesArray = Array.isArray(eventImages) && eventImages.length > 0
      ? eventImages
      : (event.cover_image_url ? [event.cover_image_url] : []);
    
    // Guardar las rutas relativas originales
    setExistingImagePaths(existingImagesArray);
    
    // Construir URLs completas para mostrar
    const existingImageUrls = existingImagesArray
      .map(img => buildCoverImageUrl(img))
      .filter((url): url is string => url !== null);
    
    if (existingImageUrls.length > 0) {
      setExistingImages(existingImageUrls);
      setImagePreviews(existingImagesArray.map((path, index) => ({ 
        url: existingImageUrls[index], 
        isExisting: true,
        originalPath: path
      })));
    }
    setIsCreateOpen(true);
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditingEvent(null);
    setFormState(initialForm);
    resetImageState();
  };

  const handleChange = (field: keyof EventFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.name || !formState.event_date || !formState.location || !formState.start_time || !formState.end_time) {
      alert('Completa todos los campos obligatorios.');
      return;
    }

    setSaving(true);
    try {
      if (editingEvent) {
        const updatePayload: UpdateEventPayload = {
          ...formState
        };

        // Obtener las rutas relativas de las imágenes existentes que se deben mantener
        // Usar originalPath si está disponible, sino extraer la ruta de la URL
        const existingImagesToKeep = imagePreviews
          .filter(preview => preview.isExisting)
          .map(preview => {
            if (preview.originalPath) {
              return preview.originalPath;
            }
            // Si no hay originalPath, extraer la ruta relativa de la URL completa
            if (preview.url.startsWith(API_BASE_URL)) {
              return preview.url.replace(API_BASE_URL, '');
            }
            return preview.url;
          });

        // Si se eliminaron todas las existentes y no hay nuevas, remover todas las imágenes
        if (removeExistingCover && imageFiles.length === 0) {
          updatePayload.remove_cover_image = 'true';
          const updated = await updateEvent(
            editingEvent.id,
            updatePayload,
            undefined,
            []
          );
          setEvents((prev) => prev.map((evt) => (evt.id === updated.id ? { ...evt, ...updated } : evt)));
        } else {
          // Enviar todas las imágenes: existentes que se mantienen + nuevas
          const updated = await updateEvent(
            editingEvent.id,
            updatePayload,
            imageFiles.length > 0 ? imageFiles : undefined,
            existingImagesToKeep.length > 0 ? existingImagesToKeep : undefined
          );
          setEvents((prev) => prev.map((evt) => (evt.id === updated.id ? { ...evt, ...updated } : evt)));
        }
      } else {
        // Crear nuevo evento
        const payload: CreateEventPayload = {
          name: formState.name,
          event_date: formState.event_date,
          location: formState.location,
          start_time: formState.start_time,
          end_time: formState.end_time,
          description: formState.description,
          status: formState.status
        };
        const created = await createEvent(payload, imageFiles.length > 0 ? imageFiles : undefined);
        setEvents((prev) => [{ ...created }, ...prev]);
      }
      closeModal();
    } catch (err: any) {
      console.error('Error guardando evento', err);
      alert(err.response?.data?.error || 'No se pudo guardar el evento');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (event: AdminEvent) => {
    if (!canDeleteEvent) return;
    setEventToDelete(event);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      setDeletingId(eventToDelete.id);
      await deleteEvent(eventToDelete.id);
      setEvents((prev) => prev.filter((evt) => evt.id !== eventToDelete.id));
      setEventToDelete(null);
    } catch (err: any) {
      console.error('Error eliminando evento', err);
      alert(err.response?.data?.error || 'No se pudo eliminar el evento');
    } finally {
      setDeletingId(null);
    }
  };

  const handleManageBusinesses = (event: AdminEvent) => {
    navigate(`/admin/events/${event.id}`);
  };

  const formatDate = (value: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // const formatDateTime = (value: string) => {
  //   if (!value) return '—'; // No usado actualmente
  //   const date = new Date(value);
  //   if (Number.isNaN(date.getTime())) return value;
  //   return date.toLocaleString('es-ES', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   });
  // };

  const analytics = useMemo(() => {
    const total = events.length;
    const published = events.filter((evt) => evt.status === 'publicado').length;
    const finished = events.filter((evt) => evt.status === 'finalizado').length;
    const draft = events.filter((evt) => evt.status === 'borrador').length;

    const now = new Date();
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const previousEvents = events.filter((event) => {
      const createdAt = new Date(event.created_at);
      return createdAt.getTime() <= endOfPreviousMonth.getTime();
    });

    const previousTotal = previousEvents.length;
    const previousPublished = previousEvents.filter((evt) => evt.status === 'publicado').length;
    const previousFinished = previousEvents.filter((evt) => evt.status === 'finalizado').length;
    const previousDraft = previousEvents.filter((evt) => evt.status === 'borrador').length;

    return {
      total,
      published,
      finished,
      draft,
      previous: {
        total: previousTotal,
        published: previousPublished,
        finished: previousFinished,
        draft: previousDraft
      }
    };
  }, [events]);

  const getTrendInfo = (current: number, previous: number) => {
    if (current === previous) {
      return { message: '→ Se mantiene vs mes anterior', tone: 'neutral' as const };
    }
    if (previous === 0) {
      if (current === 0) {
        return { message: '→ Se mantiene vs mes anterior', tone: 'neutral' as const };
      }
      return { message: `▲ +${current} vs mes anterior`, tone: 'up' as const };
    }
    const diff = current - previous;
    if (diff > 0) {
      return { message: `▲ +${diff} vs mes anterior`, tone: 'up' as const };
    }
    return { message: `▼ -${Math.abs(diff)} vs mes anterior`, tone: 'down' as const };
  };

  const trendColors: Record<'up' | 'down' | 'neutral', string> = {
    up: 'text-positive',
    down: 'text-negative',
    neutral: 'text-gray-500'
  };

  const totalTrend = useMemo(
    () => getTrendInfo(analytics.total, analytics.previous.total),
    [analytics]
  );
  const publishedTrend = useMemo(
    () => getTrendInfo(analytics.published, analytics.previous.published),
    [analytics]
  );
  const finishedTrend = useMemo(
    () => getTrendInfo(analytics.finished, analytics.previous.finished),
    [analytics]
  );
  const draftTrend = useMemo(
    () => getTrendInfo(analytics.draft, analytics.previous.draft),
    [analytics]
  );

  return (
    <>
      <div className="space-y-6">
      {error && (
        <div className="bg-negative/10 border border-negative/30 text-negative px-4 py-3 rounded-lg">
          {error}
            </div>
      )}

      <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-red to-primary-red/80 border border-primary-red/40 text-white flex items-center justify-center shadow-lg flex-shrink-0">
            <HiCalendar className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Gestión de eventos</h1>
            <p className="text-sm text-gray-400">
              Crea, publica y gestiona los eventos y sus negocios participantes.
            </p>
          </div>
                </div>
                <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all self-start sm:self-auto"
                >
                  <HiPlus className="w-5 h-5" />
          Nuevo evento
                </button>
            </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Eventos totales</p>
            <p className="text-3xl font-bold text-white mt-2">{analytics.total}</p>
            <p className={`text-xs mt-3 ${trendColors[totalTrend.tone]}`}>{totalTrend.message}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-red/20 border border-primary-red/30 flex items-center justify-center">
            <HiCalendar className="w-6 h-6 text-primary-red" />
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
                    <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Publicados</p>
            <p className="text-2xl font-bold text-white mt-2">{analytics.published}</p>
            <p className={`text-xs mt-3 ${trendColors[publishedTrend.tone]}`}>{publishedTrend.message}</p>
                      </div>
          <div className="w-12 h-12 rounded-xl bg-positive/10 border border-positive/30 flex items-center justify-center">
            <HiClock className="w-6 h-6 text-positive" />
                      </div>
                    </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Finalizados</p>
            <p className="text-2xl font-bold text-white mt-2">{analytics.finished}</p>
            <p className={`text-xs mt-3 ${trendColors[finishedTrend.tone]}`}>{finishedTrend.message}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-500/10 border border-gray-500/30 flex items-center justify-center">
            <HiShoppingBag className="w-6 h-6 text-gray-400" />
          </div>
                  </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Borradores</p>
            <p className="text-2xl font-bold text-white mt-2">{analytics.draft}</p>
            <p className={`text-xs mt-3 ${trendColors[draftTrend.tone]}`}>{draftTrend.message}</p>
                    </div>
          <div className="w-12 h-12 rounded-xl bg-accent-yellow/10 border border-accent-yellow/30 flex items-center justify-center">
            <HiPhotograph className="w-6 h-6 text-accent-yellow" />
                    </div>
                    </div>
                  </div>

      <div className="bg-dark-card rounded-xl border border-dark-border p-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, ubicación o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
            />
          </div>
                    <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className="inline-flex items-center justify-center w-10 h-10 bg-dark-bg border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-bg/80 transition-all"
            title="Mostrar filtros avanzados"
                    >
            <HiFilter className="w-5 h-5" />
                    </button>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('');
              setFilterDateFrom('');
              setFilterDateTo('');
              setCurrentPage(1);
            }}
            disabled={!searchTerm && !filterStatus && !filterDateFrom && !filterDateTo}
            className="inline-flex items-center justify-center w-10 h-10 bg-dark-bg border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-bg/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Limpiar filtros"
          >
            <HiX className="w-5 h-5" />
                    </button>
        </div>

        {filterOpen && (
          <div className="mt-4 border-t border-dark-border pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-gray-400 mb-2">Estado</label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-3.5 pr-12 appearance-none text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                >
                  <option value="">Todos</option>
                  <option value="borrador">Borrador</option>
                  <option value="publicado">Publicado</option>
                  <option value="finalizado">Finalizado</option>
                </select>
                <HiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
            <div>
              <label className="block text-gray-400 mb-2">Desde</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 appearance-none [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Hasta</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 appearance-none [color-scheme:dark]"
              />
            </div>
          </div>
        )}
            </div>

      <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400 space-y-3">
            <div className="animate-spin h-10 w-10 border-2 border-primary-red border-t-transparent rounded-full" />
            <p className="text-sm">Cargando eventos...</p>
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center justify-center text-negative space-y-3">
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm bg-primary-red/20 border border-primary-red/40 text-primary-red rounded-lg hover:bg-primary-red/30 transition-all"
            >
              Reintentar
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400 space-y-3">
            <p className="text-base font-semibold">Sin eventos</p>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              {events.length === 0
                ? 'Aún no hay eventos. Crea tu primer evento para comenzar a gestionarlo.'
                : 'No encontramos resultados con los filtros actuales. Intenta con otro término o crea un nuevo evento.'}
            </p>
            {events.length === 0 && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all mt-2"
              >
                <HiPlus className="w-5 h-5" />
                Crear evento
              </button>
            )}
            </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Negocios
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {paginatedEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-dark-bg/40 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-white font-semibold">{event.name}</span>
                        {event.description && (
                          <span className="text-xs text-gray-400 mt-1 line-clamp-1">{event.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {formatDate(event.event_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      <div className="flex items-center gap-1">
                        <HiLocationMarker className="w-4 h-4 text-gray-400" />
                        <span>{event.location}</span>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${STATUS_STYLES[event.status]}`}>
                        {STATUS_LABELS[event.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {event.business_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleManageBusinesses(event)}
                          className="p-2 text-gray-400 hover:text-primary-red hover:bg-primary-red/10 rounded-lg transition-all"
                          title="Administrar negocios"
                        >
                          <HiShoppingBag className="w-5 h-5" />
                        </button>
                    <button
                          onClick={() => openEditModal(event)}
                          className="p-2 text-gray-400 hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all"
                          title="Editar"
                    >
                          <HiPencil className="w-5 h-5" />
                    </button>
                        {canDeleteEvent && (
                          <button
                            onClick={() => handleDeleteClick(event)}
                            className="p-2 text-gray-400 hover:text-negative hover:bg-negative/10 rounded-lg transition-all"
                            title="Eliminar"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {filteredEvents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredEvents.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Modal de confirmación para eliminar evento */}
      <ConfirmModal
        open={!!eventToDelete}
        title="Eliminar evento"
        description={
          eventToDelete
            ? `¿Seguro que deseas ELIMINAR el evento "${eventToDelete.name}"? Esta acción es permanente y eliminará también los negocios asociados.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteEvent}
        onClose={() => !deletingId && setEventToDelete(null)}
        loading={!!eventToDelete && deletingId === eventToDelete.id}
        confirmButtonClassName="bg-negative hover:bg-negative/90"
      />

      {isCreateOpen && createPortal(
        <div 
          className="bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" 
          onClick={closeModal} 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            width: '100vw', 
            height: '100vh', 
            margin: 0, 
            padding: '1rem',
            zIndex: 9999
          }}
        >
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-dark-border flex-shrink-0">
              <h2 className="text-xl font-bold text-white">
                {editingEvent ? 'Editar evento' : 'Crear evento'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              {/* Contenido scrolleable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del evento *</label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ej. Feria de innovación"
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fecha *</label>
                  <input
                    type="date"
                    value={formState.event_date}
                    onChange={(e) => handleChange('event_date', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all [color-scheme:dark]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ubicación *</label>
                  <input
                    type="text"
                    value={formState.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Campus principal"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hora de inicio *</label>
                  <input
                    type="time"
                    value={formState.start_time}
                    onChange={(e) => handleChange('start_time', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all [color-scheme:dark]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hora de finalización *</label>
                  <input
                    type="time"
                    value={formState.end_time}
                    onChange={(e) => handleChange('end_time', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <textarea
                  rows={4}
                  value={formState.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe el evento, actividades, notas..."
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Estado *</label>
                <div className="relative">
                <select
                    value={formState.status}
                    onChange={(e) => handleChange('status', e.target.value as EventFormState['status'])}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all appearance-none cursor-pointer pr-10"
                >
                    <option value="borrador">Borrador</option>
                    <option value="publicado">Publicado</option>
                </select>
                  <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Imágenes del evento</label>
                <div className="space-y-4">
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-dark-bg border border-dashed border-dark-border rounded-lg text-sm font-semibold text-gray-300 hover:border-primary-red/60 hover:text-white cursor-pointer transition-all">
                    <HiPhotograph className="w-5 h-5" />
                    <span>Agregar imágenes</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview.url}
                            alt={`Previsualización ${index + 1}`}
                            className={`w-full h-32 object-cover rounded-lg border ${
                              preview.isExisting 
                                ? 'border-accent-yellow/50' 
                                : 'border-dark-border'
                            }`}
                          />
                          {preview.isExisting && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-accent-yellow/90 text-dark-bg text-xs font-semibold rounded">
                              Ya existente
                            </div>
                          )}
              <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title={preview.isExisting ? "Eliminar imagen existente" : "Eliminar imagen"}
                          >
                            <HiX className="w-4 h-4" />
              </button>
            </div>
                      ))}
        </div>
      )}

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Formatos permitidos: JPG, PNG, WEBP, GIF · Máx 5MB por imagen</p>
                    <p>Puedes seleccionar múltiples imágenes a la vez</p>
                  </div>
            </div>
              </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 px-6 pb-6 border-t border-dark-border flex-shrink-0">
              <button
                  type="button"
                  onClick={closeModal}
                className="px-6 py-2.5 bg-dark-bg hover:bg-dark-border text-gray-300 hover:text-white font-medium rounded-lg transition-all"
                  disabled={saving}
              >
                Cancelar
              </button>
              <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all disabled:opacity-60"
              >
                  {saving ? 'Guardando...' : editingEvent ? 'Actualizar evento' : 'Crear evento'}
              </button>
            </div>
            </form>
          </div>
        </div>,
        document.body
      )}
        </div>
    </>
  );
}
