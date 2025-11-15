import fs from 'fs';
import { AdminEventService } from '../services/adminEventService.js';
import { buildEventImageUrl } from '../middleware/uploadMiddleware.js';
import { AuditService } from '../services/auditService.js';
import { EventBusinessRepository } from '../repositories/eventBusinessRepository.js';
import { EventBusinessMemberRepository } from '../repositories/eventBusinessMemberRepository.js';

export class AdminEventController {
  static async listEvents(req, res) {
    try {
      const events = await AdminEventService.listEvents();

      // No registrar log para listados automáticos (se registran demasiados logs innecesarios)
      
      res.status(200).json({ data: events });
    } catch (error) {
      res.status(500).json({ error: error.message || 'Error al obtener eventos' });
    }
  }

  static async getEvent(req, res) {
    try {
      const { eventId } = req.params;
      const event = await AdminEventService.getEventById(Number(eventId));

      // No registrar log para consultas de eventos individuales (se registran demasiados logs innecesarios)
      
      res.status(200).json({ data: event });
    } catch (error) {
      res.status(404).json({ error: error.message || 'Evento no encontrado' });
    }
  }

  static async createEvent(req, res) {
    try {
      const coverImageUrl = req.file ? buildEventImageUrl(req.file.filename) : undefined;
      const payload = {
        name: req.body.name,
        event_date: req.body.event_date,
        location: req.body.location,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        description: req.body.description,
        status: req.body.status,
        cover_image_url: coverImageUrl
      };
      const event = await AdminEventService.createEvent(payload);
      
      // Log de creación
      await AuditService.logCreate(
        req.user.id,
        'event',
        event.id,
        `Creó evento: ${event.name}`,
        {
          name: event.name,
          event_date: event.event_date,
          location: event.location,
          status: event.status
        },
        req
      );
      
      res.status(201).json({ message: 'Evento creado exitosamente', event });
    } catch (error) {
      if (req.file?.path) {
        fs.unlink(req.file.path, () => {});
      }
      res.status(400).json({ error: error.message || 'Error al crear evento' });
    }
  }

  static async updateEvent(req, res) {
    try {
      const { eventId } = req.params;
      const eventIdNum = Number(eventId);
      
      // Obtener evento anterior para el log
      const oldEvent = await AdminEventService.getEventById(eventIdNum);
      
      const coverImageUrl = req.file ? buildEventImageUrl(req.file.filename) : undefined;
      const updates = { ...req.body };
      if (coverImageUrl) {
        updates.cover_image_url = coverImageUrl;
      }
      const event = await AdminEventService.updateEvent(eventIdNum, updates);
      
      // Log de actualización
      await AuditService.logUpdate(
        req.user.id,
        'event',
        eventIdNum,
        `Actualizó evento: ${event.name}`,
        {
          name: oldEvent?.name,
          status: oldEvent?.status,
          location: oldEvent?.location
        },
        {
          name: event.name,
          status: event.status,
          location: event.location
        },
        req
      );
      
      res.status(200).json({ message: 'Evento actualizado', event });
    } catch (error) {
      if (req.file?.path) {
        fs.unlink(req.file.path, () => {});
      }
      res.status(400).json({ error: error.message || 'Error al actualizar evento' });
    }
  }

  static async deleteEvent(req, res) {
    try {
      const { eventId } = req.params;
      const eventIdNum = Number(eventId);
      
      // Obtener información del evento antes de eliminarlo
      const eventToDelete = await AdminEventService.getEventById(eventIdNum);
      
      await AdminEventService.deleteEvent(eventIdNum);
      
      // Log de eliminación
      await AuditService.logDelete(
        req.user.id,
        'event',
        eventIdNum,
        `Eliminó evento: ${eventToDelete?.name || eventId}`,
        {
          name: eventToDelete?.name,
          location: eventToDelete?.location
        },
        req
      );
      
      res.status(200).json({ message: 'Evento eliminado' });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Error al eliminar evento' });
    }
  }

