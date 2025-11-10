import api from '../../../services/api';

export interface UserEvent {
  id: number;
  name: string;
  description: string | null;
  event_date: string;
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  cover_image_url: string | null;
  isOrganizer?: boolean;
  groupId?: string | null;
}

export interface FetchUserEventsResponse {
  upcoming: UserEvent[];
  organizer: UserEvent[];
}

export async function fetchUserEvents(): Promise<FetchUserEventsResponse> {
  const response = await api.get('/api/user/events');
  return response.data;
}

export interface OrganizerMember {
  id: number;
  carnet: string;
  role: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
}

export interface OrganizerSettlement {
  id: number;
  status: string;
  amount: number;
  tokenSymbol: string;
  method?: string;
  notes?: string;
  hash?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface OrganizerEventDetail {
  event: {
    id: number;
    name: string;
    date: string;
    description?: string | null;
    location?: string | null;
    status: string;
  };
  business: {
    id: number;
    name: string;
    groupId?: string;
    leadCarnet?: string;
  };
  wallet: {
    address: string | null;
    balance: number;
    tokenSymbol: string;
  };
  settlement: OrganizerSettlement | null;
  members: OrganizerMember[];
}

export async function fetchOrganizerEventDetail(eventId: number): Promise<OrganizerEventDetail> {
  const response = await api.get(`/api/user/events/organizer/${eventId}`);
  return response.data;
}

export async function requestSettlement(eventId: number, businessId: number, payload: { method?: string; notes?: string }) {
  const response = await api.post(
    `/api/user/events/${eventId}/businesses/${businessId}/settlement`,
    payload
  );
  return response.data;
}

export async function fetchSettlementStatus(eventId: number, businessId: number): Promise<OrganizerSettlement | null> {
  const response = await api.get(
    `/api/user/events/${eventId}/businesses/${businessId}/settlement`
  );
  return response.data || null;
}


