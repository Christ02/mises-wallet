import { UserEventService } from '../services/userEventService.js';
import { SettlementService } from '../services/settlementService.js';

export class UserEventController {
  static async listEvents(req, res) {
    try {
      const userId = req.user.id;
      const events = await UserEventService.getUserEvents(userId);
      return res.status(200).json(events);
    } catch (error) {
      console.error('Error en listEvents:', error);
      return res.status(500).json({ error: 'Error al obtener eventos' });
    }
  }

  static async organizerDetail(req, res) {
    try {
      const userId = req.user.id;
      const { eventId } = req.params;
      const detail = await UserEventService.getOrganizerEventDetail(userId, Number(eventId));
      return res.status(200).json(detail);
    } catch (error) {
      console.error('Error en organizerDetail:', error);
      return res.status(400).json({ error: error.message || 'Error al obtener el detalle del evento' });
    }
  }

  static async requestSettlement(req, res) {
    try {
      const userId = req.user.id;
      const { eventId, businessId } = req.params;
      const { method, notes } = req.body || {};

      const request = await SettlementService.createSettlementRequest({
        userId,
        eventId: Number(eventId),
        businessId: Number(businessId),
        method,
        notes
      });

      return res.status(201).json(request);
    } catch (error) {
      console.error('Error en requestSettlement:', error);
      return res.status(400).json({ error: error.message || 'No se pudo crear la solicitud' });
    }
  }

  static async getSettlementStatus(req, res) {
    try {
      const userId = req.user.id;
      const { eventId, businessId } = req.params;

      await SettlementService.validateUserBelongsToBusiness(Number(eventId), Number(businessId), userId);
      const settlement = await SettlementService.getSettlementStatus(Number(businessId));

      return res.status(200).json(settlement || {});
    } catch (error) {
      console.error('Error en getSettlementStatus:', error);
      return res.status(400).json({ error: error.message || 'Error al obtener la solicitud' });
    }
  }
}


