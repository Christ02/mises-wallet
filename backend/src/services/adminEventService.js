import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { EventRepository } from '../repositories/eventRepository.js';
import { EventBusinessRepository } from '../repositories/eventBusinessRepository.js';
import { EventBusinessMemberRepository } from '../repositories/eventBusinessMemberRepository.js';
import { BusinessWalletService } from './businessWalletService.js';
import { UserRepository } from '../repositories/userRepository.js';

const VALID_STATUSES = ['borrador', 'publicado', 'finalizado'];

function deleteFileIfExists(relativePath) {
  if (!relativePath) return;
  const normalized = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  const absolutePath = path.join(process.cwd(), normalized);
  fs.access(absolutePath, fs.constants.F_OK, (err) => {
    if (err) {
      return;
    }
    fs.unlink(absolutePath, (unlinkErr) => {
      if (unlinkErr && unlinkErr.code !== 'ENOENT') {
        console.error('Error eliminando archivo antiguo:', unlinkErr);
      }
    });
  });
}

function computeFinalStatus(eventRow) {
  const currentStatus = eventRow.status;
  if (currentStatus === 'finalizado') {
    return 'finalizado';
  }

  const endDateTime = new Date(eventRow.event_date);
  const [hours, minutes, seconds] = eventRow.end_time.split(':').map((value) => parseInt(value, 10));
  endDateTime.setHours(hours || 0, minutes || 0, seconds || 0, 0);

  const now = new Date();
  if (now.getTime() > endDateTime.getTime()) {
    return 'finalizado';
  }

  return currentStatus;
}

async function getLeadUserForCarnet(carnet) {
  if (!carnet) return null;
  const user = await UserRepository.findByCarnet(carnet);
  if (!user) return null;
  return {
    id: user.id,
    nombres: user.nombres,
    apellidos: user.apellidos,
    carnet: user.carnet_universitario,
    email: user.email
  };
}

async function generateUniqueGroupId() {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const randomSegment = crypto.randomBytes(4).toString('hex').toUpperCase();
    const candidate = `GRP-${randomSegment}`;
    const existing = await EventBusinessRepository.findByGroupId(candidate);
    if (!existing) {
      return candidate;
    }
  }

  throw new Error('No se pudo generar un group-id único. Intenta nuevamente.');
}

async function decorateBusiness(business) {
  const wallet = await BusinessWalletService.getWalletByBusinessId(business.id);
  const members = await EventBusinessMemberRepository.findByBusinessId(business.id);
  const leadUser = await getLeadUserForCarnet(business.lead_carnet);

  return {
    id: business.id,
    name: business.name,
    description: business.description,
    lead_carnet: business.lead_carnet,
    group_id: business.group_id,
    lead_user: leadUser,
    wallet_address: wallet?.address || null,
    created_at: business.created_at,
    updated_at: business.updated_at,
    members
  };
}

export class AdminEventService {
  static async listEvents() {
    const events = await EventRepository.findAllWithBusinessCount();

    return Promise.all(
      events.map(async (event) => {
        const computedStatus = computeFinalStatus(event);
        if (computedStatus !== event.status) {
          await EventRepository.updateStatus(event.id, computedStatus);
        }
        return {
          id: event.id,
          name: event.name,
          event_date: event.event_date,
          location: event.location,
          start_time: event.start_time,
          end_time: event.end_time,
          description: event.description,
          status: computedStatus,
          cover_image_url: event.cover_image_url,
          business_count: event.business_count ?? 0,
          created_at: event.created_at,
          updated_at: event.updated_at
        };
      })
    );
  }

  static async getEventById(id) {
    const event = await EventRepository.findById(id);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    const computedStatus = computeFinalStatus(event);
    if (computedStatus !== event.status) {
      await EventRepository.updateStatus(event.id, computedStatus);
      event.status = computedStatus;
    }

    return event;
  }

  static async createEvent({ name, event_date, location, start_time, end_time, description, status, cover_image_url }) {
    if (!name || !event_date || !location || !start_time || !end_time) {
      throw new Error('Faltan campos obligatorios para crear el evento');
    }

    const normalizedStatus = status && VALID_STATUSES.includes(status.toLowerCase())
      ? status.toLowerCase()
      : 'borrador';

    const event = await EventRepository.create({
      name,
      event_date,
      location,
      start_time,
      end_time,
      description,
      status: normalizedStatus,
      cover_image_url
    });

    return { ...event, business_count: 0 };
  }

