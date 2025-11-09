import { ChangeEvent, useEffect, useMemo, useState } from 'react';
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
  HiPhotograph
} from 'react-icons/hi';
import {
  AdminEvent,
  createEvent,
  deleteEvent,
  fetchEvents,
  updateEvent,
  CreateEventPayload
} from '../services/events';
import { API_BASE_URL } from '../../../services/api';

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
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [coverImageChanged, setCoverImageChanged] = useState(false);
  const [existingCoverImage, setExistingCoverImage] = useState<string | null>(null);

  const buildCoverImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  const revokePreview = (preview: string | null) => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
  };

  const resetCoverImageState = () => {
    revokePreview(coverImagePreview);
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setCoverImageChanged(false);
    setExistingCoverImage(null);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    const file = fileList[0];
    if (!file.type.startsWith('image/')) {
      alert('Selecciona un archivo de imagen válido.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen supera el tamaño máximo permitido de 5MB.');
      event.target.value = '';
      return;
    }

    revokePreview(coverImagePreview);
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
    setCoverImageChanged(true);
    event.target.value = '';
  };

  const handleRemoveSelectedImage = () => {
    revokePreview(coverImagePreview);
    setCoverImageFile(null);
    if (editingEvent && existingCoverImage) {
      setCoverImagePreview(existingCoverImage);
      setCoverImageChanged(false);
    } else {
      setCoverImagePreview(null);
      setCoverImageChanged(false);
    }
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }, [events]);

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
    resetCoverImageState();
    setIsCreateOpen(true);
  };

  const openEditModal = (event: AdminEvent) => {
    setFormState({
      name: event.name,
      event_date: event.event_date,
      location: event.location,
      start_time: event.start_time,
      end_time: event.end_time,
      description: event.description || '',
      status: event.status === 'publicado' ? 'publicado' : 'borrador'
    });
    setEditingEvent(event);
    const imageUrl = buildCoverImageUrl(event.cover_image_url);
    resetCoverImageState();
    if (imageUrl) {
      setExistingCoverImage(imageUrl);
      setCoverImagePreview(imageUrl);
    }
    setIsCreateOpen(true);
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditingEvent(null);
    setFormState(initialForm);
    resetCoverImageState();
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
        const updated = await updateEvent(
          editingEvent.id,
          formState,
          coverImageChanged ? coverImageFile : undefined
        );
        setEvents((prev) => prev.map((evt) => (evt.id === updated.id ? { ...evt, ...updated } : evt)));
      } else {
        const payload: CreateEventPayload = {
          name: formState.name,
          event_date: formState.event_date,
          location: formState.location,
          start_time: formState.start_time,
          end_time: formState.end_time,
          description: formState.description,
          status: formState.status
        };
        const created = await createEvent(payload, coverImageFile);
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

  const handleDelete = async (event: AdminEvent) => {
    const confirmed = window.confirm(`¿Eliminar el evento "${event.name}"? Esta acción es permanente.`);
    if (!confirmed) return;

    try {
      await deleteEvent(event.id);
      setEvents((prev) => prev.filter((evt) => evt.id !== event.id));
    } catch (err: any) {
      console.error('Error eliminando evento', err);
      alert(err.response?.data?.error || 'No se pudo eliminar el evento');
    }
  };

  const handleManageBusinesses = (event: AdminEvent) => {
    navigate(`/admin/events/${event.id}`);
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Cargando eventos...</p>
      </div>
    );
  }

  return (
      <div className="space-y-6">
      {error && (
        <div className="bg-negative/10 border border-negative/30 text-negative px-4 py-3 rounded-lg">
          {error}
            </div>
      )}

      <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Gestión de eventos</h1>
          <p className="text-sm text-gray-400 mt-1">
            Crea, publica y gestiona los eventos y sus negocios participantes.
          </p>
                </div>
                <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all self-start sm:self-auto"
                >
                  <HiPlus className="w-5 h-5" />
          Nuevo evento
                </button>
            </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
                    <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Eventos totales</p>
            <p className="text-3xl font-bold text-white mt-2">{events.length}</p>
                      </div>
          <div className="w-12 h-12 rounded-xl bg-primary-red/20 border border-primary-red/30 flex items-center justify-center">
            <HiCalendar className="w-6 h-6 text-primary-red" />
                      </div>
                  </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Eventos publicados</p>
            <p className="text-3xl font-bold text-white mt-2">
              {events.filter((evt) => evt.status === 'publicado').length}
            </p>
                    </div>
          <div className="w-12 h-12 rounded-xl bg-positive/10 border border-positive/30 flex items-center justify-center">
            <HiClock className="w-6 h-6 text-positive" />
                    </div>
                  </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Eventos finalizados</p>
            <p className="text-3xl font-bold text-white mt-2">
              {events.filter((evt) => evt.status === 'finalizado').length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-500/10 border border-gray-500/30 flex items-center justify-center">
            <HiShoppingBag className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
            </div>

      {events.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
          <HiShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Aún no hay eventos</h2>
          <p className="text-gray-500 mb-6">Crea tu primer evento para comenzar a gestionarlo.</p>
              <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all"
              >
                <HiPlus className="w-5 h-5" />
            Crear evento
              </button>
            </div>
      ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedEvents.map((event) => {
            const coverImage = buildCoverImageUrl(event.cover_image_url);

            return (
              <div
                key={event.id}
                className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary-red/30 transition-all"
              >
                {coverImage && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-dark-border bg-dark-bg">
                    <img
                      src={coverImage}
                      alt={`Portada del evento ${event.name}`}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{event.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                      <HiCalendar className="w-4 h-4" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <HiClock className="w-4 h-4" />
                      <span>
                        {event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${STATUS_STYLES[event.status]}`}>
                    {STATUS_LABELS[event.status]}
                  </span>
                </div>

                <div className="space-y-3 mb-5">
                  {event.description && (
                    <p className="text-sm text-gray-300 leading-relaxed">{event.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <HiLocationMarker className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Negocios registrados: <span className="text-white font-semibold">{event.business_count}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-dark-border">
                  <button
                    onClick={() => handleManageBusinesses(event)}
                    className="flex-1 px-4 py-2 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg text-sm font-semibold transition-all"
                  >
                    Administrar negocios
                  </button>
                  <button
                    onClick={() => openEditModal(event)}
                    className="px-4 py-2 text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all"
                    title="Editar"
                  >
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event)}
                    className="px-4 py-2 text-gray-400 hover:text-negative hover:bg-negative/10 rounded-lg transition-all"
                    title="Eliminar"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
                </div>
              )}

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-border sticky top-0 bg-dark-card z-10">
              <h2 className="text-xl font-bold text-white">
                {editingEvent ? 'Editar evento' : 'Crear evento'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
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
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hora de finalización *</label>
                  <input
                    type="time"
                    value={formState.end_time}
                    onChange={(e) => handleChange('end_time', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
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
                <select
                  value={formState.status}
                  onChange={(e) => handleChange('status', e.target.value as EventFormState['status'])}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                >
                  <option value="borrador">Borrador</option>
                  <option value="publicado">Publicado</option>
                </select>
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Imagen de portada</label>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-dark-bg border border-dashed border-dark-border rounded-lg text-sm font-semibold text-gray-300 hover:border-primary-red/60 hover:text-white cursor-pointer transition-all">
                      <HiPhotograph className="w-5 h-5" />
                      <span>{coverImagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                    {coverImagePreview && (
                      <img
                        src={coverImagePreview}
                        alt="Previsualización del evento"
                        className="h-24 w-full sm:w-40 object-cover rounded-lg border border-dark-border"
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span>Formatos permitidos: JPG, PNG, WEBP, GIF · Máx 5MB</span>
                    {coverImagePreview && coverImageChanged && (
                      <button
                        type="button"
                        onClick={handleRemoveSelectedImage}
                        className="text-primary-red hover:text-primary-red/80 font-semibold"
                      >
                        Quitar imagen
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
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
        </div>
      )}
        </div>
  );
}
