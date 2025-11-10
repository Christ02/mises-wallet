import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { UserEventController } from '../controllers/userEventController.js';
import { UserProfileController } from '../controllers/userProfileController.js';
import { UserNotificationController } from '../controllers/userNotificationController.js';

const router = express.Router();

router.get('/profile', authenticate, UserProfileController.getProfile);
router.get('/events', authenticate, UserEventController.listEvents);
router.get('/events/organizer/:eventId', authenticate, UserEventController.organizerDetail);
router.post(
  '/events/:eventId/businesses/:businessId/settlement',
  authenticate,
  UserEventController.requestSettlement
);
router.get(
  '/events/:eventId/businesses/:businessId/settlement',
  authenticate,
  UserEventController.getSettlementStatus
);
router.get('/notifications', authenticate, UserNotificationController.list);

export default router;