  static async updateEvent(id, data) {
    const existingEvent = await EventRepository.findById(id);
    if (!existingEvent) {
      throw new Error('Evento no encontrado');
    }

    const payload = { ...data };

    if (payload.status) {
      const normalizedStatus = payload.status.toLowerCase();
      if (!VALID_STATUSES.includes(normalizedStatus)) {
        throw new Error('Estado de evento no válido');
      }
      payload.status = normalizedStatus;
    }

    const updated = await EventRepository.update(id, payload);

    if (payload.cover_image_url && existingEvent.cover_image_url && payload.cover_image_url !== existingEvent.cover_image_url) {
      deleteFileIfExists(existingEvent.cover_image_url);
    }

    const computedStatus = computeFinalStatus(updated);
    if (computedStatus !== updated.status) {
      await EventRepository.updateStatus(updated.id, computedStatus);
      updated.status = computedStatus;
    }

    const businessCount = await EventBusinessRepository.findByEventId(updated.id);
    return { ...updated, business_count: businessCount.length };
  }

  static async deleteEvent(id) {
    const event = await EventRepository.findById(id);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    if (event.cover_image_url) {
      deleteFileIfExists(event.cover_image_url);
    }

    await EventRepository.delete(id);
  }

  static async listBusinesses(eventId) {
    await this.getEventById(eventId);
    const businesses = await EventBusinessRepository.findByEventId(eventId);

    const decorated = await Promise.all(businesses.map((business) => decorateBusiness(business)));
    return decorated;
  }

  static async createBusiness(eventId, { name, description, lead_carnet }) {
    if (!name || !lead_carnet) {
      throw new Error('Los campos nombre y carnet del responsable son obligatorios');
    }

    await this.getEventById(eventId);

    const leadUser = await UserRepository.findByCarnet(lead_carnet);
    if (!leadUser) {
      throw new Error('El carnet del responsable no pertenece a un usuario registrado');
    }

    const groupId = await generateUniqueGroupId();
    const business = await EventBusinessRepository.create({
      event_id: eventId,
      name,
      description,
      lead_carnet,
      group_id: groupId
    });

    await BusinessWalletService.createWalletForBusiness(business.id);
    await EventBusinessMemberRepository.addMember({
      business_id: business.id,
      carnet: lead_carnet,
      role: 'Responsable'
    });

    const decorated = await decorateBusiness(business);
    return decorated;
  }

  static async updateBusiness(eventId, businessId, data) {
    await this.getEventById(eventId);
    const business = await EventBusinessRepository.findById(businessId);
    if (!business || business.event_id !== Number(eventId)) {
      throw new Error('Negocio no encontrado para este evento');
    }

    if (data.lead_carnet) {
      const leadUser = await UserRepository.findByCarnet(data.lead_carnet);
      if (!leadUser) {
        throw new Error('El carnet del responsable no pertenece a un usuario registrado');
      }
    }

    const updated = await EventBusinessRepository.update(businessId, data);

    if (updated.lead_carnet) {
      await EventBusinessMemberRepository.addMember({
        business_id: updated.id,
        carnet: updated.lead_carnet,
        role: 'Responsable'
      });
    }

    const decorated = await decorateBusiness(updated);
    return decorated;
  }

  static async deleteBusiness(eventId, businessId) {
    await this.getEventById(eventId);
    const business = await EventBusinessRepository.findById(businessId);
    if (!business || business.event_id !== Number(eventId)) {
      throw new Error('Negocio no encontrado para este evento');
    }

    await EventBusinessRepository.delete(businessId);
  }

  static async addBusinessMember(eventId, businessId, { carnet, role }) {
    if (!carnet || !role) {
      throw new Error('Carnet y rol son obligatorios');
    }

    await this.getEventById(eventId);
    const business = await EventBusinessRepository.findById(businessId);
    if (!business || business.event_id !== Number(eventId)) {
      throw new Error('Negocio no encontrado para este evento');
    }

    const member = await EventBusinessMemberRepository.addMember({
      business_id: businessId,
      carnet,
      role
    });

    return member;
  }

  static async removeBusinessMember(eventId, businessId, memberId) {
    await this.getEventById(eventId);
    const business = await EventBusinessRepository.findById(businessId);
    if (!business || business.event_id !== Number(eventId)) {
      throw new Error('Negocio no encontrado para este evento');
    }

    const member = await EventBusinessMemberRepository.findById(memberId);
    if (!member || member.business_id !== businessId) {
      throw new Error('Miembro no encontrado para este negocio');
    }

    await EventBusinessMemberRepository.removeMember(memberId);
  }
}
