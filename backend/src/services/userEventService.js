import { EventRepository } from '../repositories/eventRepository.js';
import { EventBusinessRepository } from '../repositories/eventBusinessRepository.js';
import { EventBusinessMemberRepository } from '../repositories/eventBusinessMemberRepository.js';
import { UserRepository } from '../repositories/userRepository.js';
import { BusinessWalletService } from './businessWalletService.js';
import { SettlementService } from './settlementService.js';
import { CentralWalletService } from './centralWalletService.js';

const mapEventForUser = (event) => ({
  id: event.id,
  name: event.name,
  description: event.description,
  event_date: event.event_date,
  location: event.location,
  start_time: event.start_time,
  end_time: event.end_time,
  status: event.status,
  cover_image_url: event.cover_image_url
});

const mapOrganizerEvent = (event, membership) => ({
  ...mapEventForUser(event),
  isOrganizer: true,
  groupId: membership?.group_id || null
});

export class UserEventService {
  static async getUserEvents(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const [events, memberships] = await Promise.all([
      EventRepository.findUpcoming(),
      EventBusinessMemberRepository.findByUserCarnet(user.carnet_universitario)
    ]);

    const organizerEventsMap = new Map();
    if (memberships.length > 0) {
      const uniqueEventIds = Array.from(new Set(memberships.map((m) => m.event_id)));
      const eventFetchPromises = uniqueEventIds.map((eventId) => EventRepository.findById(eventId));
      const eventsById = await Promise.all(eventFetchPromises);
      const eventMap = new Map();
      eventsById.forEach((event) => {
        if (event) {
          eventMap.set(event.id, event);
        }
      });

      const businessIds = Array.from(new Set(memberships.map((m) => m.business_id)));
      const businessPromises = businessIds.map((businessId) => EventBusinessRepository.findById(businessId));
      const businessResults = await Promise.all(businessPromises);
      const businessMap = new Map();
      businessResults.forEach((business) => {
        if (business) {
          businessMap.set(business.id, business);
        }
      });

      for (const membership of memberships) {
        const event = eventMap.get(membership.event_id);
        if (!event) continue;
        const business = businessMap.get(membership.business_id) || {};
        if (!organizerEventsMap.has(event.id)) {
          organizerEventsMap.set(event.id, mapOrganizerEvent(event, { ...business, ...membership }));
        }
      }
    }

    const upcoming = events.map(mapEventForUser);
    const organizer = Array.from(organizerEventsMap.values());

    return {
      upcoming,
      organizer
    };
  }

  static async getOrganizerEventDetail(userId, eventId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const membership = await EventBusinessMemberRepository.findByEventAndCarnet(
      eventId,
      user.carnet_universitario
    );

    if (!membership) {
      throw new Error('No perteneces al equipo organizador de este evento');
    }

    const event = await EventRepository.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    const business = await EventBusinessRepository.findById(membership.business_id);
    if (!business) {
      throw new Error('Negocio organizador no encontrado');
    }

    const teamMembers = await EventBusinessMemberRepository.findDetailedByBusinessId(
      membership.business_id
    );

    const walletRecord = await BusinessWalletService.getWalletByBusinessId(membership.business_id);
    let walletBalance = 0;
    let walletAddress = walletRecord?.address || null;

    if (walletAddress) {
      try {
        const { balanceTokens } = await BusinessWalletService.getBalanceForBusiness(
          membership.business_id
        );
        walletBalance = balanceTokens;
      } catch (error) {
        console.error('Error obteniendo balance de wallet de negocio:', error);
      }
    }

    await CentralWalletService.ensureSettingsLoaded();
    const settlement = await SettlementService.getSettlementStatus(membership.business_id);

    return {
      event: {
        id: event.id,
        name: event.name,
        date: event.event_date,
        description: event.description,
        location: event.location,
        status: event.status
      },
      business: {
        id: business.id,
        name: business.name,
        groupId: business.group_id,
        leadCarnet: business.lead_carnet
      },
      wallet: {
        address: walletAddress,
        balance: walletBalance,
        tokenSymbol: CentralWalletService.getTokenSymbol()
      },
      settlement,
      members: teamMembers.map((member) => ({
        id: member.id,
        carnet: member.carnet,
        role: member.role,
        nombres: member.nombres,
        apellidos: member.apellidos,
        email: member.email
      }))
    };
  }
}


