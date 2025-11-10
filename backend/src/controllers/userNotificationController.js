import { UserNotificationService } from '../services/userNotificationService.js';

export class UserNotificationController {
  static async list(req, res) {
    try {
      const userId = req.user.id;
      const notifications = await UserNotificationService.getNotifications(userId);
      return res.status(200).json({ notifications });
    } catch (error) {
      console.error('Error en list notifications:', error);
      return res.status(500).json({ error: 'Error al obtener las notificaciones' });
    }
  }
}


