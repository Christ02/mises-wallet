import fs from 'fs';
import { AdminEventService } from '../services/adminEventService.js';
import { buildEventImageUrl } from '../middleware/uploadMiddleware.js';

export class AdminEventController {
  static async listEvents(_req, res) {
    try {
      const events = await AdminEventService.listEvents();
      res.status(200).json({ data: events });
    } catch (error) {
      res.status(500).json({ error: error.message || 'Error al obtener eventos' });
    }
  }

  static async getEvent(req, res) {
    try {
      const { eventId } = req.params;
      const event = await AdminEventService.getEventById(Number(eventId));
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
      const coverImageUrl = req.file ? buildEventImageUrl(req.file.filename) : undefined;
      const updates = { ...req.body };
      if (coverImageUrl) {
        updates.cover_image_url = coverImageUrl;
      }
      const event = await AdminEventService.updateEvent(Number(eventId), updates);
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
      await AdminEventService.deleteEvent(Number(eventId));
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
      res.status(201).json({ message: 'Negocio creado exitosamente', business });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Error al crear negocio' });
    }
  }

  static async updateBusiness(req, res) {
    try {
      const { eventId, businessId } = req.params;
      const business = await AdminEventService.updateBusiness(Number(eventId), Number(businessId), req.body);
      res.status(200).json({ message: 'Negocio actualizado', business });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Error al actualizar negocio' });
    }
  }

  static async deleteBusiness(req, res) {
    try {
      const { eventId, businessId } = req.params;
      await AdminEventService.deleteBusiness(Number(eventId), Number(businessId));
      res.status(200).json({ message: 'Negocio eliminado' });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Error al eliminar negocio' });
    }
  }

  static async addBusinessMember(req, res) {
    try {
      const { eventId, businessId } = req.params;
      const member = await AdminEventService.addBusinessMember(Number(eventId), Number(businessId), req.body);
      res.status(201).json({ message: 'Usuario agregado al negocio', member });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Error al agregar usuario al negocio' });
    }
  }

  static async removeBusinessMember(req, res) {
    try {
      const { eventId, businessId, memberId } = req.params;
      await AdminEventService.removeBusinessMember(Number(eventId), Number(businessId), Number(memberId));
      res.status(200).json({ message: 'Usuario removido del negocio' });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Error al remover usuario del negocio' });
    }
  }
}
