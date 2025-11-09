import api from '../../../services/api';

export interface AdminEvent {
  id: number;
  name: string;
  event_date: string;
  location: string;
  start_time: string;
  end_time: string;
  description?: string | null;
  status: 'borrador' | 'publicado' | 'finalizado';
  cover_image_url?: string | null;
  business_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEventPayload {
  name: string;
  event_date: string;
  location: string;
  start_time: string;
  end_time: string;
  description?: string;
  status?: 'borrador' | 'publicado';
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}

export interface AdminBusinessMember {
  id: number | string;
  carnet: string;
  role: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminBusinessLeadUser {
  id: number;
  nombres: string;
  apellidos: string;
  carnet: string;
  email: string;
}

export interface AdminBusiness {
  id: number;
  name: string;
  description?: string | null;
  lead_carnet: string;
  group_id: string;
  lead_user: AdminBusinessLeadUser | null;
  wallet_address: string | null;
  members: AdminBusinessMember[];
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessPayload {
  name: string;
  description?: string;
  lead_carnet: string;
}

export interface UpdateBusinessPayload extends Partial<CreateBusinessPayload> {}

export interface AddMemberPayload {
  carnet: string;
  role: string;
}

export async function fetchEvents(): Promise<AdminEvent[]> {
  const response = await api.get('/api/admin/events');
  return response.data.data ?? [];
}

export async function getEvent(eventId: number): Promise<AdminEvent> {
  const response = await api.get(`/api/admin/events/${eventId}`);
  return response.data.data;
}

export async function createEvent(payload: CreateEventPayload, coverImage?: File | null): Promise<AdminEvent> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  if (coverImage) {
    formData.append('cover_image', coverImage);
  }

  const response = await api.post('/api/admin/events', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.event;
}

export async function updateEvent(eventId: number, payload: UpdateEventPayload, coverImage?: File | null): Promise<AdminEvent> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  if (coverImage) {
    formData.append('cover_image', coverImage);
  }

  const response = await api.put(`/api/admin/events/${eventId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.event;
}

export async function deleteEvent(eventId: number): Promise<void> {
  await api.delete(`/api/admin/events/${eventId}`);
}

export async function fetchBusinesses(eventId: number): Promise<AdminBusiness[]> {
  const response = await api.get(`/api/admin/events/${eventId}/businesses`);
  return response.data.data ?? [];
}

export async function createBusiness(eventId: number, payload: CreateBusinessPayload): Promise<AdminBusiness> {
  const response = await api.post(`/api/admin/events/${eventId}/businesses`, payload);
  return response.data.business;
}

export async function updateBusiness(eventId: number, businessId: number, payload: UpdateBusinessPayload): Promise<AdminBusiness> {
  const response = await api.put(`/api/admin/events/${eventId}/businesses/${businessId}`, payload);
  return response.data.business;
}

export async function deleteBusiness(eventId: number, businessId: number): Promise<void> {
  await api.delete(`/api/admin/events/${eventId}/businesses/${businessId}`);
}

export async function addBusinessMember(eventId: number, businessId: number, payload: AddMemberPayload): Promise<AdminBusinessMember> {
  const response = await api.post(`/api/admin/events/${eventId}/businesses/${businessId}/members`, payload);
  return response.data.member;
}

export async function removeBusinessMember(eventId: number, businessId: number, memberId: number): Promise<void> {
  await api.delete(`/api/admin/events/${eventId}/businesses/${businessId}/members/${memberId}`);
}
