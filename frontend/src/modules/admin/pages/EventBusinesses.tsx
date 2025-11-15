import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AdminBusiness,
  AdminBusinessMember,
  AdminEvent,
  addBusinessMember,
  createBusiness,
  deleteBusiness,
  fetchBusinesses,
  getEvent,
  removeBusinessMember,
  updateBusiness
} from '../services/events';
import { searchAdminUsers, AdminUserSummary } from '../services/users';
import {
  HiArrowLeft,
  HiCalendar,
  HiClock,
  HiLocationMarker,
  HiPlus,
  HiPencil,
  HiTrash,
  HiEye,
  HiUserAdd,
  HiX,
  HiShoppingBag,
  HiDuplicate,
  HiCheckCircle,
  HiUserCircle,
  HiCreditCard
} from 'react-icons/hi';

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

interface BusinessFormState {
  name: string;
  description: string;
  lead_carnet: string;
}

const initialBusinessForm: BusinessFormState = {
  name: '',
  description: '',
  lead_carnet: ''
};

type BusinessMemberDisplay = AdminBusinessMember & { isLead?: boolean };

const buildMembersList = (business: AdminBusiness): BusinessMemberDisplay[] => {
  const baseMembers: BusinessMemberDisplay[] = (business.members ?? []).map((member) => ({
    ...member
  }));

  const hasLead = baseMembers.some((member) => member.carnet === business.lead_carnet);

  if (!hasLead && business.lead_carnet) {
    baseMembers.unshift({
      id: `lead-${business.id}`,
      carnet: business.lead_carnet,
      role: 'Responsable',
      nombres: business.lead_user?.nombres,
      apellidos: business.lead_user?.apellidos,
      email: business.lead_user?.email,
      isLead: true
    });
  } else {
    baseMembers.forEach((member) => {
      if (member.carnet === business.lead_carnet) {
        member.isLead = true;
      }
    });
  }

  return baseMembers;
};

