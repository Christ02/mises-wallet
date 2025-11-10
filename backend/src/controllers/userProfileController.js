import { UserProfileService } from '../services/userProfileService.js';

export class UserProfileController {
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const profile = await UserProfileService.getProfile(userId);
      return res.status(200).json(profile);
    } catch (error) {
      console.error('Error en getProfile:', error);
      return res.status(500).json({ error: 'Error al obtener el perfil del usuario' });
    }
  }
}