  static async listBusinesses(req, res) {
    try {
      const { eventId } = req.params;
      const businesses = await AdminEventService.listBusinesses(Number(eventId));
      res.status(200).json({ data: businesses });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Error al obtener negocios' });
    }
  }

  static async createBusiness(req, res) {
    try {
      const { eventId } = req.params;
      const business = await AdminEventService.createBusiness(Number(eventId), req.body);
      
      // Log de creación
      await AuditService.logCreate(
        req.user.id,
        'business',
        business.id,
        `Creó negocio: ${business.name} en evento ${eventId}`,
        {
          name: business.name,
          event_id: eventId,
          group_id: business.group_id
        },
        req
      );
      
      res.status(201).json({ message: 'Negocio creado exitosamente', business });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Error al crear negocio' });
    }
  }

  static async updateBusiness(req, res) {
    try {
      const { eventId, businessId } = req.params;
      const businessIdNum = Number(businessId);
      
      // Obtener negocio anterior para el log
      const oldBusiness = await EventBusinessRepository.findById(businessIdNum);
      
      const business = await AdminEventService.updateBusiness(Number(eventId), businessIdNum, req.body);
      
      // Log de actualización
      await AuditService.logUpdate(
        req.user.id,
        'business',
        businessIdNum,
        `Actualizó negocio: ${business.name}`,
        {
          name: oldBusiness?.nombre,
          description: oldBusiness?.descripcion
        },
        {
          name: business.name,
          description: business.description
        },
        req
      );
      
      res.status(200).json({ message: 'Negocio actualizado', business });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Error al actualizar negocio' });
    }
  }

  static async deleteBusiness(req, res) {
    try {
      const { eventId, businessId } = req.params;
      const businessIdNum = Number(businessId);
      
      // Obtener información del negocio antes de eliminarlo
      const businessToDelete = await EventBusinessRepository.findById(businessIdNum);
      
      await AdminEventService.deleteBusiness(Number(eventId), businessIdNum);
      
      // Log de eliminación
      await AuditService.logDelete(
        req.user.id,
        'business',
        businessIdNum,
        `Eliminó negocio: ${businessToDelete?.nombre || businessId}`,
        {
          name: businessToDelete?.nombre,
          event_id: eventId
        },
        req
      );
      
      res.status(200).json({ message: 'Negocio eliminado' });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Error al eliminar negocio' });
    }
  }

  static async addBusinessMember(req, res) {
    try {
      const { eventId, businessId } = req.params;
      const member = await AdminEventService.addBusinessMember(Number(eventId), Number(businessId), req.body);
      
      // Log de acción
      await AuditService.logAction(
        req.user.id,
        'add_member',
        'business',
        businessId,
        `Agregó miembro al negocio: ${member.carnet}`,
        {
          business_id: businessId,
          carnet: member.carnet,
          role: member.role
        },
        req
      );
      
      res.status(201).json({ message: 'Usuario agregado al negocio', member });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Error al agregar usuario al negocio' });
    }
  }

  static async removeBusinessMember(req, res) {
    try {
      const { eventId, businessId, memberId } = req.params;
      
      // Obtener información del miembro antes de eliminarlo
      const memberToDelete = await EventBusinessMemberRepository.findDetailedById(Number(memberId));
      
      await AdminEventService.removeBusinessMember(Number(eventId), Number(businessId), Number(memberId));
      
      // Log de acción
      await AuditService.logAction(
        req.user.id,
        'remove_member',
        'business',
        businessId,
        `Removió miembro del negocio: ${memberToDelete?.carnet || memberId}`,
        {
          business_id: businessId,
          carnet: memberToDelete?.carnet,
          role: memberToDelete?.role
        },
        req
      );
      
      res.status(200).json({ message: 'Usuario removido del negocio' });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Error al remover usuario del negocio' });
    }
  }
}
