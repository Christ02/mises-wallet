import express from 'express';
import { WalletController } from '../controllers/walletController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/balance', authenticate, WalletController.getBalance);
router.post('/send', authenticate, WalletController.sendTokens);
router.get('/history', authenticate, WalletController.getHistory);

export default router;

