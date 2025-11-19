export class SettingsController {
  /**
   * Obtener configuración de email actual
   */
  static async getEmailSettings(req, res) {
    try {
      const settings = {
        provider: process.env.EMAIL_PROVIDER || 'resend',
        resendApiKey: process.env.RESEND_API_KEY ? '***' : '',
        resendFromEmail: process.env.RESEND_FROM_EMAIL || '',
        mailtrapApiToken: process.env.MAILTRAP_API_TOKEN ? '***' : '',
        mailtrapFromEmail: process.env.MAILTRAP_FROM_EMAIL || '',
        mailtrapFromName: process.env.MAILTRAP_FROM_NAME || '',
      };

      res.json(settings);
    } catch (error) {
      console.error('Error obteniendo configuración de email:', error);
      res.status(500).json({ error: 'Error al obtener configuración de email' });
    }
  }

  /**
   * Guardar configuración de email
   * Actualiza las variables de entorno en Railway
   */
  static async saveEmailSettings(req, res) {
    try {
      const { provider, resendApiKey, resendFromEmail, mailtrapApiToken, mailtrapFromEmail, mailtrapFromName } = req.body;

      if (!provider || (provider === 'resend' && !resendApiKey) || (provider === 'mailtrap' && !mailtrapApiToken)) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      // Preparar variables para Railway
      const variables = [];

      // Siempre actualizar el provider
      variables.push(`EMAIL_PROVIDER=${provider}`);

      if (provider === 'resend') {
        if (resendApiKey && resendApiKey !== '***') {
          variables.push(`RESEND_API_KEY=${resendApiKey}`);
        }
        if (resendFromEmail) {
          variables.push(`RESEND_FROM_EMAIL=${resendFromEmail}`);
        }
      } else if (provider === 'mailtrap') {
        if (mailtrapApiToken && mailtrapApiToken !== '***') {
          variables.push(`MAILTRAP_API_TOKEN=${mailtrapApiToken}`);
        }
        if (mailtrapFromEmail) {
          variables.push(`MAILTRAP_FROM_EMAIL=${mailtrapFromEmail}`);
        }
        if (mailtrapFromName) {
          variables.push(`MAILTRAP_FROM_NAME=${mailtrapFromName}`);
        }
      }

      // Actualizar process.env para esta sesión
      variables.forEach(variable => {
        const [key, ...valueParts] = variable.split('=');
        const value = valueParts.join('=');
        process.env[key] = value;
      });

      console.log('✅ Configuración de email actualizada (solo para esta sesión)');
      
      // Intentar actualizar en Railway usando MCP
      let railwayUpdated = false;
      try {
        // Railway MCP solo está disponible en el contexto del servidor MCP, no en el backend
        // Por ahora, las variables se actualizan solo en process.env para esta sesión
        // El usuario debe actualizar manualmente en Railway dashboard para persistencia
        railwayUpdated = false;
      } catch (railwayError) {
        console.warn('No se pudo actualizar en Railway automáticamente');
      }

      res.json({
        message: railwayUpdated 
          ? 'Configuración de email guardada correctamente en Railway'
          : 'Configuración de email guardada correctamente (solo para esta sesión)',
        note: railwayUpdated 
          ? 'Las variables se actualizaron en Railway y están persistentes.'
          : 'Las variables se actualizaron para esta sesión. Para persistir en Railway después de reiniciar, actualiza las variables en el dashboard de Railway.',
        variables: variables.map(v => v.split('=')[0]), // Solo los nombres de las variables
        railwayUpdated
      });
    } catch (error) {
      console.error('Error guardando configuración de email:', error);
      res.status(500).json({ error: 'Error al guardar configuración de email' });
    }
  }
}

