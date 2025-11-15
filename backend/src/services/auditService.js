import { AuditLogRepository } from '../repositories/auditLogRepository.js';

/**
 * Servicio de auditoría para registrar acciones del sistema
 */
export class AuditService {
  /**
   * Crea un log de auditoría
   * @param {Object} options - Opciones del log
   * @param {number|null} options.userId - ID del usuario que realiza la acción
   * @param {string} options.action - Acción realizada (login, create, update, delete, view, etc.)
   * @param {string|null} options.entity - Entidad afectada (user, event, business, etc.)
   * @param {number|string|null} options.entityId - ID de la entidad afectada
   * @param {string|null} options.description - Descripción de la acción
   * @param {Object|null} options.metadata - Metadatos adicionales
   * @param {string|null} options.ipAddress - Dirección IP del usuario
   * @param {string|null} options.userAgent - User agent del navegador
   */
  static async log({
    userId = null,
    action,
    entity = null,
    entityId = null,
    description = null,
    metadata = null,
    ipAddress = null,
    userAgent = null
  }) {
    try {
      await AuditLogRepository.create({
        user_id: userId,
        action,
        entity,
        entity_id: entityId,
        description,
        metadata,
        ip_address: ipAddress,
        user_agent: userAgent
      });
    } catch (error) {
      // No fallar la operación principal si el log falla
      console.error('Error creating audit log:', error);
    }
  }

  /**
   * Helper para obtener IP y User Agent de la request
   */
  static getRequestInfo(req) {
    if (!req) return { ipAddress: null, userAgent: null };
    
    const ipAddress = req.ip || 
                     req.connection?.remoteAddress || 
                     req.socket?.remoteAddress ||
                     (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
                     null;
    
    return {
      ipAddress,
      userAgent: req.headers['user-agent'] || null
    };
  }

  /**
   * Log de login
   */
  static async logLogin(userId, email, success, req) {
    const { ipAddress, userAgent } = AuditService.getRequestInfo(req);
    await AuditService.log({
      userId,
      action: 'login',
      entity: 'auth',
      description: success
        ? `Usuario ${email} inició sesión exitosamente`
        : `Intento de login fallido para ${email}`,
      metadata: {
        email,
        success
      },
      ipAddress,
      userAgent
    });
  }

  /**
   * Log de logout
   */
  static async logLogout(userId, email, req) {
    const { ipAddress, userAgent } = AuditService.getRequestInfo(req);
    await AuditService.log({
      userId,
      action: 'logout',
      entity: 'auth',
      description: `Usuario ${email} cerró sesión`,
      metadata: { email },
      ipAddress,
      userAgent
    });
  }

  /**
   * Log de creación (CREATE)
   */
  static async logCreate(userId, entity, entityId, description, metadata = null, req = null) {
    const requestInfo = req ? AuditService.getRequestInfo(req) : { ipAddress: null, userAgent: null };
    await AuditService.log({
      userId,
      action: 'create',
      entity,
      entityId,
      description: description || `Creó ${entity} con ID ${entityId}`,
      metadata,
      ...requestInfo
    });
  }

  /**
   * Log de lectura (READ/VIEW)
   */
  static async logView(userId, entity, entityId = null, description = null, req = null) {
    const requestInfo = req ? AuditService.getRequestInfo(req) : { ipAddress: null, userAgent: null };
    await AuditService.log({
      userId,
      action: 'view',
      entity,
      entityId,
      description: description || `Consultó ${entity}${entityId ? ` con ID ${entityId}` : ''}`,
      ...requestInfo
    });
  }

  /**
   * Log de actualización (UPDATE)
   */
  static async logUpdate(userId, entity, entityId, description, oldValues = null, newValues = null, req = null) {
    const requestInfo = req ? AuditService.getRequestInfo(req) : { ipAddress: null, userAgent: null };
    await AuditService.log({
      userId,
      action: 'update',
      entity,
      entityId,
      description: description || `Actualizó ${entity} con ID ${entityId}`,
      metadata: {
        oldValues,
        newValues
      },
      ...requestInfo
    });
  }

  /**
   * Log de eliminación (DELETE)
   */
  static async logDelete(userId, entity, entityId, description, metadata = null, req = null) {
    const requestInfo = req ? AuditService.getRequestInfo(req) : { ipAddress: null, userAgent: null };
    await AuditService.log({
      userId,
      action: 'delete',
      entity,
      entityId,
      description: description || `Eliminó ${entity} con ID ${entityId}`,
      metadata,
      ...requestInfo
    });
  }

  /**
   * Log de acciones personalizadas
   */
  static async logAction(userId, action, entity, entityId = null, description, metadata = null, req = null) {
    const requestInfo = req ? AuditService.getRequestInfo(req) : { ipAddress: null, userAgent: null };
    await AuditService.log({
      userId,
      action,
      entity,
      entityId,
      description,
      metadata,
      ...requestInfo
    });
  }
}

