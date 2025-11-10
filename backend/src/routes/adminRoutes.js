import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { AdminUserController } from '../controllers/adminUserController.js';
import { AdminEventController } from '../controllers/adminEventController.js';
import { AdminTransactionController } from '../controllers/adminTransactionController.js';
import { AdminAuditController } from '../controllers/adminAuditController.js';
import { AdminReportController } from '../controllers/adminReportController.js';
import { CentralWalletController } from '../controllers/centralWalletController.js';
import { eventImageUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticate, authorize('admin', 'super_admin'));

const handleEventImageUpload = (req, res, next) => {
  eventImageUpload.single('cover_image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Usuarios
router.get('/users', AdminUserController.list);
router.get('/users/roles', AdminUserController.roles);
router.get('/users/search', AdminUserController.search);
router.post('/users', AdminUserController.create);
router.put('/users/:id', AdminUserController.update);
router.delete('/users/:id', AdminUserController.delete);

// Eventos
router.get('/events', AdminEventController.listEvents);
router.get('/events/:eventId', AdminEventController.getEvent);
router.post('/events', handleEventImageUpload, AdminEventController.createEvent);
router.put('/events/:eventId', handleEventImageUpload, AdminEventController.updateEvent);
router.delete('/events/:eventId', AdminEventController.deleteEvent);

// Negocios por evento
router.get('/events/:eventId/businesses', AdminEventController.listBusinesses);
router.post('/events/:eventId/businesses', AdminEventController.createBusiness);
router.put('/events/:eventId/businesses/:businessId', AdminEventController.updateBusiness);
router.delete('/events/:eventId/businesses/:businessId', AdminEventController.deleteBusiness);

// Miembros del negocio
router.post('/events/:eventId/businesses/:businessId/members', AdminEventController.addBusinessMember);
router.delete('/events/:eventId/businesses/:businessId/members/:memberId', AdminEventController.removeBusinessMember);

// Transacciones
router.get('/transactions', AdminTransactionController.list);

// Auditoría
router.get('/audit/logs', AdminAuditController.list);

// Reportes
router.get('/reports', AdminReportController.list);

// Wallet central
router.get('/central-wallet/status', CentralWalletController.status);

export default router;