export default function EventBusinesses() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<AdminEvent | null>(null);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [businessForm, setBusinessForm] = useState<BusinessFormState>(initialBusinessForm);
  const [editingBusiness, setEditingBusiness] = useState<AdminBusiness | null>(null);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [leadSearchResults, setLeadSearchResults] = useState<AdminUserSummary[]>([]);
  const [leadSearchLoading, setLeadSearchLoading] = useState(false);
  const [leadSelectedUser, setLeadSelectedUser] = useState<AdminUserSummary | null>(null);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [viewMembersBusiness, setViewMembersBusiness] = useState<AdminBusiness | null>(null);
  const [addMemberBusiness, setAddMemberBusiness] = useState<AdminBusiness | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState<AdminUserSummary[]>([]);
  const [memberSearchLoading, setMemberSearchLoading] = useState(false);
  const [selectedMemberUser, setSelectedMemberUser] = useState<AdminUserSummary | null>(null);
  const [memberRole, setMemberRole] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  const numericEventId = useMemo(() => Number(eventId), [eventId]);

  useEffect(() => {
    if (!numericEventId) {
      setError('Evento no válido');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [eventData, businessData] = await Promise.all([
          getEvent(numericEventId),
          fetchBusinesses(numericEventId)
        ]);
        setEvent(eventData);
        setBusinesses(businessData);
      } catch (err: any) {
        console.error('Error cargando negocios del evento', err);
        setError(err.response?.data?.error || 'No se pudo cargar la información del evento');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [numericEventId]);

  const refreshBusinesses = async () => {
    if (!numericEventId) return;
    try {
      const data = await fetchBusinesses(numericEventId);
      setBusinesses(data);
    } catch (err: any) {
      console.error('Error refrescando negocios', err);
      setError(err.response?.data?.error || 'No se pudo refrescar la lista de negocios');
    }
  };

  const openCreateBusinessModal = () => {
    setBusinessForm(initialBusinessForm);
    setEditingBusiness(null);
    setLeadSelectedUser(null);
    setLeadSearchQuery('');
    setLeadSearchResults([]);
    setCurrentGroupId(null);
    setIsBusinessModalOpen(true);
  };

  const openEditBusinessModal = (business: AdminBusiness) => {
    setBusinessForm({
      name: business.name,
      description: business.description || '',
      lead_carnet: business.lead_carnet
    });
    setEditingBusiness(business);
    if (business.lead_user) {
      setLeadSelectedUser(business.lead_user);
    } else {
      setLeadSelectedUser(null);
    }
    setLeadSearchQuery(business.lead_carnet);
    setLeadSearchResults([]);
    setCurrentGroupId(business.group_id);
    setIsBusinessModalOpen(true);
  };

  const closeBusinessModal = () => {
    setIsBusinessModalOpen(false);
    setEditingBusiness(null);
    setBusinessForm(initialBusinessForm);
    setLeadSelectedUser(null);
    setLeadSearchQuery('');
    setLeadSearchResults([]);
    setLeadSearchLoading(false);
    setCurrentGroupId(null);
  };

  const handleBusinessFormChange = (field: keyof BusinessFormState, value: string) => {
    setBusinessForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLeadSearchChange = (value: string) => {
    setLeadSearchQuery(value);
    setLeadSelectedUser(null);
    handleBusinessFormChange('lead_carnet', value);
  };

  useEffect(() => {
    let active = true;

    const runSearch = async () => {
      if (!leadSearchQuery || leadSearchQuery.trim().length < 2) {
        setLeadSearchResults([]);
        setLeadSearchLoading(false);
        return;
      }
      setLeadSearchLoading(true);
      try {
        const results = await searchAdminUsers(leadSearchQuery.trim(), 5);
        if (active) {
          setLeadSearchResults(results);
        }
      } catch (err) {
        console.error('Error buscando usuarios', err);
        if (active) {
          setLeadSearchResults([]);
        }
      } finally {
        if (active) {
          setLeadSearchLoading(false);
        }
      }
    };

    const timeout = setTimeout(runSearch, 250);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [leadSearchQuery]);

  const handleSelectLeadUser = (user: AdminUserSummary) => {
    setLeadSelectedUser(user);
    setBusinessForm((prev) => ({ ...prev, lead_carnet: user.carnet }));
    setLeadSearchQuery(user.carnet);
    setLeadSearchResults([]);
  };

  const handleSubmitBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numericEventId) return;

    if (!businessForm.name || !businessForm.lead_carnet) {
      alert('El nombre del negocio y el carnet del responsable son obligatorios.');
      return;
    }

    if (!leadSelectedUser || leadSelectedUser.carnet !== businessForm.lead_carnet) {
      alert('Selecciona un responsable válido de la lista.');
      return;
    }

    setSavingBusiness(true);
    try {
      if (editingBusiness) {
        await updateBusiness(numericEventId, editingBusiness.id, businessForm);
      } else {
        await createBusiness(numericEventId, businessForm);
      }
      await refreshBusinesses();
      closeBusinessModal();
    } catch (err: any) {
      console.error('Error guardando negocio', err);
      alert(err.response?.data?.error || 'No se pudo guardar el negocio');
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleDeleteBusiness = async (business: AdminBusiness) => {
    if (!numericEventId) return;
    const confirmed = window.confirm(`¿Eliminar el negocio "${business.name}"? Esta acción es permanente.`);
    if (!confirmed) return;
    try {
      await deleteBusiness(numericEventId, business.id);
      await refreshBusinesses();
    } catch (err: any) {
      console.error('Error eliminando negocio', err);
      alert(err.response?.data?.error || 'No se pudo eliminar el negocio');
    }
  };

  const openViewMembersModal = (business: AdminBusiness) => {
    setViewMembersBusiness(business);
  };

  const closeViewMembersModal = () => {
    setViewMembersBusiness(null);
  };

  const openAddMemberModal = (business: AdminBusiness) => {
    setAddMemberBusiness(business);
    setMemberSearchQuery('');
    setMemberSearchResults([]);
    setSelectedMemberUser(null);
    setMemberRole('');
    setMemberSearchLoading(false);
  };

  const closeAddMemberModal = () => {
    setAddMemberBusiness(null);
    setMemberSearchQuery('');
    setMemberSearchResults([]);
    setSelectedMemberUser(null);
    setMemberRole('');
    setMemberSearchLoading(false);
    setAddingMember(false);
  };

  useEffect(() => {
    let active = true;

    const runSearch = async () => {
      if (!memberSearchQuery || memberSearchQuery.trim().length < 2) {
        setMemberSearchResults([]);
        setMemberSearchLoading(false);
        return;
      }
      setMemberSearchLoading(true);
      try {
        const results = await searchAdminUsers(memberSearchQuery.trim(), 6);
        if (active) {
          setMemberSearchResults(results);
        }
      } catch (err) {
        console.error('Error buscando miembros', err);
        if (active) {
          setMemberSearchResults([]);
        }
      } finally {
        if (active) {
          setMemberSearchLoading(false);
        }
      }
    };

    const timeout = setTimeout(runSearch, 250);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [memberSearchQuery]);

  const handleSelectMemberUser = (user: AdminUserSummary) => {
    setSelectedMemberUser(user);
    setMemberSearchQuery(`${user.nombres} ${user.apellidos} (${user.carnet})`);
    setMemberSearchResults([]);
  };

  const handleConfirmAddMember = async () => {
    if (!numericEventId || !addMemberBusiness) return;
    if (!selectedMemberUser) {
      alert('Selecciona un usuario para asignar al negocio.');
      return;
    }
    if (!memberRole.trim()) {
      alert('Ingresa el rol que tendrá en el negocio.');
      return;
    }
    setAddingMember(true);
    try {
      await addBusinessMember(numericEventId, addMemberBusiness.id, {
        carnet: selectedMemberUser.carnet,
        role: memberRole.trim()
      });
      await refreshBusinesses();
      closeAddMemberModal();
    } catch (err: any) {
      console.error('Error agregando miembro', err);
      alert(err.response?.data?.error || 'No se pudo agregar el miembro');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (business: AdminBusiness, member: AdminBusinessMember) => {
    if (!numericEventId) return;
    if (member.carnet === business.lead_carnet) {
      alert('No puedes remover al responsable principal del negocio.');
      return;
    }
    const confirmed = window.confirm(`¿Eliminar a ${member.carnet} del negocio?`);
    if (!confirmed) return;
    try {
      await removeBusinessMember(numericEventId, business.id, member.id);
      await refreshBusinesses();
    } catch (err: any) {
      console.error('Error eliminando miembro', err);
      alert(err.response?.data?.error || 'No se pudo eliminar el miembro');
    }
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCopyWallet = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedWallet(address);
      setTimeout(() => setCopiedWallet(null), 2000);
    } catch (err) {
      console.error('Error copying wallet address', err);
    }
  };

  const truncateAddress = (address: string | null | undefined) => {
    if (!address) return 'Pendiente de asignar';
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Cargando negocios del evento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-negative/10 border border-negative/30 text-negative px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-negative/10 border border-negative/30 text-negative px-4 py-3 rounded-lg">
        Evento no encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/admin/events')}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-dark-card border border-dark-border px-3 py-2 rounded-lg"
      >
        <HiArrowLeft className="w-4 h-4" />
        <span className="text-sm">Volver a eventos</span>
      </button>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <HiShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{event.name}</h1>
                <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${STATUS_STYLES[event.status]}`}>
                  {STATUS_LABELS[event.status]}
                </span>
              </div>
              <p className="text-sm text-gray-400">Gestiona negocios y equipos asociados a este evento.</p>
            </div>
          </div>
          <button
            onClick={openCreateBusinessModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all self-start lg:self-auto"
          >
            <HiPlus className="w-5 h-5" />
            Nuevo negocio
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-dark-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-red/10 border border-primary-red/20 flex items-center justify-center">
              <HiCalendar className="w-4 h-4 text-primary-red" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Fecha</p>
              <p className="text-sm font-semibold text-white">{formatDate(event.event_date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
              <HiClock className="w-4 h-4 text-accent-blue" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Horario</p>
              <p className="text-sm font-semibold text-white">
                {event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20 flex items-center justify-center">
              <HiLocationMarker className="w-4 h-4 text-accent-yellow" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ubicación</p>
              <p className="text-sm font-semibold text-white truncate">{event.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-positive/10 border border-positive/20 flex items-center justify-center">
              <HiShoppingBag className="w-4 h-4 text-positive" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Negocios</p>
              <p className="text-sm font-semibold text-white">{businesses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {businesses.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
          <HiShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">No hay negocios registrados</h2>
          <p className="text-gray-500 mb-6">Crea el primer negocio para este evento.</p>
          <button
            onClick={openCreateBusinessModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all"
          >
            <HiPlus className="w-5 h-5" />
            Crear negocio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {businesses.map((business) => {
            const membersToDisplay = buildMembersList(business);

            return (
              <div 
                key={business.id} 
                onClick={() => openViewMembersModal(business)}
                className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary-red/30 transition-all flex flex-col h-full cursor-pointer group"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-red transition-colors">{business.name}</h3>
                      {business.description && (
                        <p className="text-sm text-gray-300 leading-relaxed mb-4">{business.description}</p>
                      )}
                    </div>
                    <div className="flex flex-row gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditBusinessModal(business)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all"
                        title="Editar negocio"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBusiness(business)}
                        className="p-2 text-gray-400 hover:text-negative hover:bg-negative/10 rounded-lg transition-all"
                        title="Eliminar negocio"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="bg-dark-bg/50 border border-dark-border rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Responsable principal</p>
                      <div className="flex items-center gap-2">
                        <HiUserCircle className="w-4 h-4 text-primary-red flex-shrink-0" />
                        <p className="text-sm text-white font-semibold truncate">
                          {business.lead_user ? (
                            <>
                              {business.lead_user.nombres} {business.lead_user.apellidos}
                              <span className="text-gray-400 ml-1">({business.lead_user.carnet})</span>
                            </>
                          ) : (
                            business.lead_carnet
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="bg-dark-bg/50 border border-dark-border rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">ID de grupo</p>
                      <p className="text-sm text-white font-semibold font-mono">{business.group_id}</p>
                    </div>

                    <div className="bg-dark-bg/50 border border-dark-border rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-2">Wallet del negocio</p>
                      {business.wallet_address ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <HiCreditCard className="w-4 h-4 text-accent-blue flex-shrink-0" />
                          <code className="text-xs text-white font-mono flex-1 truncate" title={business.wallet_address}>
                            {truncateAddress(business.wallet_address)}
                          </code>
                          <button
                            onClick={() => handleCopyWallet(business.wallet_address!)}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-bg rounded transition-all flex-shrink-0"
                            title="Copiar dirección"
                          >
                            {copiedWallet === business.wallet_address ? (
                              <HiCheckCircle className="w-4 h-4 text-positive" />
                            ) : (
                              <HiDuplicate className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Pendiente de asignar</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-dark-bg border border-dark-border rounded-xl p-4 mt-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <HiUserCircle className="w-4 h-4 text-primary-red" />
                        Miembros
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{membersToDisplay.length} integrantes</p>
                    </div>
                    <button
                      onClick={() => openAddMemberModal(business)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-red hover:bg-primary-red/90 text-white rounded-lg text-xs font-semibold transition-all"
                    >
                      <HiUserAdd className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isBusinessModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-border sticky top-0 bg-dark-card z-10">
              <h2 className="text-xl font-bold text-white">
                {editingBusiness ? 'Editar negocio' : 'Crear negocio'}
              </h2>
              <button onClick={closeBusinessModal} className="text-gray-400 hover:text-white transition-colors">
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitBusiness} className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  {editingBusiness ? 'Editar negocio' : 'Registrar nuevo negocio'}
                </h2>
                <p className="text-sm text-gray-400">
                  Completa la información del negocio para este evento.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del negocio *</label>
                <input
                  type="text"
                  value={businessForm.name}
                  onChange={(e) => handleBusinessFormChange('name', e.target.value)}
                  placeholder="Ej. Cafetería central"
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/40"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <textarea
                  rows={3}
                  value={businessForm.description}
                  onChange={(e) => handleBusinessFormChange('description', e.target.value)}
                  placeholder="Describe el negocio"
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/40 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Carnet del responsable *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={leadSearchQuery}
                    onChange={(e) => handleLeadSearchChange(e.target.value)}
                    placeholder="Busca por nombre o carnet"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                    required
                  />
                  {leadSearchLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 animate-pulse">
                      Buscando...
                    </div>
                  )}
                  {leadSearchResults.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-dark-card border border-dark-border rounded-xl shadow-lg z-10 max-h-52 overflow-y-auto">
                      {leadSearchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectLeadUser(user)}
                          className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-dark-bg transition-colors"
                        >
                          <p className="font-medium text-white">
                            {user.nombres} {user.apellidos}
                          </p>
                          <p className="text-xs text-gray-400">{user.carnet} · {user.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {leadSelectedUser && (
                  <p className="mt-2 text-xs text-gray-500">
                    Responsable seleccionado: {leadSelectedUser.nombres} {leadSelectedUser.apellidos} ({leadSelectedUser.carnet})
                  </p>
                )}
              </div>

              {currentGroupId && (
                <div className="bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-sm text-gray-300 flex items-center justify-between">
                  <span>ID de grupo</span>
                  <span className="font-semibold text-white">{currentGroupId}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
                <button
                  type="button"
                  onClick={closeBusinessModal}
                  className="px-6 py-2.5 bg-dark-bg hover:bg-dark-border text-gray-300 hover:text-white font-medium rounded-lg transition-all"
                  disabled={savingBusiness}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingBusiness}
                  className="px-6 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all disabled:opacity-60"
                >
                  {savingBusiness ? 'Guardando...' : editingBusiness ? 'Actualizar negocio' : 'Crear negocio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewMembersBusiness && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <div>
                <h2 className="text-xl font-bold text-white">Miembros del negocio</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {viewMembersBusiness.name} · {viewMembersBusiness.group_id}
                </p>
              </div>
              <button onClick={closeViewMembersModal} className="text-gray-400 hover:text-white transition-colors">
                <HiX className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {buildMembersList(viewMembersBusiness).length === 0 ? (
                <p className="text-sm text-gray-400">Este negocio aún no tiene usuarios asignados.</p>
              ) : (
                <div className="space-y-3">
                  {buildMembersList(viewMembersBusiness).map((member) => (
                    <div
                      key={member.id}
                      className="bg-dark-bg border border-dark-border rounded-xl px-4 py-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {member.nombres || member.apellidos
                            ? `${member.nombres ?? ''} ${member.apellidos ?? ''}`.trim()
                            : member.carnet}
                        </p>
                        <p className="text-xs text-gray-400">
                          {member.role}
                          {member.carnet ? ` · ${member.carnet}` : ''}
                        </p>
                        {member.email && (
                          <p className="text-xs text-gray-500 mt-1">{member.email}</p>
                        )}
                      </div>
                      {member.isLead ? (
                        <span className="text-xs font-semibold text-primary-red">Responsable</span>
                      ) : (
                        <button
                          onClick={() => handleRemoveMember(viewMembersBusiness, member)}
                          className="p-2 text-gray-400 hover:text-negative hover:bg-negative/10 rounded-lg transition-all"
                          title="Quitar miembro"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-dark-border">
              <button
                onClick={closeViewMembersModal}
                className="px-6 py-2.5 bg-dark-bg hover:bg-dark-border text-gray-300 hover:text-white font-medium rounded-lg transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {addMemberBusiness && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-border sticky top-0 bg-dark-card z-10">
              <div>
                <h2 className="text-xl font-bold text-white">Agregar miembro</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {addMemberBusiness.name} · {addMemberBusiness.group_id}
                </p>
              </div>
              <button onClick={closeAddMemberModal} className="text-gray-400 hover:text-white transition-colors">
                <HiX className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Buscar usuario</label>
                <div className="relative">
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Ingresa nombre o carnet (mínimo 2 caracteres)"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  />
                  {memberSearchLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 animate-pulse">
                      Buscando...
                    </div>
                  )}
                </div>
                {memberSearchResults.length > 0 && (
                  <div className="bg-dark-bg border border-dark-border rounded-xl mt-2 max-h-60 overflow-y-auto">
                    {memberSearchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectMemberUser(user)}
                        className="w-full text-left px-4 py-3 border-b border-dark-border last:border-b-0 hover:bg-dark-card transition-colors"
                      >
                        <p className="text-sm font-semibold text-white">
                          {user.nombres} {user.apellidos}
                        </p>
                        <p className="text-xs text-gray-400">
                          {user.carnet} · {user.email}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                {selectedMemberUser && (
                  <div className="bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-sm text-gray-300">
                    <p className="text-white font-semibold">
                      {selectedMemberUser.nombres} {selectedMemberUser.apellidos}
                    </p>
                    <p className="text-xs text-gray-400">{selectedMemberUser.carnet} · {selectedMemberUser.email}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rol dentro del negocio *</label>
                <input
                  type="text"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  placeholder="Ej. Cajero, Coordinador..."
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-dark-border">
              <button
                onClick={closeAddMemberModal}
                className="px-6 py-2.5 bg-dark-bg hover:bg-dark-border text-gray-300 hover:text-white font-medium rounded-lg transition-all"
                disabled={addingMember}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAddMember}
                className="px-6 py-2.5 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all disabled:opacity-60"
                disabled={addingMember}
              >
                {addingMember ? 'Agregando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
