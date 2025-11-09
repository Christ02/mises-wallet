import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { AdminUserController } from '../controllers/adminUserController.js';

const router = express.Router();

router.use(authenticate, authorize('admin', 'super_admin'));

router.get('/users', AdminUserController.list);
router.get('/users/roles', AdminUserController.roles);
router.post('/users', AdminUserController.create);
router.put('/users/:id', AdminUserController.update);
router.delete('/users/:id', AdminUserController.delete);

export default router;


